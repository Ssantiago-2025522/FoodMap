import { Request, Response } from 'express';
import * as chatService from '../services/chat.service';
import { ApiError } from '../utils/apiError';

function manejarError(err: unknown, res: Response) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

export async function listar(req: Request, res: Response) {
  try {
    const idUsuario = Number(req.query.usuario);
    if (!idUsuario) {
      return res.status(400).json({ error: 'Debes enviar ?usuario=<id>' });
    }
    const chats = await chatService.obtenerChatsPorUsuario(idUsuario);
    res.json(chats);
  } catch (err) {
    manejarError(err, res);
  }
}

export async function obtenerUno(req: Request, res: Response) {
  try {
    const idChat = Number(req.params.id);
    const idUsuario = Number(req.query.usuario);
    if (!idUsuario) {
      return res.status(400).json({ error: 'Debes enviar ?usuario=<id>' });
    }
    const chat = await chatService.obtenerChatConMensajes(idChat, idUsuario);
    res.json(chat);
  } catch (err) {
    manejarError(err, res);
  }
}

export async function enviarMensaje(req: Request, res: Response) {
  try {
    const idChat = Number(req.params.id);
    const { id_usuario, contenido } = req.body;

    if (!id_usuario || !contenido) {
      return res.status(400).json({ error: 'id_usuario y contenido son requeridos' });
    }

    const mensaje = await chatService.enviarMensaje({
      id_chat: idChat,
      id_usuario,
      contenido,
    });
    res.status(201).json(mensaje);
  } catch (err) {
    manejarError(err, res);
  }
}
