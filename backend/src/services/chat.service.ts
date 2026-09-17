import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../config/db';
import { ChatResumen } from '../models/chat.types';
import { EnviarMensajeDTO, Mensaje } from '../models/mensaje.types';
import { ApiError } from '../utils/apiError';

async function obtenerParticipantes(idChat: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       c.id_chat, c.id_solicitud,
       s.id_usuario AS id_usuario_beneficiario,
       d.id_usuario AS id_usuario_donador
     FROM chat c
     JOIN solicitud s ON s.id_solicitud = c.id_solicitud
     JOIN donacion d ON d.id_donacion = s.id_donacion
     WHERE c.id_chat = ?`,
    [idChat]
  );

  if (rows.length === 0) {
    throw new ApiError(404, 'Chat no encontrado');
  }
  return rows[0];
}

export async function obtenerChatsPorUsuario(idUsuario: number): Promise<ChatResumen[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       c.id_chat, c.fecha_creacion, c.id_solicitud,
       d.titulo AS titulo_donacion,
       d.id_usuario AS id_usuario_donador,
       s.id_usuario AS id_usuario_beneficiario,
       ud.username AS username_donador,
       ub.username AS username_beneficiario,
       ultimo.contenido AS ultimo_mensaje,
       ultimo.fecha_envio AS fecha_ultimo_mensaje
     FROM chat c
     JOIN solicitud s ON s.id_solicitud = c.id_solicitud
     JOIN donacion d ON d.id_donacion = s.id_donacion
     JOIN usuario ud ON ud.id_usuario = d.id_usuario
     JOIN usuario ub ON ub.id_usuario = s.id_usuario
     LEFT JOIN mensaje ultimo ON ultimo.id_mensaje = (
       SELECT m.id_mensaje FROM mensaje m
       WHERE m.id_chat = c.id_chat
       ORDER BY m.fecha_envio DESC
       LIMIT 1
     )
     WHERE d.id_usuario = ? OR s.id_usuario = ?
     ORDER BY COALESCE(ultimo.fecha_envio, c.fecha_creacion) DESC`,
    [idUsuario, idUsuario]
  );

  return rows as ChatResumen[];
}

export async function obtenerChatConMensajes(idChat: number, idUsuario: number) {
  const participantes = await obtenerParticipantes(idChat);

  if (
    idUsuario !== participantes.id_usuario_donador &&
    idUsuario !== participantes.id_usuario_beneficiario
  ) {
    throw new ApiError(403, 'No participas en este chat');
  }

  const [mensajes] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM mensaje WHERE id_chat = ? ORDER BY fecha_envio ASC',
    [idChat]
  );

  return { id_chat: idChat, ...participantes, mensajes: mensajes as Mensaje[] };
}

export async function enviarMensaje(dto: EnviarMensajeDTO): Promise<Mensaje> {
  const participantes = await obtenerParticipantes(dto.id_chat);

  if (
    dto.id_usuario !== participantes.id_usuario_donador &&
    dto.id_usuario !== participantes.id_usuario_beneficiario
  ) {
    throw new ApiError(403, 'No participas en este chat');
  }

  if (!dto.contenido || dto.contenido.trim().length === 0) {
    throw new ApiError(400, 'El mensaje no puede estar vacío');
  }

  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO mensaje (contenido, id_chat, id_usuario) VALUES (?, ?, ?)',
    [dto.contenido, dto.id_chat, dto.id_usuario]
  );

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM mensaje WHERE id_mensaje = ?',
    [result.insertId]
  );
  return rows[0] as Mensaje;
}
