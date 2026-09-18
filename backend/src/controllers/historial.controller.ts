import { Request, Response } from 'express';
import * as historialService from '../services/historial.service';

export async function listar(req: Request, res: Response) {
  try {
    const idUsuario = Number(req.query.usuario);
    const rol = req.query.rol as string;

    if (!idUsuario || (rol !== 'donador' && rol !== 'beneficiario')) {
      return res.status(400).json({
        error: 'Debes enviar ?usuario=<id>&rol=donador|beneficiario',
      });
    }

    const historial = await historialService.obtenerHistorial(idUsuario, rol);
    res.json(historial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
