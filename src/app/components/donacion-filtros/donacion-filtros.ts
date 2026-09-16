import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonacionService } from '../../services/donacion.service';
import { CategoriaDonacion, EstadoDonacion } from '../../models/donacion';

@Component({
  selector: 'app-donacion-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './donacion-filtros.html',
  styleUrl: './donacion-filtros.css'
})
export class DonacionFiltrosComponent {
  private donacionService = inject(DonacionService);

  textoBusqueda = '';
  categoriaSeleccionada: CategoriaDonacion | 'Todas' = 'Todas';
  estadoSeleccionado: EstadoDonacion | 'Todos' = 'Todos';

  categorias: (CategoriaDonacion | 'Todas')[] = [
    'Todas',
    'Frutas',
    'Verduras',
    'Lácteos',
    'Pan',
    'Comida preparada',
    'Bebidas'
  ];

  estados: (EstadoDonacion | 'Todos')[] = [
    'Todos',
    'Disponible',
    'Reservada',
    'Entregada',
    'Expirada'
  ];

  onFiltroChange(): void {
    this.donacionService.aplicarFiltros({
      busqueda: this.textoBusqueda,
      categoria: this.categoriaSeleccionada,
      estado: this.estadoSeleccionado
    });
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.categoriaSeleccionada = 'Todas';
    this.estadoSeleccionado = 'Todos';
    this.onFiltroChange();
  }
}