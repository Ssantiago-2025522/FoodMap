const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { firmarToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const { enviarCorreoRecuperacion } = require('../helpers/correo');

const ROLES = { ADMIN: 1, MODERADOR: 2, BENEFICIARIO: 3, DONADOR: 4 };

const ROLES_AUTOREGISTRO = [ROLES.BENEFICIARIO, ROLES.DONADOR];

const CAMPOS_USUARIO =
  'id_usuario, username, correo, telefono, id_rol, foto, fecha_registro';

const FOTO_MAX_CARACTERES = 2_000_000; // ~1.5 MB de imagen aproximadamente
const DURACION_TOKEN_RECUPERACION_MS = 60 * 60 * 1000; // 1 hora

function validarFoto(foto) {
  if (foto === undefined || foto === null) return;
  if (typeof foto !== 'string' || !/^data:image\/(png|jpe?g|webp|gif);base64,/.test(foto)) {
    throw new ApiError(400, 'La foto de perfil debe ser una imagen válida.');
  }
  if (foto.length > FOTO_MAX_CARACTERES) {
    throw new ApiError(400, 'La foto de perfil es demasiado grande.');
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

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

async function perfil(req, res, next) {
  try {
    const [filas] = await pool.query(
      `SELECT ${CAMPOS_USUARIO} FROM usuario WHERE id_usuario = ? LIMIT 1`,
      [req.usuario.id_usuario]
    );

    if (filas.length === 0) {
      throw new ApiError(404, 'El usuario indicado no existe.');
    }

    res.status(200).json(serializarUsuario(filas[0]));
  } catch (error) {
    next(error);
  }
}

async function actualizarPerfil(req, res, next) {
  try {
    const { username, foto } = req.body;

    const campos = [];
    const valores = [];

    if (username !== undefined) {
      if (!username || String(username).trim().length < 3) {
        throw new ApiError(400, 'El nombre de usuario debe tener al menos 3 caracteres.');
      }
      campos.push('username = ?');
      valores.push(String(username).trim());
    }

    if (foto !== undefined) {
      validarFoto(foto);
      campos.push('foto = ?');
      valores.push(foto ?? null); // null = quitar la foto (es opcional)
    }

    if (campos.length === 0) {
      throw new ApiError(400, 'No se recibió ningún dato para actualizar.');
    }

    valores.push(req.usuario.id_usuario);

    await pool.query(`UPDATE usuario SET ${campos.join(', ')} WHERE id_usuario = ?`, valores);

    const [filas] = await pool.query(
      `SELECT ${CAMPOS_USUARIO} FROM usuario WHERE id_usuario = ? LIMIT 1`,
      [req.usuario.id_usuario]
    );

    res.status(200).json(serializarUsuario(filas[0]));
  } catch (error) {
    next(error);
  }
}

async function cambiarContrasena(req, res, next) {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;

    if (!contrasenaActual || !contrasenaNueva) {
      throw new ApiError(400, 'Debes indicar la contraseña actual y la nueva.');
    }
    if (String(contrasenaNueva).length < 8) {
      throw new ApiError(400, 'La nueva contraseña debe tener al menos 8 caracteres.');
    }

    const [filas] = await pool.query(
      'SELECT contrasena FROM usuario WHERE id_usuario = ? LIMIT 1',
      [req.usuario.id_usuario]
    );

    if (filas.length === 0) {
      throw new ApiError(404, 'El usuario indicado no existe.');
    }

    const coincide = await bcrypt.compare(contrasenaActual, filas[0].contrasena);
    if (!coincide) {
      throw new ApiError(401, 'La contraseña actual no es correcta.');
    }

    const hash = await bcrypt.hash(contrasenaNueva, 10);
    await pool.query('UPDATE usuario SET contrasena = ? WHERE id_usuario = ?', [
      hash,
      req.usuario.id_usuario
    ]);

    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    next(error);
  }
}

async function solicitarRecuperacion(req, res, next) {
  try {
    const { correo } = req.body;

    if (!correo) {
      throw new ApiError(400, 'Debes indicar tu correo.');
    }

    const mensajeRespuesta = {
      message: 'Si el correo existe en nuestro sistema, se enviaron las instrucciones para restablecer la contraseña.'
    };

    const [filas] = await pool.query(
      'SELECT id_usuario, correo FROM usuario WHERE correo = ? LIMIT 1',
      [String(correo).trim().toLowerCase()]
    );

    // No revelamos si el correo existe o no, para no facilitar enumeración de usuarios.
    if (filas.length === 0) {
      return res.status(200).json(mensajeRespuesta);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expira = new Date(Date.now() + DURACION_TOKEN_RECUPERACION_MS);

    await pool.query(
      'UPDATE usuario SET reset_token = ?, reset_token_expira = ? WHERE id_usuario = ?',
      [tokenHash, expira, filas[0].id_usuario]
    );

    const origenFrontend = process.env.FRONTEND_ORIGIN || 'http://localhost:4200';
    const enlace = `${origenFrontend}/restablecer-contrasena?token=${token}`;

    const { enviado } = await enviarCorreoRecuperacion(filas[0].correo, enlace);

    const respuesta = { ...mensajeRespuesta };
    if (process.env.NODE_ENV !== 'production' && !enviado) {
      respuesta.enlaceDesarrollo = enlace;
    }

    res.status(200).json(respuesta);
  } catch (error) {
    next(error);
  }
}

async function restablecerContrasena(req, res, next) {
  try {
    const { token, contrasenaNueva } = req.body;

    if (!token || !contrasenaNueva) {
      throw new ApiError(400, 'Faltan datos para restablecer la contraseña.');
    }
    if (String(contrasenaNueva).length < 8) {
      throw new ApiError(400, 'La nueva contraseña debe tener al menos 8 caracteres.');
    }

    const tokenHash = hashToken(String(token));

    const [filas] = await pool.query(
      `SELECT id_usuario FROM usuario
       WHERE reset_token = ? AND reset_token_expira > NOW()
       LIMIT 1`,
      [tokenHash]
    );

    if (filas.length === 0) {
      throw new ApiError(400, 'El enlace de recuperación no es válido o ya expiró.');
    }

    const hash = await bcrypt.hash(contrasenaNueva, 10);

    await pool.query(
      `UPDATE usuario
       SET contrasena = ?, reset_token = NULL, reset_token_expira = NULL
       WHERE id_usuario = ?`,
      [hash, filas[0].id_usuario]
    );

    res.status(200).json({ message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  perfil,
  actualizarPerfil,
  cambiarContrasena,
  solicitarRecuperacion,
  restablecerContrasena
};
