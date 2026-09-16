import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);

  async obtenerCoordenadas(direccion: string, codigoPais: string = 'gt'): Promise<{ latitud: number; longitud: number }> {
    if (!direccion) {
      return { latitud: 14.6349, longitud: -90.5069 };
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&countrycodes=${codigoPais}&limit=1`;

    try {
      const resultados = await firstValueFrom(
        this.http.get<any[]>(url, {
          headers: { 'User-Agent': 'AppDonaciones/1.0' }
        })
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