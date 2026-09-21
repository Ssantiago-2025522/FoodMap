import { pool, conTransaccion } from '../config/db.js';
import { HttpError } from '../utils/http-error.js';
import { entero, texto } from '../utils/validar.js';
import { DISPONIBLE, VIGENTE } from '../utils/sql.js';
import { notificar } from '../helpers/notificar.js';

const SELECT_DETALLE = `
  SELECT s.id_solicitud, s.fecha_solicitud, s.estado, s.id_donacion, s.id_usuario,
         s.cantidad_solicitada, s.comentario,
         d.id_usuario AS id_donador,
         d.titulo AS titulo_donacion, d.descripcion AS descripcion_donacion,
         d.cantidad AS cantidad_donacion,
         u.municipio, u.departamento,
         sol.username AS username_solicitante, don.username AS username_donador,
         sol.correo AS correo_solicitante, sol.telefono AS telefono_solicitante,
         e.estado AS estado_entrega, c.id_chat
  FROM solicitud s
  JOIN donacion d  ON d.id_donacion = s.id_donacion
  JOIN ubicacion u ON u.id_ubicacion = d.id_ubicacion
  JOIN usuario sol ON sol.id_usuario = s.id_usuario
  JOIN usuario don ON don.id_usuario = d.id_usuario
  LEFT JOIN entrega e ON e.id_solicitud = s.id_solicitud
  LEFT JOIN chat c    ON c.id_solicitud = s.id_solicitud`;

function ocultarContacto(fila, idUsuario) {
  if (fila.id_donador === idUsuario) return fila;
  return { ...fila, correo_solicitante: null, telefono_solicitante: null };
}


export async function donacionesDisponibles(req, res) {
  const [filas] = await pool.query(
    `SELECT d.id_donacion, d.titulo, d.descripcion, ${DISPONIBLE} AS cantidad,
            d.fecha_vencimiento, d.imagen, u.municipio, u.departamento,
            don.username AS username_donador
     FROM donacion d
     JOIN ubicacion u ON u.id_ubicacion = d.id_ubicacion
     JOIN usuario don ON don.id_usuario = d.id_usuario
     WHERE ${VIGENTE}
       AND d.id_usuario <> ?
       AND ${DISPONIBLE} > 0
       AND NOT EXISTS (SELECT 1 FROM solicitud s
                       WHERE s.id_donacion = d.id_donacion AND s.id_usuario = ?)
     ORDER BY d.fecha_publicacion DESC, d.id_donacion DESC`,
    [req.idUsuario, req.idUsuario]
  );
  res.json(filas);
}

export async function listar(req, res) {
  const rol = req.query.rol;
  if (rol !== 'donador' && rol !== 'beneficiario') {
    throw new HttpError(400, "El rol debe ser 'donador' o 'beneficiario'.");
  }
  const columna = rol === 'donador' ? 'd.id_usuario' : 's.id_usuario'; // lista blanca, no viene del usuario
  const [filas] = await pool.query(
    `${SELECT_DETALLE} WHERE ${columna} = ? ORDER BY s.fecha_solicitud DESC, s.id_solicitud DESC`,
    [req.idUsuario]
  );
  res.json(filas.map((f) => ocultarContacto(f, req.idUsuario)));
}

export async function obtener(req, res) {
  const id = entero(req.params.id, 'El id de la solicitud');
  const [[fila]] = await pool.query(`${SELECT_DETALLE} WHERE s.id_solicitud = ?`, [id]);
  if (!fila) throw new HttpError(404, 'La solicitud no existe.');
  if (fila.id_usuario !== req.idUsuario && fila.id_donador !== req.idUsuario) {
    throw new HttpError(403, 'No tienes acceso a esta solicitud.');
  }
  res.json(ocultarContacto(fila, req.idUsuario));
}

export async function historial(req, res) {
  const [filas] = await pool.query(
    `SELECT s.id_solicitud, d.titulo AS titulo_donacion, s.fecha_solicitud, s.estado,
            e.estado AS estado_entrega,
            CASE WHEN e.estado = 'ENTREGADA' THEN e.fecha_entrega END AS fecha_entrega,
            e.observaciones,
            CASE WHEN d.id_usuario = ? THEN sol.username ELSE don.username END AS contraparte,
            CASE WHEN d.id_usuario = ? THEN 'donador' ELSE 'beneficiario' END AS rol
     FROM solicitud s
     JOIN donacion d  ON d.id_donacion = s.id_donacion
     JOIN usuario sol ON sol.id_usuario = s.id_usuario
     JOIN usuario don ON don.id_usuario = d.id_usuario
     LEFT JOIN entrega e ON e.id_solicitud = s.id_solicitud
     WHERE s.estado <> 'PENDIENTE' AND (s.id_usuario = ? OR d.id_usuario = ?)
     ORDER BY s.fecha_solicitud DESC, s.id_solicitud DESC`,
    [req.idUsuario, req.idUsuario, req.idUsuario, req.idUsuario]
  );
  res.json(filas);
}


export async function crear(req, res) {
  const idDonacion = entero(req.body?.id_donacion, 'id_donacion');
  const cantidad = entero(req.body?.cantidad_solicitada, 'La cantidad solicitada');
  const comentario = texto(req.body?.comentario, 255, 'El comentario');

  let idSolicitud;
  try {
    idSolicitud = await conTransaccion(async (conn) => {
      const [[solicitante]] = await conn.query(
        'SELECT username FROM usuario WHERE id_usuario = ?', [req.idUsuario]
      );
      if (!solicitante) throw new HttpError(404, 'El usuario no existe.');

      const [[don]] = await conn.query(
        `SELECT d.id_usuario, d.titulo, ${VIGENTE} AS vigente, ${DISPONIBLE} AS disponible
         FROM donacion d WHERE d.id_donacion = ?`,
        [idDonacion]
      );
      if (!don) throw new HttpError(404, 'La donación no existe.');
      if (don.id_usuario === req.idUsuario) {
        throw new HttpError(400, 'No puedes solicitar tu propia donación.');
      }
      if (!don.vigente || don.disponible <= 0) {
        throw new HttpError(409, 'La donación ya no está disponible.');
      }
      if (cantidad > don.disponible) {
        throw new HttpError(400, `Solo hay ${don.disponible} disponible(s) de esta donación.`);
      }

      const [r] = await conn.query(
        `INSERT INTO solicitud (id_donacion, id_usuario, cantidad_solicitada, comentario)
         VALUES (?, ?, ?, ?)`,
        [idDonacion, req.idUsuario, cantidad, comentario]
      );
      await notificar(
        conn, don.id_usuario, 'Nueva solicitud',
        `${solicitante.username} solicitó ${cantidad} de "${don.titulo}".`
      );
      return r.insertId;
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Ya solicitaste esta donación.');
    throw error;
  }

  const [[fila]] = await pool.query('SELECT * FROM solicitud WHERE id_solicitud = ?', [idSolicitud]);
  res.status(201).json(fila);
}

async function bloquearSolicitud(conn, id) {
  const [[s]] = await conn.query(
    `SELECT s.id_solicitud, s.estado, s.id_usuario, s.cantidad_solicitada,
            d.id_donacion, d.id_usuario AS id_donador, d.titulo, d.estado AS donacion_activa
     FROM solicitud s
     JOIN donacion d ON d.id_donacion = s.id_donacion
     WHERE s.id_solicitud = ? FOR UPDATE`,
    [id]
  );
  if (!s) throw new HttpError(404, 'La solicitud no existe.');
  return s;
}

async function nombreDe(conn, idUsuario) {
  const [[u]] = await conn.query('SELECT username FROM usuario WHERE id_usuario = ?', [idUsuario]);
  return u?.username ?? 'Un usuario';
}

export async function aceptar(req, res) {
  const id = entero(req.params.id, 'El id de la solicitud');

  const resultado = await conTransaccion(async (conn) => {
    const s = await bloquearSolicitud(conn, id);
    if (s.id_donador !== req.idUsuario) {
      throw new HttpError(403, 'Solo el donador puede responder esta solicitud.');
    }
    if (s.estado !== 'PENDIENTE') throw new HttpError(409, 'La solicitud ya fue respondida.');

    const [[{ disponible }]] = await conn.query(
      `SELECT ${DISPONIBLE} AS disponible FROM donacion d WHERE d.id_donacion = ?`,
      [s.id_donacion]
    );
    if (!s.donacion_activa || s.cantidad_solicitada > disponible) {
      throw new HttpError(409, 'La donación ya no tiene esa cantidad disponible.');
    }

    await conn.query("UPDATE solicitud SET estado = 'ACEPTADA' WHERE id_solicitud = ?", [id]);
    if (disponible - s.cantidad_solicitada <= 0) {
      await conn.query('UPDATE donacion SET estado = FALSE WHERE id_donacion = ?', [s.id_donacion]);
    }
    await conn.query('INSERT INTO chat (id_solicitud) VALUES (?)', [id]);
    await conn.query("INSERT INTO entrega (estado, id_solicitud) VALUES ('PENDIENTE', ?)", [id]);

    const donador = await nombreDe(conn, req.idUsuario);
    await notificar(
      conn, s.id_usuario, 'Solicitud aceptada',
      `${donador} aceptó tu solicitud de "${s.titulo}". Ya pueden coordinar por el chat.`
    );

    const [[solicitud]] = await conn.query('SELECT * FROM solicitud WHERE id_solicitud = ?', [id]);
    const [[chat]] = await conn.query('SELECT * FROM chat WHERE id_solicitud = ?', [id]);
    const [[entrega]] = await conn.query('SELECT * FROM entrega WHERE id_solicitud = ?', [id]);
    return { solicitud, chat, entrega };
  });

  res.json(resultado);
}

export async function rechazar(req, res) {
  const id = entero(req.params.id, 'El id de la solicitud');

  const solicitud = await conTransaccion(async (conn) => {
    const s = await bloquearSolicitud(conn, id);
    if (s.id_donador !== req.idUsuario) {
      throw new HttpError(403, 'Solo el donador puede responder esta solicitud.');
    }
    if (s.estado !== 'PENDIENTE') throw new HttpError(409, 'La solicitud ya fue respondida.');

    await conn.query("UPDATE solicitud SET estado = 'RECHAZADA' WHERE id_solicitud = ?", [id]);

    const donador = await nombreDe(conn, req.idUsuario);
    await notificar(
      conn, s.id_usuario, 'Solicitud rechazada',
      `${donador} rechazó tu solicitud de "${s.titulo}".`
    );

    const [[fila]] = await conn.query('SELECT * FROM solicitud WHERE id_solicitud = ?', [id]);
    return fila;
  });

  res.json(solicitud);
}

export async function confirmarRecepcion(req, res) {
  const id = entero(req.params.id, 'El id de la solicitud');
  const observaciones = texto(req.body?.observaciones, 255, 'Las observaciones');

  const entrega = await conTransaccion(async (conn) => {
    const s = await bloquearSolicitud(conn, id);
    if (s.id_usuario !== req.idUsuario) {
      throw new HttpError(403, 'Solo quien solicitó la donación puede confirmar la recepción.');
    }
    if (s.estado !== 'ACEPTADA') throw new HttpError(409, 'La solicitud aún no fue aceptada.');

    const [[e]] = await conn.query('SELECT * FROM entrega WHERE id_solicitud = ? FOR UPDATE', [id]);
    if (!e) throw new HttpError(404, 'La solicitud no tiene una entrega registrada.');
    if (e.estado === 'ENTREGADA') throw new HttpError(409, 'La recepción ya fue confirmada.');

    await conn.query(
      `UPDATE entrega
       SET estado = 'ENTREGADA', fecha_entrega = CURDATE(), hora_entrega = CURTIME(), observaciones = ?
       WHERE id_entrega = ?`,
      [observaciones, e.id_entrega]
    );

    const beneficiario = await nombreDe(conn, req.idUsuario);
    await notificar(
      conn, s.id_donador, 'Entrega confirmada',
      `${beneficiario} confirmó la recepción de "${s.titulo}".`
    );

    const [[fila]] = await conn.query('SELECT * FROM entrega WHERE id_entrega = ?', [e.id_entrega]);
    return fila;
  });

  res.json(entrega);
}
