import { pool } from '../config/db';
import { CrearSolicitudDTO, SolicitudDetalle } from '../models/solicitud.types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function crearSolicitud(dto: CrearSolicitudDTO) {
  const donacion = await pool.query(
    'SELECT id_donacion, estado FROM donacion WHERE id_donacion = $1',
    [dto.id_donacion]
  );

  if (donacion.rows.length === 0) {
    throw new ApiError(404, 'La donación no existe');
  }
  if (donacion.rows[0].estado !== true) {
    throw new ApiError(400, 'La donación ya no está disponible');
  }

  try {
    const result = await pool.query(
      `INSERT INTO solicitud (id_donacion, id_usuario, estado)
       VALUES ($1, $2, 'PENDIENTE')
       RETURNING *`,
      [dto.id_donacion, dto.id_usuario]
    );
    return result.rows[0];
  } catch (err: any) {
    if (err.code === '23505') {
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
      d.imagen AS imagen_donacion,
      d.id_usuario AS id_usuario_donador,
      u.username AS username_solicitante
    FROM solicitud s
    JOIN donacion d ON d.id_donacion = s.id_donacion
    JOIN usuario u ON u.id_usuario = s.id_usuario
  `;

  const where =
    rol === 'donador'
      ? 'WHERE d.id_usuario = $1'
      : 'WHERE s.id_usuario = $1';

  const result = await pool.query(
    `${baseSelect} ${where} ORDER BY s.fecha_solicitud DESC`,
    [idUsuario]
  );
  return result.rows;
}

export async function obtenerSolicitudPorId(id: number): Promise<SolicitudDetalle> {
  const result = await pool.query(
    `SELECT
       s.id_solicitud, s.fecha_solicitud, s.estado, s.id_donacion, s.id_usuario,
       d.titulo AS titulo_donacion,
       d.imagen AS imagen_donacion,
       d.id_usuario AS id_usuario_donador,
       u.username AS username_solicitante
     FROM solicitud s
     JOIN donacion d ON d.id_donacion = s.id_donacion
     JOIN usuario u ON u.id_usuario = s.id_usuario
     WHERE s.id_solicitud = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Solicitud no encontrada');
  }
  return result.rows[0];
}

/**
 * Acepta una solicitud PENDIENTE y crea automáticamente el chat asociado
 * (solo debe existir chat para solicitudes aceptadas).
 * Se usa una transacción porque son dos escrituras que deben ocurrir juntas:
 * si falla la creación del chat, la solicitud no debe quedar marcada como aceptada.
 */
export async function aceptarSolicitud(idSolicitud: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const update = await client.query(
      `UPDATE solicitud SET estado = 'ACEPTADA'
       WHERE id_solicitud = $1 AND estado = 'PENDIENTE'
       RETURNING *`,
      [idSolicitud]
    );

    if (update.rows.length === 0) {
      // O no existe, o ya no está en PENDIENTE (ya fue aceptada/rechazada antes)
      const existe = await client.query(
        'SELECT estado FROM solicitud WHERE id_solicitud = $1',
        [idSolicitud]
      );
      await client.query('ROLLBACK');
      if (existe.rows.length === 0) {
        throw new ApiError(404, 'Solicitud no encontrada');
      }
      throw new ApiError(
        409,
        `La solicitud ya está en estado ${existe.rows[0].estado}, no se puede aceptar`
      );
    }

    const chat = await client.query(
      `INSERT INTO chat (id_solicitud) VALUES ($1) RETURNING *`,
      [idSolicitud]
    );

    await client.query('COMMIT');
    return { solicitud: update.rows[0], chat: chat.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Rechaza una solicitud PENDIENTE. No se puede rechazar algo ya aceptado/rechazado.
 */
export async function rechazarSolicitud(idSolicitud: number) {
  const result = await pool.query(
    `UPDATE solicitud SET estado = 'RECHAZADA'
     WHERE id_solicitud = $1 AND estado = 'PENDIENTE'
     RETURNING *`,
    [idSolicitud]
  );

  if (result.rows.length === 0) {
    const existe = await pool.query(
      'SELECT estado FROM solicitud WHERE id_solicitud = $1',
      [idSolicitud]
    );
    if (existe.rows.length === 0) {
      throw new ApiError(404, 'Solicitud no encontrada');
    }
    throw new ApiError(
      409,
      `La solicitud ya está en estado ${existe.rows[0].estado}, no se puede rechazar`
    );
  }

  return result.rows[0];
}
