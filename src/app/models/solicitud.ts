export type EstadoSolicitud = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
export type EstadoEntrega = 'PENDIENTE' | 'ENTREGADA';
export type RolSolicitud = 'donador' | 'beneficiario';

export interface Solicitud {
  id_solicitud: number;
  fecha_solicitud: string;
  estado: EstadoSolicitud;
  id_donacion: number;
  id_usuario: number;
  cantidad_solicitada: number;
  comentario: string | null;
}

export interface SolicitudDetalle extends Solicitud {
  id_donador: number;
  titulo_donacion: string;
  descripcion_donacion: string;
  cantidad_donacion: number;
  municipio: string;
  departamento: string;
  username_solicitante: string;
  username_donador: string;
  correo_solicitante: string | null;
  telefono_solicitante: string | null;
  estado_entrega: EstadoEntrega | null;
  id_chat: number | null;
}

export interface DonacionDisponible {
  id_donacion: number;
  titulo: string;
  descripcion: string;
  cantidad: number;
  fecha_vencimiento: string | null;
  imagen: string;
  municipio: string;
  departamento: string;
  username_donador: string;
}

export interface HistorialItem {
  id_solicitud: number;
  titulo_donacion: string;
  fecha_solicitud: string;
  estado: EstadoSolicitud;
  estado_entrega: EstadoEntrega | null;
  fecha_entrega: string | null;
  observaciones: string | null;
  contraparte: string;
  rol: RolSolicitud;
}
