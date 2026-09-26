import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DonacionService } from '../../services/donacion.service';
import { GeocodingService, Pais } from '../../services/geocoding.service';
import { CategoriaDonacion, EstadoDonacion } from '../../models/donacion';

@Component({
  selector: 'app-donacion-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './donacion-filtros.component.html',
  styleUrl: './donacion-filtros.component.css'
})
export class DonacionFiltrosComponent implements OnInit {
  private donacionService = inject(DonacionService);
  private geocodingService = inject(GeocodingService);

  textoBusqueda = '';
  nombrePaisEscrito = 'Guatemala';
  codigoPaisSeleccionado = 'gt';

  categoriaSeleccionada: CategoriaDonacion | 'Todas' = 'Todas';
  estadoSeleccionado: EstadoDonacion | 'Todos' = 'Todos';

  paises: Pais[] = [];

  categorias: (CategoriaDonacion | 'Todas')[] = [
    'Todas', 'Frutas', 'Verduras', 'Lácteos', 'Pan', 'Comida preparada', 'Bebidas'
  ];

  estados: (EstadoDonacion | 'Todos')[] = [
    'Todos', 'Disponible', 'Reservada', 'Entregada', 'Expirada'
  ];

  async ngOnInit(): Promise<void> {
    this.paises = await this.geocodingService.obtenerPaises();
  }

  alSeleccionarPais(): void {
    const paisEncontrado = this.paises.find(
      p => p.nombre.toLowerCase() === this.nombrePaisEscrito.trim().toLowerCase()
    );

    if (paisEncontrado) {
      this.codigoPaisSeleccionado = paisEncontrado.codigo;
      this.onFiltroChange();
    }
  }

  onFiltroChange(): void {
    this.donacionService.aplicarFiltros({
      busqueda: this.textoBusqueda,
      pais: this.codigoPaisSeleccionado,
      categoria: this.categoriaSeleccionada,
      estado: this.estadoSeleccionado
    });
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.nombrePaisEscrito = 'Guatemala';
    this.codigoPaisSeleccionado = 'gt';
    this.categoriaSeleccionada = 'Todas';
    this.estadoSeleccionado = 'Todos';
    this.onFiltroChange();
  }
}