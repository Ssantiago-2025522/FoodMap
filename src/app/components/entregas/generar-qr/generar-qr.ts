import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toDataURL } from 'qrcode';
import { QrService } from '../../../services/qr.service';
import { Entrega } from '../../../models/entrega.model';

@Component({
  selector: 'app-generar-qr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generar-qr.html',
  styleUrl: './generar-qr.css'
})
export class GenerarQr {

  idEntrega: string = '';

  mensajeError: string = '';
  entregaConQr: Entrega | null = null;
  imagenQr: string | null = null;

  constructor(private qrService: QrService) { }

  async generarQr(): Promise<void> {
    this.mensajeError = '';
    this.entregaConQr = null;
    this.imagenQr = null;

    if (!this.idEntrega.trim()) {
      this.mensajeError = 'Debes ingresar un ID de entrega.';
      return;
    }

    const resultado = this.qrService.generarQr(this.idEntrega);

    if (!resultado) {
      this.mensajeError = 'No se pudo generar el código QR para esta entrega.';
      return;
    }

    this.entregaConQr = resultado;

    if (resultado.codigoQr) {
      try {
        this.imagenQr = await toDataURL(resultado.codigoQr);
      } catch (error) {
        console.error('Error al generar la imagen del QR:', error);
        this.mensajeError = 'La entrega se procesó, pero no se pudo generar la imagen del QR.';
      }
    }
  }

  limpiar(): void {
    this.idEntrega = '';
    this.mensajeError = '';
    this.entregaConQr = null;
    this.imagenQr = null;
  }
}

