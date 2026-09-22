const { pool, conTransaccion } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { entero, texto } = require('../utils/validar');
const { DISPONIBLE, VIGENTE } = require('../utils/sql');
const { notificar } = require('../helpers/notificar');

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

async function donacionesDisponibles(req, res, next) {
  try {
    const idUsuario = req.usuario.id_usuario;
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
      [idUsuario, idUsuario]
    );
    res.json(filas);
  } catch (error) {
    next(error);
  }
}

async function listar(req, res, next) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const rol = req.query.rol;
    if (rol !== 'donador' && rol !== 'beneficiario') {
      throw new ApiError(400, "El rol debe ser 'donador' o 'beneficiario'.");
    }
    const columna = rol === 'donador' ? 'd.id_usuario' : 's.id_usuario'; // lista blanca, no viene del usuario
    const [filas] = await pool.query(
      `${SELECT_DETALLE} WHERE ${columna} = ? ORDER BY s.fecha_solicitud DESC, s.id_solicitud DESC`,
      [idUsuario]
    );
    res.json(filas.map((f) => ocultarContacto(f, idUsuario)));
  } catch (error) {
    next(error);
  }
}

async function obtener(req, res, next) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const id = entero(req.params.id, 'El id de la solicitud');
    const [[fila]] = await pool.query(`${SELECT_DETALLE} WHERE s.id_solicitud = ?`, [id]);
    if (!fila) throw new ApiError(404, 'La solicitud no existe.');
    if (fila.id_usuario !== idUsuario && fila.id_donador !== idUsuario) {
      throw new ApiError(403, 'No tienes acceso a esta solicitud.');
    }
    res.json(ocultarContacto(fila, idUsuario));
  } catch (error) {
    next(error);
  }
}

async function historial(req, res, next) {
  try {
    const idUsuario = req.usuario.id_usuario;
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
      [idUsuario, idUsuario, idUsuario, idUsuario]
    );
    res.json(filas);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const idDonacion = entero(req.body?.id_donacion, 'id_donacion');
    const cantidad = entero(req.body?.cantidad_solicitada, 'La cantidad solicitada');
    const comentario = texto(req.body?.comentario, 255, 'El comentario');

    let idSolicitud;
    try {
      idSolicitud = await conTransaccion(async (conn) => {
        const [[solicitante]] = await conn.query(
          'SELECT username FROM usuario WHERE id_usuario = ?', [idUsuario]
        );
        if (!solicitante) throw new ApiError(404, 'El usuario no existe.');

        const [[don]] = await conn.query(
          `SELECT d.id_usuario, d.titulo, ${VIGENTE} AS vigente, ${DISPONIBLE} AS disponible
           FROM donacion d WHERE d.id_donacion = ?`,
          [idDonacion]
        );
        if (!don) throw new ApiError(404, 'La donación no existe.');
        if (don.id_usuario === idUsuario) {
          throw new ApiError(400, 'No puedes solicitar tu propia donación.');
        }
        if (!don.vigente || don.disponible <= 0) {
          throw new ApiError(409, 'La donación ya no está disponible.');
        }
        if (cantidad > don.disponible) {
          throw new ApiError(400, `Solo hay ${don.disponible} disponible(s) de esta donación.`);
        }

        const [r] = await conn.query(
          `INSERT INTO solicitud (id_donacion, id_usuario, cantidad_solicitada, comentario)
           VALUES (?, ?, ?, ?)`,
          [idDonacion, idUsuario, cantidad, comentario]
        );
        await notificar(
          conn, don.id_usuario, 'Nueva solicitud',
          `${solicitante.username} solicitó ${cantidad} de "${don.titulo}".`
        );
        return r.insertId;
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'Ya solicitaste esta donación.');
      throw error;
    }

    const [[fila]] = await pool.query('SELECT * FROM solicitud WHERE id_solicitud = ?', [idSolicitud]);
    res.status(201).json(fila);
  } catch (error) {
    next(error);
  }
}

async function bloquearSolicitud(conn, id) {
  const [[s]] = await conn.query(
    `SELECT s.id_solicitud, s.estado, s.id_usuario, s.cantidad_solicitada,
            d.id_donacion, d.id_usuario AS id_donador, d.titulo, d.estado AS estado_donacion
     FROM solicitud s
     JOIN donacion d ON d.id_donacion = s.id_donacion
     WHERE s.id_solicitud = ? FOR UPDATE`,
    [id]
  );
  if (!s) throw new ApiError(404, 'La solicitud no existe.');
  return s;
}

async function nombreDe(conn, idUsuario) {
  const [[u]] = await conn.query('SELECT username FROM usuario WHERE id_usuario = ?', [idUsuario]);
  return u?.username ?? 'Un usuario';
}

async function aceptar(req, res, next) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const id = entero(req.params.id, 'El id de la solicitud');

    const resultado = await conTransaccion(async (conn) => {
      const s = await bloquearSolicitud(conn, id);
      if (s.id_donador !== idUsuario) {
        throw new ApiError(403, 'Solo el donador puede responder esta solicitud.');
      }
      if (s.estado !== 'PENDIENTE') throw new ApiError(409, 'La solicitud ya fue respondida.');

      const [[{ disponible }]] = await conn.query(
        `SELECT ${DISPONIBLE} AS disponible FROM donacion d WHERE d.id_donacion = ?`,
        [s.id_donacion]
      );
      if (s.estado_donacion !== 'Disponible' || s.cantidad_solicitada > disponible) {
        throw new ApiError(409, 'La donación ya no tiene esa cantidad disponible.');
      }

      await conn.query("UPDATE solicitud SET estado = 'ACEPTADA' WHERE id_solicitud = ?", [id]);
      if (disponible - s.cantidad_solicitada <= 0) {
        await conn.query("UPDATE donacion SET estado = 'Reservada' WHERE id_donacion = ?", [s.id_donacion]);
      }
      await conn.query('INSERT INTO chat (id_solicitud) VALUES (?)', [id]);
      await conn.query("INSERT INTO entrega (estado, id_solicitud) VALUES ('PENDIENTE', ?)", [id]);

      const donador = await nombreDe(conn, idUsuario);
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
  } catch (error) {
    next(error);
  }
}

async function rechazar(req, res, next) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const id = entero(req.params.id, 'El id de la solicitud');

    const solicitud = await conTransaccion(async (conn) => {
      const s = await bloquearSolicitud(conn, id);
      if (s.id_donador !== idUsuario) {
        throw new ApiError(403, 'Solo el donador puede responder esta solicitud.');
      }
      if (s.estado !== 'PENDIENTE') throw new ApiError(409, 'La solicitud ya fue respondida.');

      await conn.query("UPDATE solicitud SET estado = 'RECHAZADA' WHERE id_solicitud = ?", [id]);

      const donador = await nombreDe(conn, idUsuario);
      await notificar(
        conn, s.id_usuario, 'Solicitud rechazada',
        `${donador} rechazó tu solicitud de "${s.titulo}".`
      );

      const [[fila]] = await conn.query('SELECT * FROM solicitud WHERE id_solicitud = ?', [id]);
      return fila;
    });

    res.json(solicitud);
  } catch (error) {
    next(error);
  }
}

async function confirmarRecepcion(req, res, next) {
  try {
    const idUsuario = req.usuario.id_usuario;
    const id = entero(req.params.id, 'El id de la solicitud');
    const observaciones = texto(req.body?.observaciones, 255, 'Las observaciones');

    const entrega = await conTransaccion(async (conn) => {
      const s = await bloquearSolicitud(conn, id);
      if (s.id_usuario !== idUsuario) {
        throw new ApiError(403, 'Solo quien solicitó la donación puede confirmar la recepción.');
      }
      if (s.estado !== 'ACEPTADA') throw new ApiError(409, 'La solicitud aún no fue aceptada.');

      const [[e]] = await conn.query('SELECT * FROM entrega WHERE id_solicitud = ? FOR UPDATE', [id]);
      if (!e) throw new ApiError(404, 'La solicitud no tiene una entrega registrada.');
      if (e.estado === 'ENTREGADA') throw new ApiError(409, 'La recepción ya fue confirmada.');

      await conn.query(
        `UPDATE entrega
         SET estado = 'ENTREGADA', fecha_entrega = CURDATE(), hora_entrega = CURTIME(), observaciones = ?
         WHERE id_entrega = ?`,
        [observaciones, e.id_entrega]
      );

      const beneficiario = await nombreDe(conn, idUsuario);
      await notificar(
        conn, s.id_donador, 'Entrega confirmada',
        `${beneficiario} confirmó la recepción de "${s.titulo}".`
      );

      const [[fila]] = await conn.query('SELECT * FROM entrega WHERE id_entrega = ?', [e.id_entrega]);
      return fila;
    });

    res.json(entrega);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  donacionesDisponibles,
  listar,
  obtener,
  historial,
  crear,
  aceptar,
  rechazar,
  confirmarRecepcion
};
