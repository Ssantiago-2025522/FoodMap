import { Injectable } from '@angular/core';
import { EntregaService } from './entrega.service';
import { EstadoEntrega } from '../models/entrega.model';
import { Calificacion } from '../models/calificacion.model';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {

  private calificaciones: Calificacion[] = [];

  constructor(private entregaService: EntregaService) { }

  crear(
    entregaId: string,
    calificadorId: string,
    calificadoId: string,
    puntuacion: number,
    comentario?: string
  ): Calificacion | undefined {

    const entrega = this.entregaService.obtenerPorId(entregaId);

    if (!entrega) {
      return undefined;
    }

    if (entrega.estado !== EstadoEntrega.Confirmada) {
      return undefined;
    }

    if (puntuacion < 1 || puntuacion > 5) {
      return undefined;
    }

    if (!calificadorId.trim() || !calificadoId.trim()) {
      return undefined;
    }

    const yaCalifico = this.calificaciones.some(
      calificacion =>
        calificacion.entregaId === entregaId &&
        calificacion.calificadorId === calificadorId
    );

    if (yaCalifico) {
      return undefined;
    }

    const nuevaCalificacion: Calificacion = {
      id: crypto.randomUUID(),
      entregaId: entregaId,
      calificadorId: calificadorId,
      calificadoId: calificadoId,
      puntuacion: puntuacion,
      comentario: comentario,
      fecha: new Date()
    };

    this.calificaciones.push(nuevaCalificacion);
    return nuevaCalificacion;
  }

  obtenerTodas(): Calificacion[] {
    return this.calificaciones;
  }

  obtenerPorId(id: string): Calificacion | undefined {
    return this.calificaciones.find(calificacion => calificacion.id === id);
  }

  obtenerPorEntrega(entregaId: string): Calificacion[] {
    return this.calificaciones.filter(calificacion => calificacion.entregaId === entregaId);
  }
}