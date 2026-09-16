import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, map } from 'rxjs';

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
    try {
      const url = 'https://restcountries.com/v3.1/all?fields=name,cca2';
      const data = await firstValueFrom(this.http.get<any[]>(url));
      
      const listaPaises = data.map(p => ({
        codigo: p.cca2.toLowerCase(),
        nombre: p.name.common
      }));

      return listaPaises.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } catch (error) {
      console.error('Error al cargar países mundialmente:', error);
      return [
        { codigo: 'gt', nombre: 'Guatemala' },
        { codigo: 'mx', nombre: 'México' },
        { codigo: 'es', nombre: 'España' },
        { codigo: 'us', nombre: 'Estados Unidos' }
      ];
    }
  }

  async obtenerCoordenadas(
    direccion: string,
     codigoPais: string = 'gt'
    ): Promise<{ latitud: number; longitud: number }> {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&countrycodes=${codigoPais}&limit=1`;

    try {
      const resultados = await firstValueFrom(
        this.http.get<any[]>(url, {
          headers: { 'User-Agent': 'FoodMapApp/1.0' }
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