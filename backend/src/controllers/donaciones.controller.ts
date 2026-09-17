import { Request, Response } from 'express';
import * as donacionesService from '../services/donaciones.service';
import { ApiError } from '../utils/apiError';

function manejarError(err: unknown, res: Response) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

// POST /api/donaciones
export async function crear(req: Request, res: Response) {
  try {
    const { titulo, descripcion, cantidad, fecha_vencimiento, imagen, id_usuario, id_categoria, ubicacion } =
      req.body;

    if (!titulo || !descripcion || !imagen || !id_usuario || !id_categoria || !ubicacion) {
      return res.status(400).json({
        error:
          'Faltan campos requeridos: titulo, descripcion, imagen, id_usuario, id_categoria, ubicacion',
      });
    }
    if (!ubicacion.departamento || !ubicacion.municipio || !ubicacion.direccion) {
      return res.status(400).json({
        error: 'ubicacion debe incluir al menos: departamento, municipio, direccion',
      });
    }

    const donacion = await donacionesService.crearDonacion({
      titulo,
      descripcion,
      cantidad,
      fecha_vencimiento,
      imagen,
      id_usuario,
      id_categoria,
      ubicacion,
    });

    res.status(201).json(donacion);
  } catch (err) {
    manejarError(err, res);
  }
}
