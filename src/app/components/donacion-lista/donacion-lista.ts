import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonacionService } from '../../services/donacion.service';
import { DonacionTarjetaComponent } from '../donacion-tarjeta/donacion-tarjeta';
import { Donacion, EstadoDonacion } from '../../models/donacion';

@Component({
  selector: 'app-donacion-lista',
  standalone: true,
  imports: [CommonModule, DonacionTarjetaComponent],
  templateUrl: './donacion-lista.html',
  styleUrl: './donacion-lista.css'
})
export class DonacionListaComponent {
  private donacionService = inject(DonacionService);

  @Output() editarDonacion = new EventEmitter<Donacion>();

  // Consumimos directamente la Signal del servicio
  donaciones = this.donacionService.donacionesFiltradas;

  onCambiarEstado(evento: { id: string; estado: EstadoDonacion }): void {
    this.donacionService.cambiarEstado(evento.id, evento.estado);
  }

  onEliminar(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta donación?')) {
      this.donacionService.eliminarDonacion(id);
    }
  }

  onEditar(donacion: Donacion): void {
    this.editarDonacion.emit(donacion);
  }
}