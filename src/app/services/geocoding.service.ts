import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Pais {
  codigo: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);

  async obtenerPaises(): Promise<Pais[]> {
    return [
      { codigo: 'gt', nombre: 'Guatemala' },
      { codigo: 'mx', nombre: 'México' },
      { codigo: 'sv', nombre: 'El Salvador' },
      { codigo: 'hn', nombre: 'Honduras' },
      { codigo: 'cr', nombre: 'Costa Rica' },
      { codigo: 'co', nombre: 'Colombia' },
      { codigo: 'es', nombre: 'España' },
      { codigo: 'us', nombre: 'Estados Unidos' }
    ];
  }

  async obtenerCoordenadas(
    direccion: string,
    codigoPais: string = 'gt'
  ): Promise<{ latitud: number; longitud: number }> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&countrycodes=${codigoPais}&limit=1`;

    try {
      const resultados = await firstValueFrom(
        this.http.get<any[]>(url)
      );

      if (resultados && resultados.length > 0) {
        return {
          latitud: parseFloat(resultados[0].lat),
          longitud: parseFloat(resultados[0].lon)
        };
      }
    } catch (error) {
      console.error('Error en geocodificación:', error);
    }

    return { latitud: 14.6349, longitud: -90.5069 };
  }
}