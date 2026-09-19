import { Mensaje } from './mensaje';

export interface Chat {
    id_chat: number;
    fecha_creacion: string;
    id_solicitud: number;
}

export interface ChatResumen extends Chat {
    titulo_donacion: string;
    username_contraparte: string;
    ultimo_mensaje: string | null;
    fecha_ultimo_mensaje: string | null;
}

export interface ChatDetalle {
    chat: ChatResumen;
    mensajes: Mensaje[];
}
