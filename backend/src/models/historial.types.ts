import { EstadoSolicitud } from './solicitud.types';
import { EstadoEntrega } from './entrega.types';

export interface HistorialItem {
  id_solicitud: number;
  fecha_solicitud: Date;
  estado: EstadoSolicitud;
  id_donacion: number;
  id_usuario: number;
  titulo_donacion: string;
  imagen_donacion: string;
  id_usuario_donador: number;
  username_solicitante: string;
  id_entrega: number | null;
  estado_entrega: EstadoEntrega | null;
  fecha_entrega: string | null;
  hora_entrega: string | null;
  observaciones: string | null;
}
