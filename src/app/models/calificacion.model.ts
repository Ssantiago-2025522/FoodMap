export interface Calificacion {
  id: string;
  entregaId: string;
  calificadorId: string;
  calificadoId: string;
  puntuacion: number;
  comentario?: string;
  fecha: Date;
}