const ApiError = require('../utils/ApiError');

function noEncontrado(req, res, next) {
  next(new ApiError(404, `La ruta ${req.originalUrl} no existe.`));
}

function errorHandler(err, req, res, next) {
  const status = err instanceof ApiError ? err.status : 500;
  const message =
    err instanceof ApiError ? err.message : 'Ocurrió un error inesperado en el servidor.';

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ message });
}

module.exports = { noEncontrado, errorHandler };
