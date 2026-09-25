import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EntregaService } from '../../../services/entrega.service';
import { Entrega } from '../../../models/entrega.model';

@Component({
  selector: 'app-crear-entrega',
  standalone: true,
imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-entrega.html',
  styleUrl: './crear-entrega.css'
})
export class CrearEntrega {

  donadorId: string = '';
  beneficiarioId: string = '';
  descripcion: string = '';

  mensajeError: string = '';
  mensajeExito: string = '';

  entregaCreada: Entrega | null = null;

  constructor(private entregaService: EntregaService) { }

  crearEntrega(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.donadorId.trim() || !this.beneficiarioId.trim() || !this.descripcion.trim()) {
      this.mensajeError = 'Todos los campos son obligatorios.';
      return;
    }

    const nuevaEntrega = this.entregaService.crear(
      this.donadorId,
      this.beneficiarioId,
      this.descripcion
    );

    this.entregaCreada = nuevaEntrega;
    this.mensajeExito = 'La entrega fue creada correctamente.';

    this.donadorId = '';
    this.beneficiarioId = '';
    this.descripcion = '';
  }
}