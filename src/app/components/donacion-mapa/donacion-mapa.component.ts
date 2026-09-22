import { Component, AfterViewInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonacionService } from '../../services/donacion.service';
import * as L from 'leaflet';

const iconoPersonalizado = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Imagen neutra en URL limpia para evitar romper el string de Leaflet
const IMAGEN_DEFAULT = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';

@Component({
  selector: 'app-donacion-mapa',
  standalone: true,
  imports: [CommonModule],
  template: `<div id="mapa-leaf"></div>`,
  styles: [`
    #mapa-leaf {
      width: 100%;
      height: 380px;
      border-radius: 16px;
      z-index: 1;
      background-color: #aad3df;
    }
  `]
})
export class DonacionMapaComponent implements AfterViewInit {
  private donacionService = inject(DonacionService);
  private map!: L.Map;
  private capasMarcadores: L.Marker[] = [];

  constructor() {
    effect(() => {
      const donaciones = this.donacionService.donacionesFiltradas();
      if (this.map) {
        this.actualizarMarcadores(donaciones);
      }
    });
  }

  ngAfterViewInit(): void {
    const limitesMundo = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));

    this.map = L.map('mapa-leaf', {
      center: [14.6349, -90.5069],
      zoom: 10,
      minZoom: 2,
      maxBounds: limitesMundo,
      maxBoundsViscosity: 1.0
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      noWrap: true,
      bounds: limitesMundo,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
      this.actualizarMarcadores(this.donacionService.donacionesFiltradas());
    }, 250);
  }

  private actualizarMarcadores(donaciones: any[]): void {
    this.capasMarcadores.forEach(m => this.map.removeLayer(m));
    this.capasMarcadores = [];

    if (!donaciones || donaciones.length === 0) return;

    const puntosCoordenadas: L.LatLngExpression[] = [];

    donaciones.forEach(donacion => {
      if (donacion.latitud && donacion.longitud) {
        const urlObtenida = donacion.imagen || donacion.imagenUrl || donacion.urlImagen;
        const urlFinal = (urlObtenida && String(urlObtenida).trim() !== '') ? urlObtenida : IMAGEN_DEFAULT;

        const contenidoPopup = `
          <div style="width: 180px; text-align: center; font-family: sans-serif;">
            <div style="width: 100%; height: 90px; overflow: hidden; border-radius: 8px; margin-bottom: 6px; background: #e0e0e0;">
              <img src="${urlFinal}" 
                   alt="${donacion.titulo}" 
                   style="width: 100%; height: 100%; object-fit: cover; display: block;" />
            </div>
            <b style="color: #1b5334; font-size: 13px; display: block; margin-bottom: 2px;">${donacion.titulo}</b>
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #555; line-height: 1.2;">${donacion.ubicacion || 'Sin dirección'}</p>
            <span style="font-size: 11px; color: #2E8B57; font-weight: bold;">Cantidad: ${donacion.cantidad}</span>
          </div>
        `;

        const marker = L.marker([donacion.latitud, donacion.longitud], { icon: iconoPersonalizado })
          .addTo(this.map)
          .bindPopup(contenidoPopup);

        this.capasMarcadores.push(marker);
        puntosCoordenadas.push([donacion.latitud, donacion.longitud]);
      }
    });

    if (puntosCoordenadas.length > 0) {
      if (puntosCoordenadas.length === 1) {
        this.map.flyTo(puntosCoordenadas[0], 13);
      } else {
        const bounds = L.latLngBounds(puntosCoordenadas);
        this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }
}