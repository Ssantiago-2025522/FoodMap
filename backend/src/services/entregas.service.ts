import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { ConfirmarRecepcionDTO } from '../models/entrega.types';
import { ApiError } from '../utils/apiError';
import { crearNotificacionInterna } from './notificaciones.service';

export async function confirmarRecepcion(dto: ConfirmarRecepcionDTO) {
  const [solicitudRows] = await pool.query<RowDataPacket[]>(
    'SELECT id_solicitud, id_usuario, id_donacion FROM solicitud WHERE id_solicitud = ?',
    [dto.id_solicitud]
  );

  if (solicitudRows.length === 0) {
    throw new ApiError(404, 'Solicitud no encontrada');
  }
  if (solicitudRows[0].id_usuario !== dto.id_usuario) {
    throw new ApiError(403, 'No puedes confirmar la recepción de una solicitud que no es tuya');
  }

  const [updateResult] = await pool.query<ResultSetHeader>(
    `UPDATE entrega SET estado = 'CONFIRMADA', observaciones = ?
     WHERE id_solicitud = ? AND estado = 'PENDIENTE'`,
    [dto.observaciones ?? null, dto.id_solicitud]
  );

  if (updateResult.affectedRows === 0) {
    const [entregaExistente] = await pool.query<RowDataPacket[]>(
      'SELECT estado FROM entrega WHERE id_solicitud = ?',
      [dto.id_solicitud]
    );
    if (entregaExistente.length === 0) {
      throw new ApiError(
        400,
        'Esta solicitud no tiene una entrega en curso (¿ya fue aceptada?)'
      );
    }
    throw new ApiError(409, 'Esta entrega ya fue confirmada anteriormente');
  }

  const [entregaRows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM entrega WHERE id_solicitud = ?',
    [dto.id_solicitud]
  );

  const [donacionRows] = await pool.query<RowDataPacket[]>(
    'SELECT titulo, id_usuario FROM donacion WHERE id_donacion = ?',
    [solicitudRows[0].id_donacion]
  );
  await crearNotificacionInterna(pool, {
    titulo: 'Entrega confirmada',
    mensaje: `El beneficiario confirmó la recepción de "${donacionRows[0].titulo}".`,
    id_usuario: donacionRows[0].id_usuario,
  });

  return entregaRows[0];
}
