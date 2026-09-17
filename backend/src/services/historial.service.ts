import { RowDataPacket } from 'mysql2';
import { pool } from '../config/db';
import { HistorialItem } from '../models/historial.types';

export async function obtenerHistorial(
  idUsuario: number,
  rol: 'donador' | 'beneficiario'
): Promise<HistorialItem[]> {
  const where = rol === 'donador' ? 'd.id_usuario = ?' : 's.id_usuario = ?';

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       s.id_solicitud, s.fecha_solicitud, s.estado, s.id_donacion, s.id_usuario,
       d.titulo AS titulo_donacion,
       d.imagen AS imagen_donacion,
       d.id_usuario AS id_usuario_donador,
       u.username AS username_solicitante,
       e.id_entrega, e.estado AS estado_entrega,
       e.fecha_entrega, e.hora_entrega, e.observaciones
     FROM solicitud s
     JOIN donacion d ON d.id_donacion = s.id_donacion
     JOIN usuario u ON u.id_usuario = s.id_usuario
     LEFT JOIN entrega e ON e.id_solicitud = s.id_solicitud
     WHERE ${where} AND s.estado != 'PENDIENTE'
     ORDER BY s.fecha_solicitud DESC`,
    [idUsuario]
  );

  return rows as HistorialItem[];
}
