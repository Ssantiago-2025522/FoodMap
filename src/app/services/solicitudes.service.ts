import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Solicitud } from '../models/solicitud';

@Injectable({ 
    providedIn: 'root' 
})
export class Solicitudes {
  private baseUrl = 'http://localhost:3000/api/solicitudes';

  constructor(private http: HttpClient) {}

  crearSolicitud(idDonacion: number, idUsuario: number): Observable<Solicitud> {
    return this.http.post<Solicitud>(this.baseUrl, {
      id_donacion: idDonacion,
      id_usuario: idUsuario
    });
  }

  obtenerSolicitudes(idUsuario: number, rol: 'donador' | 'beneficiario'): Observable<Solicitud[]> {
    return this.http.get<Solicitud[]>(`${this.baseUrl}?usuario=${idUsuario}&rol=${rol}`);
  }

  obtenerSolicitud(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.baseUrl}/${id}`);
  }

  aceptarSolicitud(id: number): Observable<{ solicitud: Solicitud; chat: any; entrega: any }> {
    return this.http.patch<{ solicitud: Solicitud; chat: any; entrega: any }>(
      `${this.baseUrl}/${id}/aceptar`, {}
    );
  }

  rechazarSolicitud(id: number): Observable<Solicitud> {
    return this.http.patch<Solicitud>(`${this.baseUrl}/${id}/rechazar`, {});
  }

  confirmarRecepcion(id: number, idUsuario: number, observaciones?: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/confirmar-recepcion`, {
      id_usuario: idUsuario,
      observaciones
    });
  }
}