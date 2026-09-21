import { HttpError } from '../utils/http-error.js';

export function manejarErrores(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido.' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'Alguno de los datos enviados no existe (usuario, donación...).' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
}
