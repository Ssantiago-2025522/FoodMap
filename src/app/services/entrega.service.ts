import { Injectable } from '@angular/core';
import { Entrega, EstadoEntrega } from '../models/entrega.model';

@Injectable({
  providedIn: 'root'
})
export class EntregaService {

  private entregas: Entrega[] = [];

  private normalizarId(id: string): string {
    return id.trim();
  }

  private generarId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `entrega-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  }

  obtenerTodas(): Entrega[] {
    return this.entregas;
  }

  obtenerPorId(id: string): Entrega | undefined {
    const idNormalizado = this.normalizarId(id);

    return this.entregas.find(entrega => this.normalizarId(entrega.id) === idNormalizado);
  }

  crear(donadorId: string, beneficiarioId: string, descripcion: string): Entrega {
    const donador = donadorId.trim();
    const beneficiario = beneficiarioId.trim();
    const descripcionLimpia = descripcion.trim();

    const nuevaEntrega: Entrega = {
      id: this.generarId(),
      donadorId: donador,
      beneficiarioId: beneficiario,
      descripcion: descripcionLimpia,
      estado: EstadoEntrega.Pendiente,
      codigoQr: null,
      fechaCreacion: new Date(),
      fechaConfirmacion: null
    };

    this.entregas.push(nuevaEntrega);
    return nuevaEntrega;
  }

  actualizar(id: string, cambios: Partial<Entrega>): Entrega | undefined {
    const entrega = this.obtenerPorId(id);

    if (!entrega) {
      return undefined;
    }

    Object.assign(entrega, cambios);
    return entrega;
  }

  eliminar(id: string): boolean {
    const indice = this.entregas.findIndex(entrega => entrega.id === id);

    if (indice === -1) {
      return false;
    }

    this.entregas.splice(indice, 1);
    return true;
  }

  marcarQrGenerado(id: string): Entrega | undefined {
    const entrega = this.obtenerPorId(id);

    if (!entrega) {
      return undefined;
    }

    if (entrega.estado !== EstadoEntrega.Pendiente) {
      return undefined;
    }

    entrega.estado = EstadoEntrega.QrGenerado;
    return entrega;
  }

  confirmarEntrega(id: string): Entrega | undefined {
    const entrega = this.obtenerPorId(id);

    if (!entrega) {
      return undefined;
    }

    if (entrega.estado !== EstadoEntrega.QrGenerado) {
      return undefined;
    }

    entrega.estado = EstadoEntrega.Confirmada;
    entrega.fechaConfirmacion = new Date();
    return entrega;
  }
}