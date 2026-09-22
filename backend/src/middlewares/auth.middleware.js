const { verificarToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

function requiereAutenticacion(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'No autenticado.'));
  }

  try {
    const token = header.slice('Bearer '.length);
    req.usuario = verificarToken(token);
    next();
  } catch {
    next(new ApiError(401, 'Token inválido o expirado.'));
  }
}

function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.id_rol)) {
      return next(new ApiError(403, 'No tienes permisos para esta acción.'));
    }
    next();
  };
}

module.exports = { requiereAutenticacion, requiereRol };
