import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { Notificacion } from '../models/notificacion';

@Injectable({
  providedIn: 'root'
})
export class Notificaciones {
  private baseUrl = `${API_URL}/notificaciones`;

  readonly noLeidas = signal(0);

  constructor(private http: HttpClient) {}

  obtenerPorUsuario(idUsuario: number, soloNoLeidas = false): Observable<Notificacion[]> {
    let params = new HttpParams().set('usuario', idUsuario);
    if (soloNoLeidas) params = params.set('leida', 'false');
    return this.http.get<Notificacion[]>(this.baseUrl, { params });
  }

  marcarComoLeida(idNotificacion: number, idUsuario: number): Observable<Notificacion> {
    const params = new HttpParams().set('usuario', idUsuario);
    return this.http.patch<Notificacion>(`${this.baseUrl}/${idNotificacion}/leida`, {}, { params });
  }

  marcarTodasComoLeidas(idUsuario: number): Observable<{ actualizadas: number }> {
    const params = new HttpParams().set('usuario', idUsuario);
    return this.http.patch<{ actualizadas: number }>(`${this.baseUrl}/leidas`, {}, { params });
  }

  generarCercanas(idUsuario: number, latitud: number, longitud: number, radioKm: number): Observable<{ generadas: number }> {
    return this.http.post<{ generadas: number }>(`${this.baseUrl}/cercanos`, {
      id_usuario: idUsuario, latitud, longitud, radio_km: radioKm
    });
  }

  actualizarContador(idUsuario: number): void {
    this.obtenerPorUsuario(idUsuario, true).subscribe({
      next: (lista) => this.noLeidas.set(lista.length),
      error: () => {}
    });
  }
}
