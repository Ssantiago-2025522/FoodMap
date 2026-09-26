import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { Entrega, EntregaQr } from '../models/entrega.model';

@Injectable({
  providedIn: 'root'
})
export class EntregaService {
  private baseUrl = `${API_URL}/solicitudes`;

  constructor(private http: HttpClient) {}

  obtenerQr(idSolicitud: number): Observable<EntregaQr> {
    return this.http.get<EntregaQr>(`${this.baseUrl}/${idSolicitud}/qr`);
  }

  validarQr(token: string, observaciones?: string): Observable<Entrega> {
    return this.http.post<Entrega>(`${this.baseUrl}/validar-qr`, { token, observaciones });
  }
}
