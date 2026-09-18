import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { CrearSolicitudDTO, SolicitudDetalle } from '../models/solicitud.types';
import { ApiError } from '../utils/apiError';
import { crearNotificacionInterna } from './notificaciones.service';

export async function crearSolicitud(dto: CrearSolicitudDTO) {
  const [donaciones] = await pool.query<RowDataPacket[]>(
    'SELECT id_donacion, estado, id_usuario, titulo FROM donacion WHERE id_donacion = ?',
    [dto.id_donacion]
  );

  if (donaciones.length === 0) {
    throw new ApiError(404, 'La donación no existe');
  }
  if (Number(donaciones[0].estado) !== 1) {
    throw new ApiError(400, 'La donación ya no está disponible');
  }

  const [solicitantes] = await pool.query<RowDataPacket[]>(
    'SELECT username FROM usuario WHERE id_usuario = ?',
    [dto.id_usuario]
  );
  if (solicitantes.length === 0) {
    throw new ApiError(404, 'El usuario que solicita no existe');
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO solicitud (id_donacion, id_usuario, estado)
       VALUES (?, ?, 'PENDIENTE')`,
      [dto.id_donacion, dto.id_usuario]
    );

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM solicitud WHERE id_solicitud = ?',
      [result.insertId]
    );

    await crearNotificacionInterna(pool, {
      titulo: 'Nueva solicitud',
      mensaje: `${solicitantes[0].username} solicitó tu donación "${donaciones[0].titulo}".`,
      id_usuario: donaciones[0].id_usuario,
    });

    return rows[0];
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'Ya existe una solicitud tuya para esta donación');
    }
    throw err;
  }
}

export async function obtenerSolicitudes(
  idUsuario: number,
  rol: 'donador' | 'beneficiario'
): Promise<SolicitudDetalle[]> {
  const baseSelect = `
    SELECT
      s.id_solicitud, s.fecha_solicitud, s.estado, s.id_donacion, s.id_usuario,
      d.titulo AS titulo_donacion,
      d.descripcion AS descripcion_donacion,
      d.cantidad AS cantidad_donacion,
      d.imagen AS imagen_donacion,
      d.id_usuario AS id_usuario_donador,
      u.username AS username_solicitante,
      ub.departamento, ub.municipio, ub.direccion
    FROM solicitud s
    JOIN donacion d ON d.id_donacion = s.id_donacion
    JOIN usuario u ON u.id_usuario = s.id_usuario
    JOIN ubicacion ub ON ub.id_ubicacion = d.id_ubicacion
  `;

  const where = rol === 'donador' ? 'WHERE d.id_usuario = ?' : 'WHERE s.id_usuario = ?';

  const [rows] = await pool.query<RowDataPacket[]>(
    `${baseSelect} ${where} ORDER BY s.fecha_solicitud DESC`,
    [idUsuario]
  );
  return rows as SolicitudDetalle[];
}

export async function obtenerSolicitudPorId(id: number): Promise<SolicitudDetalle> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       s.id_solicitud, s.fecha_solicitud, s.estado, s.id_donacion, s.id_usuario,
       d.titulo AS titulo_donacion,
       d.descripcion AS descripcion_donacion,
       d.cantidad AS cantidad_donacion,
       d.imagen AS imagen_donacion,
       d.id_usuario AS id_usuario_donador,
       u.username AS username_solicitante,
       ub.departamento, ub.municipio, ub.direccion
     FROM solicitud s
     JOIN donacion d ON d.id_donacion = s.id_donacion
     JOIN usuario u ON u.id_usuario = s.id_usuario
     JOIN ubicacion ub ON ub.id_ubicacion = d.id_ubicacion
     WHERE s.id_solicitud = ?`,
    [id]
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Solicitud no encontrada');
  }
  return rows[0] as SolicitudDetalle;
}

export async function aceptarSolicitud(idSolicitud: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [updateResult] = await connection.query<ResultSetHeader>(
      `UPDATE solicitud SET estado = 'ACEPTADA'
       WHERE id_solicitud = ? AND estado = 'PENDIENTE'`,
      [idSolicitud]
    );

    if (updateResult.affectedRows === 0) {
      const [existentes] = await connection.query<RowDataPacket[]>(
        'SELECT estado FROM solicitud WHERE id_solicitud = ?',
        [idSolicitud]
      );
      await connection.rollback();

      if (existentes.length === 0) {
        throw new ApiError(404, 'Solicitud no encontrada');
      }
      throw new ApiError(
        409,
        `La solicitud ya está en estado ${existentes[0].estado}, no se puede aceptar`
      );
    }

    const [chatInsert] = await connection.query<ResultSetHeader>(
      `INSERT INTO chat (id_solicitud) VALUES (?)`,
      [idSolicitud]
    );

    await connection.query<ResultSetHeader>(
      `INSERT INTO entrega (estado, id_solicitud) VALUES ('PENDIENTE', ?)`,
      [idSolicitud]
    );

    const [solicitudRows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM solicitud WHERE id_solicitud = ?',
      [idSolicitud]
    );
    const [chatRows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM chat WHERE id_chat = ?',
      [chatInsert.insertId]
    );
    const [entregaRows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM entrega WHERE id_solicitud = ?',
      [idSolicitud]
    );

    const [donacionRows] = await connection.query<RowDataPacket[]>(
      'SELECT titulo FROM donacion WHERE id_donacion = ?',
      [solicitudRows[0].id_donacion]
    );
    await crearNotificacionInterna(connection, {
      titulo: 'Solicitud aceptada',
      mensaje: `Tu solicitud para "${donacionRows[0].titulo}" fue aceptada. Ya puedes coordinar por el chat.`,
      id_usuario: solicitudRows[0].id_usuario,
    });

    await connection.commit();
    return { solicitud: solicitudRows[0], chat: chatRows[0], entrega: entregaRows[0] };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function rechazarSolicitud(idSolicitud: number) {
  const [updateResult] = await pool.query<ResultSetHeader>(
    `UPDATE solicitud SET estado = 'RECHAZADA'
     WHERE id_solicitud = ? AND estado = 'PENDIENTE'`,
    [idSolicitud]
  );

  if (updateResult.affectedRows === 0) {
    const [existentes] = await pool.query<RowDataPacket[]>(
      'SELECT estado FROM solicitud WHERE id_solicitud = ?',
      [idSolicitud]
    );
    if (existentes.length === 0) {
      throw new ApiError(404, 'Solicitud no encontrada');
    }
    throw new ApiError(
      409,
      `La solicitud ya está en estado ${existentes[0].estado}, no se puede rechazar`
    );
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM solicitud WHERE id_solicitud = ?',
    [idSolicitud]
  );

  const [donacionRows] = await pool.query<RowDataPacket[]>(
    'SELECT titulo FROM donacion WHERE id_donacion = ?',
    [rows[0].id_donacion]
  );
  await crearNotificacionInterna(pool, {
    titulo: 'Solicitud rechazada',
    mensaje: `Tu solicitud para "${donacionRows[0].titulo}" fue rechazada.`,
    id_usuario: rows[0].id_usuario,
  });

  return rows[0];
}
