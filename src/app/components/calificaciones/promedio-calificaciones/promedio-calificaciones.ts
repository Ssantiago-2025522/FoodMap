import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalificacionService } from '../../../services/calificacion.service';

@Component({
  selector: 'app-promedio-calificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './promedio-calificaciones.html',
  styleUrl: './promedio-calificaciones.css'
})
export class PromedioCalificaciones {

  calificadoId: string = '';

  mensajeError: string = '';
  calculoRealizado: boolean = false;
  cantidadCalificaciones: number = 0;
  promedio: string = '0.00';

  constructor(private calificacionService: CalificacionService) { }

  calcularPromedio(): void {
    this.mensajeError = '';
    this.calculoRealizado = false;

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

    const sumaPuntuaciones = calificacionesDelUsuario.reduce(
      (acumulado, calificacion) => acumulado + calificacion.puntuacion,
      0
    );

    const promedioCalculado = sumaPuntuaciones / calificacionesDelUsuario.length;

    this.cantidadCalificaciones = calificacionesDelUsuario.length;
    this.promedio = promedioCalculado.toFixed(2);
    this.calculoRealizado = true;
  }

  limpiar(): void {
    this.calificadoId = '';
    this.mensajeError = '';
    this.calculoRealizado = false;
    this.cantidadCalificaciones = 0;
    this.promedio = '0.00';
  }
}