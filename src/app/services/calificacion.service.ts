import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { Calificacion } from '../models/calificacion.model';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {

  private baseUrl = `${API_URL}/calificaciones`;

  constructor(private http: HttpClient) {}

  crear(
    id_entrega: number,
    puntuacion: number,
    comentario?: string
  ): Observable<Calificacion> {
    return this.http.post<Calificacion>(this.baseUrl, {
      id_entrega,
      puntuacion,
      comentario: comentario ?? ''
    });
  }

  obtenerPorEntrega(idEntrega: number): Observable<Calificacion[]> {
    return this.http.get<Calificacion[]>(
      `${this.baseUrl}/entrega/${idEntrega}`
    );
  }
}