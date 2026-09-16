import { Component, inject, ElementRef, ViewChild, AfterViewInit, EffectRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { DonacionService } from '../../services/donacion.service';
import { Donacion } from '../../models/donacion';

@Component({
  selector: 'app-donacion-mapa',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donacion-mapa.component.html',
  styleUrl: './donacion-mapa.component.css'
})
export class DonacionMapaComponent implements AfterViewInit {
  @ViewChild('mapaContainer') mapaContainer!: ElementRef<HTMLDivElement>;

  private donacionService = inject(DonacionService);
  private mapa!: L.Map;
  private grupoMarcadores = L.layerGroup();

  constructor() {
    // Escucha cambios en las donaciones filtradas y actualiza los pines del mapa en tiempo real
    effect(() => {
      const donaciones = this.donacionService.donacionesFiltradas();
      if (this.mapa) {
        this.actualizarMarcadores(donaciones);
      }
    });
  }

  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  private inicializarMapa(): void {
    // Coordenadas iniciales por defecto (Guatemala)
    this.mapa = L.map(this.mapaContainer.nativeElement).setView([14.6349, -90.5069], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapa);

    this.grupoMarcadores.addTo(this.mapa);
    this.actualizarMarcadores(this.donacionService.donacionesFiltradas());
  }

  private actualizarMarcadores(donaciones: Donacion[]): void {
    this.grupoMarcadores.clearLayers();

    donaciones.forEach((donacion) => {
      if (donacion.latitud && donacion.longitud) {
        const popupContenido = `
          <div style="font-family: system-ui, sans-serif;">
            <h4 style="margin: 0 0 5px 0; color: #1e293b;">${donacion.titulo}</h4>
            <p style="margin: 0 0 5px 0; font-size: 0.85rem; color: #64748b;">${donacion.descripcion}</p>
            <p style="margin: 0; font-size: 0.8rem;"><b>Categoría:</b> ${donacion.categoria}</p>
            <p style="margin: 0; font-size: 0.8rem;"><b>Estado:</b> ${donacion.estado}</p>
            <p style="margin: 0; font-size: 0.8rem;"><b>Ubicación:</b> ${donacion.ubicacion}</p>
          </div>
        `;

        L.marker([donacion.latitud, donacion.longitud])
          .bindPopup(popupContenido)
          .addTo(this.grupoMarcadores);
      }
    });
  }
}