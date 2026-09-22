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

  obtenerDonacionesDisponibles(idUsuario: number): Observable<DonacionDisponible[]> {
    const params = new HttpParams().set('usuario', idUsuario);
    return this.http.get<DonacionDisponible[]>(`${this.baseUrl}/donaciones-disponibles`, { params });
  }

  crearSolicitud(
    idDonacion: number, idUsuario: number, cantidadSolicitada: number, comentario: string
  ): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.baseUrl, {
      id_donacion: idDonacion,
      id_usuario: idUsuario,
      cantidad_solicitada: cantidadSolicitada,
      comentario
    });
  }

  obtenerSolicitudes(idUsuario: number, rol: RolSolicitud): Observable<SolicitudDetalle[]> {
    const params = new HttpParams().set('usuario', idUsuario).set('rol', rol);
    return this.http.get<SolicitudDetalle[]>(this.baseUrl, { params });
  }

  obtenerSolicitud(id: number, idUsuario: number): Observable<SolicitudDetalle> {
    const params = new HttpParams().set('usuario', idUsuario);
    return this.http.get<SolicitudDetalle>(`${this.baseUrl}/${id}`, { params });
  }

  obtenerHistorial(idUsuario: number): Observable<HistorialItem[]> {
    const params = new HttpParams().set('usuario', idUsuario);
    return this.http.get<HistorialItem[]>(`${this.baseUrl}/historial`, { params });
  }

  aceptarSolicitud(id: number, idUsuario: number): Observable<{ solicitud: Solicitud; chat: any; entrega: any }> {
    return this.http.patch<{ solicitud: Solicitud; chat: any; entrega: any }>(
      `${this.baseUrl}/${id}/aceptar`, { id_usuario: idUsuario }
    );
  }

  rechazarSolicitud(id: number, idUsuario: number): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.baseUrl}/${id}/rechazar`, { id_usuario: idUsuario });
  }

  confirmarRecepcion(id: number, idUsuario: number, observaciones?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/confirmar-recepcion`, {
      id_usuario: idUsuario,
      observaciones
    });
  }
}
