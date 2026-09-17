import { Request, Response } from 'express';
import * as solicitudesService from '../services/solicitudes.service';
import { ApiError } from '../utils/apiError';

function manejarError(err: unknown, res: Response) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

export async function crear(req: Request, res: Response) {
  try {
    const { id_donacion, id_usuario } = req.body;

    if (!id_donacion || !id_usuario) {
      return res.status(400).json({ error: 'id_donacion e id_usuario son requeridos' });
    }

    const solicitud = await solicitudesService.crearSolicitud({ id_donacion, id_usuario });
    res.status(201).json(solicitud);
  } catch (err) {
    manejarError(err, res);
  }
}

export async function listar(req: Request, res: Response) {
  try {
    const idUsuario = Number(req.query.usuario);
    const rol = req.query.rol as string;

    if (!idUsuario || (rol !== 'donador' && rol !== 'beneficiario')) {
      return res.status(400).json({
        error: "Debes enviar ?usuario=<id>&rol=donador|beneficiario",
      });
    }

    const solicitudes = await solicitudesService.obtenerSolicitudes(idUsuario, rol);
    res.json(solicitudes);
  } catch (err) {
    manejarError(err, res);
  }
}

export async function obtenerUno(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const solicitud = await solicitudesService.obtenerSolicitudPorId(id);
    res.json(solicitud);
  } catch (err) {
    manejarError(err, res);
  }
}

export async function aceptar(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const resultado = await solicitudesService.aceptarSolicitud(id);
    res.json(resultado);
  } catch (err) {
    manejarError(err, res);
  }
}

export async function rechazar(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const solicitud = await solicitudesService.rechazarSolicitud(id);
    res.json(solicitud);
  } catch (err) {
    manejarError(err, res);
  }
}
