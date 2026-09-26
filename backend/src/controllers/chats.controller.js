const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { entero, texto } = require('../utils/validar');

const SELECT_CHAT = `
  SELECT c.id_chat, c.fecha_creacion, c.id_solicitud,
         s.id_usuario AS id_beneficiario,
         d.id_usuario AS id_donador,
         ub.username AS beneficiario_username,
         ud.username AS donador_username,
         d.titulo AS titulo_donacion,
         lm.contenido AS ultimo_mensaje,
         lm.fecha_envio AS ultima_fecha
  FROM chat c
  JOIN solicitud s ON s.id_solicitud = c.id_solicitud
  JOIN donacion d ON d.id_donacion = s.id_donacion
  JOIN usuario ub ON ub.id_usuario = s.id_usuario
  JOIN usuario ud ON ud.id_usuario = d.id_usuario
  LEFT JOIN mensaje lm ON lm.id_mensaje = (
      SELECT m.id_mensaje
      FROM mensaje m
      WHERE m.id_chat = c.id_chat
      ORDER BY m.fecha_envio DESC, m.id_mensaje DESC
      LIMIT 1
  )
`;

function aResumen(f, idUsuario) {

  const soyDonador = Number(f.id_donador) === Number(idUsuario);

  return {
    id_chat: f.id_chat,
    fecha_creacion: f.fecha_creacion,
    id_solicitud: f.id_solicitud,
    titulo_donacion: f.titulo_donacion,
    username_contraparte: soyDonador
      ? f.beneficiario_username
      : f.donador_username,
    ultimo_mensaje: f.ultimo_mensaje,
    fecha_ultimo_mensaje: f.ultima_fecha
  };

}

async function cargarChat(idChat, idUsuario) {
  const [[fila]] = await pool.query(
    `${SELECT_CHAT} WHERE c.id_chat = ?`,
    [idChat]
  );

  if (!fila) {
    throw new ApiError(404, 'El chat no existe.');
  }

  if (
    Number(fila.id_donador) !== Number(idUsuario) &&
    Number(fila.id_beneficiario) !== Number(idUsuario)
  ) {
    throw new ApiError(403, 'No participas en este chat.');
  }

  return fila;
}

async function listar(req, res) {
  const idUsuario = req.usuario.id_usuario;

  const [filas] = await pool.query(
    `${SELECT_CHAT}
     WHERE s.id_usuario = ? OR d.id_usuario = ?
     ORDER BY COALESCE(lm.fecha_envio, c.fecha_creacion) DESC, c.id_chat DESC`,
    [idUsuario, idUsuario]
  );

  res.json(filas.map((f) => aResumen(f, idUsuario)));
}

async function obtener(req, res) {
  const idUsuario = req.usuario.id_usuario;
  const idChat = entero(req.params.id, 'El id del chat');

  const fila = await cargarChat(idChat, idUsuario);

  const [recientes] = await pool.query(
    `SELECT m.id_mensaje, m.contenido, m.fecha_envio,
            m.id_chat, m.id_usuario, u.username
     FROM mensaje m
     JOIN usuario u ON u.id_usuario = m.id_usuario
     WHERE m.id_chat = ?
     ORDER BY m.fecha_envio DESC, m.id_mensaje DESC
     LIMIT 500`,
    [idChat]
  );

  res.json({
    chat: aResumen(fila, idUsuario),
    mensajes: recientes.reverse()
  });
}

async function enviarMensaje(req, res) {
  const idUsuario = req.usuario.id_usuario;
  const idChat = entero(req.params.id, 'El id del chat');

  const contenido = texto(
    req.body?.contenido,
    255,
    'El mensaje'
  );

  if (!contenido) {
    throw new ApiError(400, 'El mensaje no puede estar vacío.');
  }

  await cargarChat(idChat, idUsuario);

  const [r] = await pool.query(
    'INSERT INTO mensaje (contenido, id_chat, id_usuario) VALUES (?, ?, ?)',
    [contenido, idChat, idUsuario]
  );

  const [[mensaje]] = await pool.query(
    `SELECT m.id_mensaje, m.contenido, m.fecha_envio,
            m.id_chat, m.id_usuario, u.username
     FROM mensaje m
     JOIN usuario u ON u.id_usuario = m.id_usuario
     WHERE m.id_mensaje = ?`,
    [r.insertId]
  );

  res.status(201).json(mensaje);
}

module.exports = {
  listar,
  obtener,
  enviarMensaje
};