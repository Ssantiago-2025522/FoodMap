import { Request, Response } from 'express';
import * as entregasService from '../services/entregas.service';
import { ApiError } from '../utils/apiError';

function manejarError(err: unknown, res: Response) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

export async function confirmar(req: Request, res: Response) {
  try {
    const id_solicitud = Number(req.params.id);
    const { id_usuario, observaciones } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ error: 'id_usuario es requerido en el body' });
    }

    const entrega = await entregasService.confirmarRecepcion({
      id_solicitud,
      id_usuario,
      observaciones,
    });
    res.json(entrega);
  } catch (err) {
    manejarError(err, res);
  }
}
