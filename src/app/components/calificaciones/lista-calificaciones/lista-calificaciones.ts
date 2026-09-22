import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalificacionService } from '../../../services/calificacion.service';
import { Calificacion } from '../../../models/calificacion.model';

@Component({
  selector: 'app-lista-calificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-calificaciones.html',
  styleUrl: './lista-calificaciones.css'
})
export class ListaCalificaciones implements OnInit {

  entregaIdFiltro: string = '';
  calificaciones: Calificacion[] = [];
  mensajeInfo: string = '';

  constructor(private calificacionService: CalificacionService) { }

  ngOnInit(): void {
    this.cargarTodas();
  }

  buscarPorEntrega(): void {
    this.mensajeInfo = '';

    if (!this.entregaIdFiltro.trim()) {
      this.cargarTodas();
      return;
    }

    this.calificaciones = this.calificacionService.obtenerPorEntrega(this.entregaIdFiltro);

    if (this.calificaciones.length === 0) {
      this.mensajeInfo = 'No existen calificaciones para esa entrega.';
    }
  }

  limpiarFiltro(): void {
    this.entregaIdFiltro = '';
    this.cargarTodas();
  }

  private cargarTodas(): void {
    this.mensajeInfo = '';
    this.calificaciones = this.calificacionService.obtenerTodas();

    if (this.calificaciones.length === 0) {
      this.mensajeInfo = 'No hay calificaciones registradas.';
    }
  }
}