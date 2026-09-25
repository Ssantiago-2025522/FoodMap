import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalificacionService } from '../../../services/calificacion.service';
import { Calificacion } from '../../../models/calificacion.model';

@Component({
  selector: 'app-crear-calificacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-calificacion.html',
  styleUrl: './crear-calificacion.css'
})
export class CrearCalificacion {

  entregaId: string = '';
  calificadorId: string = '';
  calificadoId: string = '';
  puntuacion: number | null = null;
  comentario: string = '';

  mensajeError: string = '';
  mensajeExito: string = '';
  calificacionCreada: Calificacion | null = null;

  constructor(private calificacionService: CalificacionService) { }

  crearCalificacion(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.calificacionCreada = null;

    if (!this.entregaId.trim() || !this.calificadorId.trim() || !this.calificadoId.trim()) {
      this.mensajeError = 'Debes completar entregaId, calificadorId y calificadoId.';
      return;
    }

    if (this.puntuacion === null || this.puntuacion < 1 || this.puntuacion > 5) {
      this.mensajeError = 'La puntuación debe ser un valor entre 1 y 5.';
      return;
    }

    const comentarioFinal = this.comentario.trim() ? this.comentario : undefined;

    const resultado = this.calificacionService.crear(
      this.entregaId,
      this.calificadorId,
      this.calificadoId,
      this.puntuacion,
      comentarioFinal
    );

    if (resultado) {
      this.calificacionCreada = resultado;
      this.mensajeExito = 'La calificación fue registrada correctamente.';
      this.limpiarFormulario();
    } else {
      this.mensajeError = 'No fue posible registrar la calificación.';
    }
  }

  limpiar(): void {
    this.limpiarFormulario();
    this.mensajeError = '';
    this.mensajeExito = '';
    this.calificacionCreada = null;
  }

  private limpiarFormulario(): void {
    this.entregaId = '';
    this.calificadorId = '';
    this.calificadoId = '';
    this.puntuacion = null;
    this.comentario = '';
  }
}