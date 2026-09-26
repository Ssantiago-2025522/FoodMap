const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');
const { entero, texto } = require('../utils/validar');

async function obtenerEntrega(idEntrega) {
  const [[fila]] = await pool.query(
    `SELECT
       e.id_entrega,
       e.id_solicitud,
       e.estado,
       s.id_usuario AS id_beneficiario,
       d.id_usuario AS id_donador
     FROM entrega e
     JOIN solicitud s ON s.id_solicitud = e.id_solicitud
     JOIN donacion d ON d.id_donacion = s.id_donacion
     WHERE e.id_entrega = ?`,
    [idEntrega]
  );

  return fila;
}

async function crear(req, res) {
  const idUsuario = req.usuario.id_usuario;

  const idEntrega = entero(
    req.body?.id_entrega,
    'El id de la entrega'
  );

  const puntuacion = entero(
    req.body?.puntuacion,
    'La puntuación'
  );

  const comentario = texto(
    req.body?.comentario ?? '',
    255,
    'El comentario'
  ) || '';

  if (puntuacion < 1 || puntuacion > 5) {
    throw new ApiError(
      400,
      'La puntuación debe estar entre 1 y 5.'
    );
  }

  const entrega = await obtenerEntrega(idEntrega);

  if (!entrega) {
    throw new ApiError(404, 'La entrega no existe.');
  }

if (entrega.estado !== 'ENTREGADA') {
  throw new ApiError(400, 'Solo puedes calificar una entrega que ya fue completada.');
}

  const participa =
    Number(entrega.id_beneficiario) === Number(idUsuario) ||
    Number(entrega.id_donador) === Number(idUsuario);

  if (!participa) {
    throw new ApiError(
      403,
      'No participas en esta entrega.'
    );
  }

  const [existente] = await pool.query(
    `SELECT id_calificacion
     FROM calificacion
     WHERE id_usuario = ? AND id_entrega = ?`,
    [idUsuario, idEntrega]
  );

  if (existente.length > 0) {
    throw new ApiError(
      409,
      'Ya calificaste esta entrega.'
    );
  }

  const [resultado] = await pool.query(
    `INSERT INTO calificacion
      (puntuacion, comentario, id_usuario, id_entrega)
     VALUES (?, ?, ?, ?)`,
    [
      puntuacion,
      comentario,
      idUsuario,
      idEntrega
    ]
  );

  const [[calificacion]] = await pool.query(
    `SELECT
       id_calificacion,
       puntuacion,
       comentario,
       fecha,
       id_usuario,
       id_entrega
     FROM calificacion
     WHERE id_calificacion = ?`,
    [resultado.insertId]
  );

  res.status(201).json(calificacion);
}

async function listarPorEntrega(req, res) {
  const idEntrega = entero(
    req.params.idEntrega,
    'El id de la entrega'
  );

  const [calificaciones] = await pool.query(
    `SELECT
       c.id_calificacion,
       c.puntuacion,
       c.comentario,
       c.fecha,
       c.id_usuario,
       c.id_entrega,
       u.username
     FROM calificacion c
     JOIN usuario u ON u.id_usuario = c.id_usuario
     WHERE c.id_entrega = ?
     ORDER BY c.fecha DESC`,
    [idEntrega]
  );

  res.json(calificaciones);
}

module.exports = {
  crear,
  listarPorEntrega
};