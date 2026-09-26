export type EstadoEntrega = 'PENDIENTE' | 'ENTREGADA';

export interface Entrega {
  id_entrega: number;
  id_solicitud: number;
  estado: EstadoEntrega;
  fecha_entrega: string | null;
  hora_entrega: string | null;
  observaciones: string | null;
}

export interface EntregaQr {
  id_entrega: number;
  id_solicitud: number;
  estado: EstadoEntrega;
  token_qr: string;
}
