import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalificacionService } from '../../../services/calificacion.service';
import { Calificacion } from '../../../models/calificacion.model';

@Component({
  selector: 'app-promedio-calificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promedio-calificaciones.html',
  styleUrl: './promedio-calificaciones.css'
})
export class PromedioCalificaciones {
  entregaId: number | null = null;
  mensajeError: string = '';
  calculoRealizado: boolean = false;
  cantidadCalificaciones: number = 0;
  promedio: string = '0.00';

  constructor(private calificacionService: CalificacionService) {}

  calcularPromedio(): void {
    console.log('CALCULAR PROMEDIO', this.entregaId);

    this.mensajeError = '';
    this.calculoRealizado = false;

    if (
      this.entregaId === null ||
      !Number.isInteger(this.entregaId) ||
      this.entregaId <= 0
    ) {
      this.mensajeError = 'Debes ingresar un ID de entrega válido.';
      return;
    }

    const idEntrega = this.entregaId;

    this.calificacionService.obtenerPorEntrega(idEntrega).subscribe({
      next: (calificaciones: Calificacion[]) => {
        if (calificaciones.length === 0) {
          this.mensajeError =
            'Esta entrega no tiene calificaciones registradas.';
          return;
        }

        const sumaPuntuaciones = calificaciones.reduce(
          (acumulado: number, calificacion: Calificacion) =>
            acumulado + calificacion.puntuacion,
          0
        );

        const promedioCalculado =
          sumaPuntuaciones / calificaciones.length;

        this.cantidadCalificaciones = calificaciones.length;
        this.promedio = promedioCalculado.toFixed(2);
        this.calculoRealizado = true;
      },

      error: (error) => {
        console.error('Error al calcular promedio:', error);
        this.mensajeError =
          error?.error?.message ||
          'No fue posible obtener las calificaciones.';
      }
    });
  }

  limpiar(): void {
    this.entregaId = null;
    this.mensajeError = '';
    this.calculoRealizado = false;
    this.cantidadCalificaciones = 0;
    this.promedio = '0.00';
  }
}