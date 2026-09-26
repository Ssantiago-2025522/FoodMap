import { Component, EventEmitter, Output, inject } from '@angular/core';
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
  readonly donacionService = inject(DonacionService);

  @Output() editarDonacion = new EventEmitter<Donacion>();

  readonly donaciones = (): Donacion[] => this.donacionService.obtenerDonaciones();

  cambiarEstado(evento: { id: string; estado: EstadoDonacion }): void {
    this.donacionService.cambiarEstado(evento.id, evento.estado);
  }

  eliminarDonacion(id: string): void {
    this.donacionService.eliminarDonacion(id).catch(error => {
      console.error('Error al eliminar la donación:', error);
    });
  }
}