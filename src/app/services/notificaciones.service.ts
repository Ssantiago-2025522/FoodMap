import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notificacion } from '../models/notificacion';

@Injectable({ 
    providedIn: 'root' 
})
export class Notificaciones {
  private baseUrl = 'http://localhost:3000/api/notificaciones';

  constructor(private http: HttpClient) {}

  obtenerPorUsuario(idUsuario: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.baseUrl}?usuario=${idUsuario}`);
  }

  marcarComoLeida(idNotificacion: number, idUsuario: number): Observable<Notificacion> {
    return this.http.patch<Notificacion>(
      `${this.baseUrl}/${idNotificacion}/leida?usuario=${idUsuario}`,
      {}
    );
  }
}