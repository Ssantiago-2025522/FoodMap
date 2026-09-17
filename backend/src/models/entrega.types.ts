export type EstadoEntrega = 'PENDIENTE' | 'CONFIRMADA';

export interface Entrega {
  id_entrega: number;
  fecha_entrega: string;
  hora_entrega: string;
  observaciones: string | null;
  estado: EstadoEntrega;
  id_solicitud: number;
}

export interface ConfirmarRecepcionDTO {
  id_solicitud: number;
  id_usuario: number;
  observaciones?: string;
}
