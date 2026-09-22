const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { firmarToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

const ROLES = { ADMIN: 1, MODERADOR: 2, BENEFICIARIO: 3, DONADOR: 4 };

const ROLES_AUTOREGISTRO = [ROLES.BENEFICIARIO, ROLES.DONADOR];

const CAMPOS_USUARIO =
  'id_usuario, username, correo, telefono, id_rol, foto, fecha_registro';

function serializarUsuario(fila) {
  return {
    id_usuario: fila.id_usuario,
    username: fila.username,
    correo: fila.correo,
    telefono: fila.telefono,
    id_rol: fila.id_rol,
    foto: fila.foto ?? null
  };
}

function validarRegistro({ username, correo, telefono, contrasena, id_rol }) {
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
  if (!ROLES_AUTOREGISTRO.includes(Number(id_rol))) {
    throw new ApiError(400, 'El rol seleccionado no es válido para el registro.');
  }
}

async function register(req, res, next) {
  try {
    const { username, correo, telefono, contrasena, id_rol, foto } = req.body;

    validarRegistro({ username, correo, telefono, contrasena, id_rol });

    const [existentes] = await pool.query(
      'SELECT id_usuario FROM usuario WHERE correo = ? OR telefono = ? LIMIT 1',
      [correo, telefono]
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

    const [filas] = await pool.query(
      `SELECT ${CAMPOS_USUARIO} FROM usuario WHERE id_usuario = ?`,
      [resultado.insertId]
    );

    const usuario = serializarUsuario(filas[0]);
    const token = firmarToken(usuario);

    res.status(201).json({ token, usuario });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      throw new ApiError(400, 'Correo y contraseña son obligatorios.');
    }

    const [filas] = await pool.query(
      `SELECT id_usuario, username, correo, telefono, id_rol, foto, contrasena
       FROM usuario WHERE correo = ? LIMIT 1`,
      [correo.trim().toLowerCase()]
    );

    if (filas.length === 0) {
      throw new ApiError(401, 'Credenciales inválidas.');
    }

    const fila = filas[0];
    const coincide = await bcrypt.compare(contrasena, fila.contrasena);
    if (!coincide) {
      throw new ApiError(401, 'Credenciales inválidas.');
    }

    const usuario = serializarUsuario(fila);
    const token = firmarToken(usuario);

    res.status(200).json({ token, usuario });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
