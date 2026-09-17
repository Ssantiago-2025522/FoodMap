export interface Chat {
  id_chat: number;
  fecha_creacion: Date;
  id_solicitud: number;
}

export interface ChatResumen extends Chat {
  titulo_donacion: string;
  id_usuario_donador: number;
  id_usuario_beneficiario: number;
  username_donador: string;
  username_beneficiario: string;
  ultimo_mensaje: string | null;
  fecha_ultimo_mensaje: Date | null;
}
