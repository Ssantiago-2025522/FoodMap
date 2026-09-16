export type EstadoSolicitud = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

export interface Solicitud {
  id_solicitud: number;
  fecha_solicitud: Date;
  estado: EstadoSolicitud;
  id_donacion: number;
  id_usuario: number;
}

export interface SolicitudDetalle extends Solicitud {
  titulo_donacion: string;
  imagen_donacion: string;
  id_usuario_donador: number;
  username_solicitante: string;
}

export interface CrearSolicitudDTO {
  id_donacion: number;
  id_usuario: number;
}