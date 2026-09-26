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

  entregaId: number | null = null;
  puntuacion: number | null = null;
  comentario: string = '';

  mensajeError: string = '';
  mensajeExito: string = '';

  calificacionCreada: Calificacion | null = null;

  constructor(private calificacionService: CalificacionService) {}

  crearCalificacion(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.calificacionCreada = null;

    if (
      this.entregaId === null ||
      !Number.isInteger(this.entregaId) ||
      this.entregaId <= 0
    ) {
      this.mensajeError = 'Ingresa un ID de entrega válido.';
      return;
    }

    if (
      this.puntuacion === null ||
      this.puntuacion < 1 ||
      this.puntuacion > 5
    ) {
      this.mensajeError = 'La puntuación debe estar entre 1 y 5.';
      return;
    }

    const comentarioFinal = this.comentario.trim()
      ? this.comentario.trim()
      : undefined;

    this.calificacionService.crear(
      this.entregaId,
      this.puntuacion,
      comentarioFinal
    ).subscribe({
      next: (resultado) => {
        this.calificacionCreada = resultado;
        this.mensajeExito =
          'La calificación fue registrada correctamente.';
        this.limpiarFormulario();
      },
      error: (error) => {
        console.error('Error al crear calificación:', error);

        this.mensajeError =
          error?.error?.message ||
          'No fue posible registrar la calificación.';
      }
    });
  }

  limpiar(): void {
    this.limpiarFormulario();
    this.mensajeError = '';
    this.mensajeExito = '';
    this.calificacionCreada = null;
  }

  private limpiarFormulario(): void {
    this.entregaId = null;
    this.puntuacion = null;
    this.comentario = '';
  }
}