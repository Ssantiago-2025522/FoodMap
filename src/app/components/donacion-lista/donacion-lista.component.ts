import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonacionService } from '../../services/donacion.service';
import { DonacionTarjetaComponent } from '../donacion-tarjeta/donacion-tarjeta.component';
import { Donacion, EstadoDonacion } from '../../models/donacion';

@Component({
  selector: 'app-donacion-lista',
  standalone: true,
  imports: [CommonModule, DonacionTarjetaComponent],
  templateUrl: './donacion-lista.component.html',
  styleUrl: './donacion-lista.component.css'
})
export class DonacionListaComponent {
  private donacionService = inject(DonacionService);

  @Output() editarDonacion = new EventEmitter<Donacion>();

  donaciones = this.donacionService.donacionesFiltradas;
  cargando = this.donacionService.cargando;
  error = this.donacionService.error;

  onCambiarEstado(evento: { id: string; estado: EstadoDonacion }): void {
    this.donacionService.cambiarEstado(evento.id, evento.estado);
  }

  onEliminar(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta donación?')) {
      this.donacionService.eliminarDonacion(id).catch(error => {
        console.error('Error al eliminar la donación:', error);
      });
    }
  }

  onEditar(donacion: Donacion): void {
    this.editarDonacion.emit(donacion);
  }
}