import { HttpError } from '../utils/http-error.js';

export function usuarioActual(req, res, next) {
  const id = Number(req.query.usuario ?? req.body?.id_usuario);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(401, 'Falta indicar el usuario.');
  }
  req.idUsuario = id;
  next();
}
