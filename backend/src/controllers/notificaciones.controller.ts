import { Request, Response } from 'express';
import * as notificacionesService from '../services/notificaciones.service';
import { ApiError } from '../utils/apiError';

function manejarError(err: unknown, res: Response) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

export async function listar(req: Request, res: Response) {
  try {
    const idUsuario = Number(req.query.usuario);
    if (!idUsuario) {
      return res.status(400).json({ error: 'Debes enviar ?usuario=<id>' });
    }
    const notificaciones = await notificacionesService.obtenerNotificacionesPorUsuario(idUsuario);
    res.json(notificaciones);
  } catch (err) {
    manejarError(err, res);
  }
}

export async function marcarLeida(req: Request, res: Response) {
  try {
    const idNotificacion = Number(req.params.id);
    const idUsuario = Number(req.query.usuario);
    if (!idUsuario) {
      return res.status(400).json({ error: 'Debes enviar ?usuario=<id>' });
    }
    const notificacion = await notificacionesService.marcarComoLeida(idNotificacion, idUsuario);
    res.json(notificacion);
  } catch (err) {
    manejarError(err, res);
  }
}
