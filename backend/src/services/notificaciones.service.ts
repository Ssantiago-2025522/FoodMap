import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Pool, PoolConnection } from 'mysql2/promise';
import { pool } from '../config/db';
import { CrearNotificacionDTO, Notificacion } from '../models/notificacion.types';
import { ApiError } from '../utils/apiError';

type Ejecutor = Pool | PoolConnection;

export async function crearNotificacionInterna(
  ejecutor: Ejecutor,
  dto: CrearNotificacionDTO
): Promise<Notificacion> {
  const [result] = await ejecutor.query<ResultSetHeader>(
    `INSERT INTO notificacion (titulo, mensaje, id_usuario)
     VALUES (?, ?, ?)`,
    [dto.titulo, dto.mensaje, dto.id_usuario]
  );

  const [rows] = await ejecutor.query<RowDataPacket[]>(
    'SELECT * FROM notificacion WHERE id_notificacion = ?',
    [result.insertId]
  );
  return rows[0] as Notificacion;
}

export async function obtenerNotificacionesPorUsuario(
  idUsuario: number
): Promise<Notificacion[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM notificacion WHERE id_usuario = ? ORDER BY fecha DESC',
    [idUsuario]
  );
  return rows as Notificacion[];
}

export async function marcarComoLeida(
  idNotificacion: number,
  idUsuario: number
): Promise<Notificacion> {
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE notificacion SET leida = TRUE
     WHERE id_notificacion = ? AND id_usuario = ?`,
    [idNotificacion, idUsuario]
  );

  if (result.affectedRows === 0) {
    throw new ApiError(404, 'Notificación no encontrada para este usuario');
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM notificacion WHERE id_notificacion = ?',
    [idNotificacion]
  );
  return rows[0] as Notificacion;
}
