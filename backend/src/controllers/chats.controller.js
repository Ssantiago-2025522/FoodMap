const { pool } = require('../config/db.js');
const { HttpError } = require('../utils/http-error.js');
const { entero, texto } = require('../utils/validar.js');

const SELECT_CHAT = `
  SELECT c.id_chat, c.fecha_creacion, c.id_solicitud,
         d.titulo AS titulo_donacion,
         s.id_usuario AS id_beneficiario, d.id_usuario AS id_donador,
         sol.username AS username_beneficiario, don.username AS username_donador,
         lm.contenido AS ultimo_mensaje, lm.fecha_envio AS fecha_ultimo_mensaje
  FROM chat c
  JOIN solicitud s ON s.id_solicitud = c.id_solicitud
  JOIN donacion d  ON d.id_donacion = s.id_donacion
  JOIN usuario sol ON sol.id_usuario = s.id_usuario
  JOIN usuario don ON don.id_usuario = d.id_usuario
  LEFT JOIN mensaje lm ON lm.id_mensaje = (
      SELECT m.id_mensaje FROM mensaje m
      WHERE m.id_chat = c.id_chat
      ORDER BY m.fecha_envio DESC, m.id_mensaje DESC LIMIT 1)`;

function aResumen(f, idUsuario) {
  const soyDonador = Number(f.id_donador) === Number(idUsuario);
  return {
    id_chat: f.id_chat,
    fecha_creacion: f.fecha_creacion,
    id_solicitud: f.id_solicitud,
    titulo_donacion: f.titulo_donacion,
    username_contraparte: soyDonador ? f.username_beneficiario : f.username_donador,
    ultimo_mensaje: f.ultimo_mensaje,
    fecha_ultimo_mensaje: f.fecha_ultimo_mensaje,
  };
}

async function cargarChat(idChat, idUsuario) {
  const [[fila]] = await pool.query(`${SELECT_CHAT} WHERE c.id_chat = ?`, [idChat]);
  if (!fila) throw new HttpError(404, 'El chat no existe.');
  if (Number(fila.id_donador) !== Number(idUsuario) && Number(fila.id_beneficiario) !== Number(idUsuario)) {
    throw new HttpError(403, 'No participas en este chat.');
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
    `SELECT m.id_mensaje, m.contenido, m.fecha_envio, m.id_chat, m.id_usuario, u.username
     FROM mensaje m JOIN usuario u ON u.id_usuario = m.id_usuario
     WHERE m.id_chat = ?
     ORDER BY m.fecha_envio DESC, m.id_mensaje DESC
     LIMIT 500`,
    [idChat]
  );
  res.json({ chat: aResumen(fila, idUsuario), mensajes: recientes.reverse() });
}

async function enviarMensaje(req, res) {
  const idUsuario = req.usuario.id_usuario;
  const idChat = entero(req.params.id, 'El id del chat');
  const contenido = texto(req.body?.contenido, 255, 'El mensaje');
  if (!contenido) throw new HttpError(400, 'El mensaje no puede estar vacío.');

  await cargarChat(idChat, idUsuario);

  const [r] = await pool.query(
    'INSERT INTO mensaje (contenido, id_chat, id_usuario) VALUES (?, ?, ?)',
    [contenido, idChat, idUsuario]
  );
  const [[mensaje]] = await pool.query(
    `SELECT m.id_mensaje, m.contenido, m.fecha_envio, m.id_chat, m.id_usuario, u.username
     FROM mensaje m JOIN usuario u ON u.id_usuario = m.id_usuario
     WHERE m.id_mensaje = ?`,
    [r.insertId]
  );
  res.status(201).json(mensaje);
}

module.exports = { listar, obtener, enviarMensaje };
