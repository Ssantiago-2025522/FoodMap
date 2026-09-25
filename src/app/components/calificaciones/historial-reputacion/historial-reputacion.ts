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

  calificadoId: string = '';

  mensajeError: string = '';
  consultaRealizada: boolean = false;
  historial: Calificacion[] = [];

  constructor(private calificacionService: CalificacionService) { }

  consultarHistorial(): void {
    this.mensajeError = '';
    this.consultaRealizada = false;
    this.historial = [];

    if (!this.calificadoId.trim()) {
      this.mensajeError = 'Debes ingresar un ID de usuario calificado.';
      return;
    }

    const calificacionesDelUsuario = this.calificacionService
      .obtenerTodas()
      .filter(calificacion => calificacion.calificadoId === this.calificadoId);

    if (calificacionesDelUsuario.length === 0) {
      this.mensajeError = 'Este usuario no tiene calificaciones registradas.';
      return;
    }

    this.historial = calificacionesDelUsuario;
    this.consultaRealizada = true;
  }

  limpiar(): void {
    this.calificadoId = '';
    this.mensajeError = '';
    this.consultaRealizada = false;
    this.historial = [];
  }
}