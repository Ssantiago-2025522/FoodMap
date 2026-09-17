import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { CrearDonacionDTO } from '../models/donacion.types';
import { crearNotificacionInterna } from './notificaciones.service';

export async function crearDonacion(dto: CrearDonacionDTO) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { ubicacion } = dto;
    const [ubicacionInsert] = await connection.query<ResultSetHeader>(
      `INSERT INTO ubicacion (departamento, municipio, direccion, latitud, longitud, referencia)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        ubicacion.departamento,
        ubicacion.municipio,
        ubicacion.direccion,
        ubicacion.latitud ?? null,
        ubicacion.longitud ?? null,
        ubicacion.referencia ?? null,
      ]
    );

    const [donacionInsert] = await connection.query<ResultSetHeader>(
      `INSERT INTO donacion
         (titulo, descripcion, cantidad, fecha_vencimiento, imagen, id_usuario, id_ubicacion, id_categoria)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.titulo,
        dto.descripcion,
        dto.cantidad ?? 1,
        dto.fecha_vencimiento ?? null,
        dto.imagen,
        dto.id_usuario,
        ubicacionInsert.insertId,
        dto.id_categoria,
      ]
    );

    const [donacionRows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM donacion WHERE id_donacion = ?',
      [donacionInsert.insertId]
    );
    const donacion = donacionRows[0];

    const [usuariosInteresados] = await connection.query<RowDataPacket[]>(
      `SELECT DISTINCT s.id_usuario
       FROM solicitud s
       JOIN donacion d2 ON d2.id_donacion = s.id_donacion
       JOIN ubicacion u2 ON u2.id_ubicacion = d2.id_ubicacion
       WHERE u2.departamento = ? AND u2.municipio = ? AND s.id_usuario != ?`,
      [ubicacion.departamento, ubicacion.municipio, dto.id_usuario]
    );

    for (const fila of usuariosInteresados) {
      await crearNotificacionInterna(connection, {
        titulo: 'Alimento cercano',
        mensaje: `Se publicó una nueva donación cerca de tu zona: "${dto.titulo}".`,
        id_usuario: fila.id_usuario,
      });
    }

    await connection.commit();
    return donacion;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
