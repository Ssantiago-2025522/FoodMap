const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const ApiError = require('../utils/ApiError');

const ROLES_VALIDOS = [1, 2, 3, 4];

const SELECT_USUARIO = `
  SELECT
    id_usuario, username, correo, telefono, fecha_registro, foto, id_rol,
    (SELECT COUNT(*) FROM donacion d WHERE d.id_usuario = usuario.id_usuario) AS total_publicaciones,
    (SELECT COUNT(*) FROM donacion d WHERE d.id_usuario = usuario.id_usuario AND d.oculta = TRUE) AS publicaciones_ocultas
  FROM usuario
`;

async function listar(req, res, next) {
  try {
    const { search } = req.query;

    if (search && String(search).trim()) {
      const q = `%${String(search).trim()}%`;
      const [filas] = await pool.query(
        `${SELECT_USUARIO} WHERE username LIKE ? OR correo LIKE ? ORDER BY id_usuario DESC`,
        [q, q]
      );
      return res.status(200).json(filas);
    }

    const [filas] = await pool.query(`${SELECT_USUARIO} ORDER BY id_usuario DESC`);
    res.status(200).json(filas);
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const { id } = req.params;
    const [filas] = await pool.query(`${SELECT_USUARIO} WHERE id_usuario = ? LIMIT 1`, [id]);

    if (filas.length === 0) {
      throw new ApiError(404, 'El usuario indicado no existe.');
    }

    res.status(200).json(filas[0]);
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const { username, correo, telefono, contrasena, id_rol, foto } = req.body;

    if (!username || String(username).trim().length < 3) {
      throw new ApiError(400, 'El nombre de usuario debe tener al menos 3 caracteres.');
    }
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      throw new ApiError(400, 'El correo no es válido.');
    }
    if (!telefono || !/^\d{8,10}$/.test(telefono)) {
      throw new ApiError(400, 'El teléfono debe tener entre 8 y 10 dígitos.');
    }
    if (!contrasena || String(contrasena).length < 8) {
      throw new ApiError(400, 'La contraseña debe tener al menos 8 caracteres.');
    }
    if (!ROLES_VALIDOS.includes(Number(id_rol))) {
      throw new ApiError(400, 'El rol seleccionado no es válido.');
    }

    const [existentes] = await pool.query(
      'SELECT id_usuario FROM usuario WHERE correo = ? OR telefono = ? LIMIT 1',
      [correo.trim().toLowerCase(), telefono]
    );
    if (existentes.length > 0) {
      throw new ApiError(409, 'Ya existe una cuenta con ese correo o teléfono.');
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const [resultado] = await pool.query(
      `INSERT INTO usuario (username, correo, telefono, contrasena, id_rol, foto)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username.trim(), correo.trim().toLowerCase(), telefono, hash, Number(id_rol), foto ?? null]
    );

    const [filas] = await pool.query(`${SELECT_USUARIO} WHERE id_usuario = ? LIMIT 1`, [resultado.insertId]);
    res.status(201).json(filas[0]);
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { username, correo, telefono, foto, id_rol } = req.body;

    const campos = [];
    const valores = [];

    if (username !== undefined) {
      campos.push('username = ?');
      valores.push(username);
    }
    if (correo !== undefined) {
      campos.push('correo = ?');
      valores.push(correo);
    }
    if (telefono !== undefined) {
      campos.push('telefono = ?');
      valores.push(telefono);
    }
    if (foto !== undefined) {
      campos.push('foto = ?');
      valores.push(foto);
    }
    if (id_rol !== undefined) {
      campos.push('id_rol = ?');
      valores.push(id_rol);
    }

    if (campos.length === 0) {
      throw new ApiError(400, 'No se proporcionaron campos para actualizar.');
    }

    valores.push(id);

    const [resultado] = await pool.query(
      `UPDATE usuario SET ${campos.join(', ')} WHERE id_usuario = ?`,
      valores
    );

    if (resultado.affectedRows === 0) {
      throw new ApiError(404, 'El usuario indicado no existe.');
    }

    const [filas] = await pool.query(`${SELECT_USUARIO} WHERE id_usuario = ? LIMIT 1`, [id]);
    res.status(200).json(filas[0]);
  } catch (error) {
    next(error);
  }
}

async function ocultarPublicaciones(req, res, next) {
  try {
    const { id } = req.params;
    const { oculta } = req.body;

    const nuevoValor = oculta === undefined ? true : Boolean(oculta);

    const [usuarios] = await pool.query('SELECT id_usuario FROM usuario WHERE id_usuario = ? LIMIT 1', [id]);
    if (usuarios.length === 0) {
      throw new ApiError(404, 'El usuario indicado no existe.');
    }

    const [resultado] = await pool.query('UPDATE donacion SET oculta = ? WHERE id_usuario = ?', [nuevoValor, id]);

    res.status(200).json({
      oculta: nuevoValor,
      actualizadas: resultado.affectedRows
    });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    const [resultado] = await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

    if (resultado.affectedRows === 0) {
      throw new ApiError(404, 'El usuario indicado no existe.');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, ocultarPublicaciones, eliminar };