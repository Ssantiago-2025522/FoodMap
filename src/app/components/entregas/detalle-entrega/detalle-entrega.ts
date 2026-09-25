import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntregaService } from '../../../services/entrega.service';
import { Entrega } from '../../../models/entrega.model';

@Component({
  selector: 'app-detalle-entrega',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-entrega.html',
  styleUrl: './detalle-entrega.css'
})
export class DetalleEntrega {

  idBuscado: string = '';

  mensajeError: string = '';
  entregaEncontrada: Entrega | null = null;
  busquedaRealizada: boolean = false;

  constructor(private entregaService: EntregaService) { }

  buscarEntrega(): void {
    this.mensajeError = '';
    this.entregaEncontrada = null;

    const idBuscado = this.idBuscado.trim();

    if (!idBuscado) {
      this.mensajeError = 'Debes ingresar un ID de entrega.';
      this.busquedaRealizada = false;
      return;
    }

    this.idBuscado = idBuscado;
    const resultado = this.entregaService.obtenerPorId(idBuscado);

    this.busquedaRealizada = true;

    if (resultado) {
      this.entregaEncontrada = resultado;
    } else {
      this.mensajeError = 'No se encontró ninguna entrega con ese ID.';
    }
  }

  limpiarBusqueda(): void {
    this.idBuscado = '';
    this.mensajeError = '';
    this.entregaEncontrada = null;
    this.busquedaRealizada = false;
  }
}