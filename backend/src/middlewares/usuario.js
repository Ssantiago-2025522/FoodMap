const ApiError = require('../utils/ApiError');

function usuarioActual(req, res, next) {
  const id = Number(req.query.usuario ?? req.body?.id_usuario);

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(401, 'Falta indicar el usuario.');
  }

  req.idUsuario = id;
  next();
}

module.exports = {
  usuarioActual,
};