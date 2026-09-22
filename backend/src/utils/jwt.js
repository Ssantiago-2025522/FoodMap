const jwt = require('jsonwebtoken');

function firmarToken(usuario) {
  const payload = {
    id_usuario: usuario.id_usuario,
    id_rol: usuario.id_rol
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

function verificarToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { firmarToken, verificarToken };
