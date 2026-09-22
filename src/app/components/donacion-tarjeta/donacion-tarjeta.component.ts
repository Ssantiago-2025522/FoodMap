import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Donacion, EstadoDonacion } from '../../models/donacion';

@Component({
  selector: 'app-donacion-tarjeta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donacion-tarjeta.component.html',
  styleUrl: './donacion-tarjeta.component.css'
})
export class DonacionTarjetaComponent {
  @Input({ required: true }) donacion!: Donacion;

  @Output() editar = new EventEmitter<Donacion>();
  @Output() eliminar = new EventEmitter<string>();
  @Output() cambiarEstado = new EventEmitter<{ id: string; estado: EstadoDonacion }>();

  estadosDisponibles: EstadoDonacion[] = ['Disponible', 'Reservada', 'Entregada', 'Expirada'];

  obtenerClaseEstado(estado: EstadoDonacion): string {
    switch (estado) {
      case 'Disponible': return 'badge-disponible';
      case 'Reservada': return 'badge-reservada';
      case 'Entregada': return 'badge-entregada';
      case 'Expirada': return 'badge-expirada';
    }
  }

  onCambiarEstado(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const nuevoEstado = selectElement.value as EstadoDonacion;
    this.cambiarEstado.emit({ id: this.donacion.id, estado: nuevoEstado });
  }
}