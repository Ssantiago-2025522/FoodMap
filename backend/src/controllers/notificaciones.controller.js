import { pool } from '../config/db.js';
import { HttpError } from '../utils/http-error.js';
import { entero } from '../utils/validar.js';
import { DISPONIBLE, VIGENTE } from '../utils/sql.js';
import { recortar } from '../helpers/notificar.js';

const TITULO_CERCANO = 'Alimento cercano';
const RADIO_MAXIMO_KM = 50;

export async function listar(req, res) {
  const soloNoLeidas = req.query.leida === 'false';
  const [filas] = await pool.query(
    `SELECT id_notificacion, titulo, mensaje, fecha, leida, id_usuario
     FROM notificacion
     WHERE id_usuario = ? ${soloNoLeidas ? 'AND leida = FALSE' : ''}
     ORDER BY fecha DESC, id_notificacion DESC
     LIMIT 200`,
    [req.idUsuario]
  );
  res.json(filas);
}

export async function marcarLeida(req, res) {
  const id = entero(req.params.id, 'El id de la notificación');
  const [r] = await pool.query(
    'UPDATE notificacion SET leida = TRUE WHERE id_notificacion = ? AND id_usuario = ?',
    [id, req.idUsuario]
  );
  if (r.affectedRows === 0) throw new HttpError(404, 'La notificación no existe.');

  const [[fila]] = await pool.query(
    `SELECT id_notificacion, titulo, mensaje, fecha, leida, id_usuario
     FROM notificacion WHERE id_notificacion = ?`,
    [id]
  );
  res.json(fila);
}

export async function marcarTodasLeidas(req, res) {
  const [r] = await pool.query(
    'UPDATE notificacion SET leida = TRUE WHERE id_usuario = ? AND leida = FALSE',
    [req.idUsuario]
  );
  res.json({ actualizadas: r.affectedRows });
}

export async function generarCercanas(req, res) {
  const latitud = Number(req.body?.latitud);
  const longitud = Number(req.body?.longitud);
  const radioKm = Number(req.body?.radio_km ?? 5);

  if (!Number.isFinite(latitud) || latitud < -90 || latitud > 90) {
    throw new HttpError(400, 'La latitud debe estar entre -90 y 90.');
  }
  if (!Number.isFinite(longitud) || longitud < -180 || longitud > 180) {
    throw new HttpError(400, 'La longitud debe estar entre -180 y 180.');
  }
  if (!Number.isFinite(radioKm) || radioKm <= 0 || radioKm > RADIO_MAXIMO_KM) {
    throw new HttpError(400, `El radio debe ser mayor a 0 y de máximo ${RADIO_MAXIMO_KM} km.`);
  }

  const [cercanas] = await pool.query(
    `SELECT d.id_donacion, d.titulo, u.municipio, don.username AS donador,
            (6371 * ACOS(LEAST(1, GREATEST(-1,
               COS(RADIANS(?)) * COS(RADIANS(u.latitud)) * COS(RADIANS(u.longitud) - RADIANS(?))
             + SIN(RADIANS(?)) * SIN(RADIANS(u.latitud)))))) AS distancia_km
     FROM donacion d
     JOIN ubicacion u ON u.id_ubicacion = d.id_ubicacion
     JOIN usuario don ON don.id_usuario = d.id_usuario
     WHERE ${VIGENTE}
       AND d.id_usuario <> ?
       AND u.latitud IS NOT NULL AND u.longitud IS NOT NULL
       AND ${DISPONIBLE} > 0
       AND NOT EXISTS (SELECT 1 FROM solicitud s
                       WHERE s.id_donacion = d.id_donacion AND s.id_usuario = ?)
     HAVING distancia_km <= ?
     ORDER BY distancia_km ASC
     LIMIT 20`,
    [latitud, longitud, latitud, req.idUsuario, req.idUsuario, radioKm]
  );

  if (cercanas.length === 0) return res.json({ generadas: 0 });

  const mensajes = cercanas.map((c) =>
    recortar(`"${c.titulo}" (de ${c.donador}) está disponible cerca de ti, en ${c.municipio}.`, 255)
  );

  const [existentes] = await pool.query(
    'SELECT mensaje FROM notificacion WHERE id_usuario = ? AND titulo = ? AND mensaje IN (?)',
    [req.idUsuario, TITULO_CERCANO, mensajes]
  );
  const yaEnviados = new Set(existentes.map((e) => e.mensaje));
  const nuevos = mensajes.filter((m) => !yaEnviados.has(m));

  if (nuevos.length > 0) {
    await pool.query(
      'INSERT INTO notificacion (titulo, mensaje, id_usuario) VALUES ?',
      [nuevos.map((m) => [TITULO_CERCANO, m, req.idUsuario])]
    );
  }
  res.json({ generadas: nuevos.length });
}
