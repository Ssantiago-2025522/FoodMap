export interface Notificacion {
  id_notificacion: number;
  titulo: string;
  mensaje: string;
  fecha: Date;
  leida: boolean;
  id_usuario: number;
}

export interface CrearNotificacionDTO {
  titulo: string;
  mensaje: string;
  id_usuario: number;
}
