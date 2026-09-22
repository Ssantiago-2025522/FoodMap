export enum EstadoEntrega {
  Pendiente = 'PENDIENTE',
  QrGenerado = 'QR_GENERADO',
  Confirmada = 'CONFIRMADA'
}

export interface Entrega {
  id: string;
  donadorId: string;
  beneficiarioId: string;
  descripcion: string;
  estado: EstadoEntrega;
  codigoQr: string | null;
  fechaCreacion: Date;
  fechaConfirmacion: Date | null;
}