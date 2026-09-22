import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import {
  DonacionDisponible, HistorialItem, RolSolicitud, Solicitud, SolicitudDetalle
} from '../models/solicitud';

@Injectable({
  providedIn: 'root'
})
export class Solicitudes {
  private baseUrl = `${API_URL}/solicitudes`;

  constructor(private http: HttpClient) {}

  obtenerDonacionesDisponibles(): Observable<DonacionDisponible[]> {
    return this.http.get<DonacionDisponible[]>(`${this.baseUrl}/donaciones-disponibles`);
  }

  crearSolicitud(
    idDonacion: number, cantidadSolicitada: number, comentario: string
  ): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.baseUrl, {
      id_donacion: idDonacion,
      cantidad_solicitada: cantidadSolicitada,
      comentario
    });
  }

  obtenerSolicitudes(rol: RolSolicitud): Observable<SolicitudDetalle[]> {
    const params = new HttpParams().set('rol', rol);
    return this.http.get<SolicitudDetalle[]>(this.baseUrl, { params });
  }

  obtenerSolicitud(id: number): Observable<SolicitudDetalle> {
    return this.http.get<SolicitudDetalle>(`${this.baseUrl}/${id}`);
  }

  obtenerHistorial(): Observable<HistorialItem[]> {
    return this.http.get<HistorialItem[]>(`${this.baseUrl}/historial`);
  }

  aceptarSolicitud(id: number): Observable<{ solicitud: Solicitud; chat: any; entrega: any }> {
    return this.http.patch<{ solicitud: Solicitud; chat: any; entrega: any }>(
      `${this.baseUrl}/${id}/aceptar`, {}
    );
  }

  rechazarSolicitud(id: number): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.baseUrl}/${id}/rechazar`, {});
  }

  confirmarRecepcion(id: number, observaciones?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/confirmar-recepcion`, { observaciones });
  }
}
