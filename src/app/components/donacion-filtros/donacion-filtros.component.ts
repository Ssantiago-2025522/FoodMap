import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonacionService } from '../../services/donacion.service';
import { CategoriaDonacion, EstadoDonacion } from '../../models/donacion';

export interface Pais {
  codigo: string;
  nombre: string;
}

@Component({
  selector: 'app-donacion-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './donacion-filtros.component.html',
  styleUrl: './donacion-filtros.component.css'
})
export class DonacionFiltrosComponent {
  private donacionService = inject(DonacionService);

  textoBusqueda = '';
  paisSeleccionado = 'gt';
  categoriaSeleccionada: CategoriaDonacion | 'Todas' = 'Todas';
  estadoSeleccionado: EstadoDonacion | 'Todos' = 'Todos';

  paises: Pais[] = [
    { codigo: 'gt', nombre: 'Guatemala' },
    { codigo: 'sv', nombre: 'El Salvador' },
    { codigo: 'hn', nombre: 'Honduras' },
    { codigo: 'mx', nombre: 'México' },
    { codigo: 'co', nombre: 'Colombia' }
  ];

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
      pais: this.paisSeleccionado,
      categoria: this.categoriaSeleccionada,
      estado: this.estadoSeleccionado
    });
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.paisSeleccionado = 'gt';
    this.categoriaSeleccionada = 'Todas';
    this.estadoSeleccionado = 'Todos';
    this.onFiltroChange();
  }
}