import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalificacionService } from '../../../services/calificacion.service';
import { Calificacion } from '../../../models/calificacion.model';

@Component({
  selector: 'app-historial-reputacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historial-reputacion.html',
  styleUrl: './historial-reputacion.css'
})
export class HistorialReputacion {

  entregaId: string = '';
  mensajeError: string = '';
  consultaRealizada: boolean = false;
  historial: Calificacion[] = [];

  constructor(private calificacionService: CalificacionService) {}

  consultarHistorial(): void {
    this.mensajeError = '';
    this.consultaRealizada = false;
    this.historial = [];

    if (!this.entregaId.trim()) {
      this.mensajeError = 'Debes ingresar un ID de entrega.';
      return;
    }

    const idEntrega = Number(this.entregaId);

    if (!Number.isInteger(idEntrega) || idEntrega <= 0) {
      this.mensajeError = 'Debes ingresar un ID de entrega válido.';
      return;
    }

    this.calificacionService.obtenerPorEntrega(idEntrega).subscribe({
      next: (calificaciones) => {
        if (calificaciones.length === 0) {
          this.mensajeError =
            'Esta entrega no tiene calificaciones registradas.';
          return;
        }

        this.historial = calificaciones;
        this.consultaRealizada = true;
      },
      error: (error) => {
        console.error('Error al consultar historial:', error);

        this.mensajeError =
          error?.error?.message ||
          'No fue posible consultar el historial.';
      }
    });
  }

  limpiar(): void {
    this.entregaId = '';
    this.mensajeError = '';
    this.consultaRealizada = false;
    this.historial = [];
  }
}