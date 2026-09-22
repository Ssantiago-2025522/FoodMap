import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntregaService } from '../../../services/entrega.service';
import { Entrega, EstadoEntrega } from '../../../models/entrega.model';

@Component({
  selector: 'app-validar-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validar-qr.html',
  styleUrl: './validar-qr.css'
})
export class ValidarQr {

  codigoIngresado: string = '';

  mensajeError: string = '';
  mensajeExito: string = '';
  entregaValidada: Entrega | null = null;

  constructor(private entregaService: EntregaService) { }

  confirmarPorQr(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.entregaValidada = null;

    if (!this.codigoIngresado.trim()) {
      this.mensajeError = 'Debes ingresar un código QR.';
      return;
    }

    const entregaEncontrada = this.entregaService
      .obtenerTodas()
      .find(entrega => entrega.codigoQr === this.codigoIngresado);

    if (!entregaEncontrada) {
      this.mensajeError = 'No existe ninguna entrega con ese código QR.';
      return;
    }

    if (entregaEncontrada.estado === EstadoEntrega.Confirmada) {
      this.entregaValidada = entregaEncontrada;
      this.mensajeError = 'Esta entrega ya fue confirmada anteriormente.';
      return;
    }

    if (entregaEncontrada.estado !== EstadoEntrega.QrGenerado) {
      this.entregaValidada = entregaEncontrada;
      this.mensajeError = 'La entrega no está en un estado válido para ser confirmada.';
      return;
    }

    const entregaConfirmada = this.entregaService.confirmarEntrega(entregaEncontrada.id);

    if (entregaConfirmada) {
      this.entregaValidada = entregaConfirmada;
      this.mensajeExito = 'La entrega fue confirmada correctamente.';
    } else {
      this.mensajeError = 'No se pudo confirmar la entrega.';
    }
  }

  limpiar(): void {
    this.codigoIngresado = '';
    this.mensajeError = '';
    this.mensajeExito = '';
    this.entregaValidada = null;
  }
}