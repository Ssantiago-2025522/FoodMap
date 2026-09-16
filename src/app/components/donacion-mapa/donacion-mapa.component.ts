import { Component, AfterViewInit, inject, EffectRef, effect } from '@angular/core';
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
    this.map = L.map('mapa-leaf').setView([14.6349, -90.5069], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
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
        const marker = L.marker([donacion.latitud, donacion.longitud], { icon: iconoPersonalizado })
          .addTo(this.map)
          .bindPopup(`
            <b style="color: #2E8B57;">${donacion.titulo}</b><br>
            <span>${donacion.ubicacion}</span><br>
            <small>Cantidad: ${donacion.cantidad}</small>
          `);

        this.capasMarcadores.push(marker);
        puntosCoordenadas.push([donacion.latitud, donacion.longitud]);
      }
    });

    if (puntosCoordenadas.length > 0) {
      if (puntosCoordenadas.length === 1) {
        this.map.flyTo(puntosCoordenadas[0], 13);
      } else {
        const bounds = L.latLngBounds(puntosCoordenadas);
        this.map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }
}