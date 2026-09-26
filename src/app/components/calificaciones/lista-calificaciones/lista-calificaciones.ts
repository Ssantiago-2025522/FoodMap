import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CalificacionService } from '../../../services/calificacion.service';
import { Calificacion } from '../../../models/calificacion.model';

@Component({
  selector: 'app-lista-calificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista-calificaciones.html',
  styleUrl: './lista-calificaciones.css'
})
export class ListaCalificaciones implements OnInit {

  entregaIdFiltro: string = '';
  calificaciones: Calificacion[] = [];
  mensajeInfo: string = '';
  mensajeError: string = '';

  constructor(private calificacionService: CalificacionService) {}

  ngOnInit(): void {
    this.mensajeInfo = 'Ingresa un ID de entrega para consultar sus calificaciones.';
  }

  buscarPorEntrega(): void {
    this.mensajeInfo = '';
    this.mensajeError = '';

    if (!this.entregaIdFiltro.trim()) {
      this.mensajeInfo = 'Ingresa un ID de entrega.';
      this.calificaciones = [];
      return;
    }

    const idEntrega = Number(this.entregaIdFiltro);

    if (!Number.isInteger(idEntrega) || idEntrega <= 0) {
      this.mensajeError = 'Ingresa un ID de entrega válido.';
      this.calificaciones = [];
      return;
    }

    this.calificacionService.obtenerPorEntrega(idEntrega).subscribe({
      next: (calificaciones) => {
        this.calificaciones = calificaciones;

        if (calificaciones.length === 0) {
          this.mensajeInfo = 'No existen calificaciones para esa entrega.';
        }
      },
      error: (error) => {
        console.error('Error al obtener calificaciones:', error);

        this.calificaciones = [];
        this.mensajeError =
          error?.error?.message ||
          'No fue posible obtener las calificaciones.';
      }
    });
  }

  limpiarFiltro(): void {
    this.entregaIdFiltro = '';
    this.calificaciones = [];
    this.mensajeError = '';
    this.mensajeInfo = 'Ingresa un ID de entrega para consultar sus calificaciones.';
  }
}