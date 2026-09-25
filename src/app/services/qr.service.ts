import { Injectable } from '@angular/core';
import { EntregaService } from './entrega.service';
import { Entrega, EstadoEntrega } from '../models/entrega.model';

@Injectable({
  providedIn: 'root'
})
export class QrService {

  constructor(private entregaService: EntregaService) { }

  generarQr(id: string): Entrega | undefined {
    const entrega = this.entregaService.obtenerPorId(id);

    if (!entrega) {
      return undefined;
    }

    if (entrega.estado === EstadoEntrega.Confirmada) {
      return undefined;
    }

    if (entrega.codigoQr) {
      return entrega;
    }

    if (entrega.estado !== EstadoEntrega.Pendiente) {
      return undefined;
    
    }

    const codigoGenerado = crypto.randomUUID();

    const entregaConEstadoActualizado = this.entregaService.marcarQrGenerado(id);

    if (!entregaConEstadoActualizado) {
      return undefined;
    }

    this.entregaService.actualizar(id, { codigoQr: codigoGenerado });

    return this.entregaService.obtenerPorId(id);
  }
}