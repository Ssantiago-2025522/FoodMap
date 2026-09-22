import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioApiService {
    private apiUrl = `${environment.apiUrl}/usuarios`;

    constructor(private http: HttpClient) {}

    getUsuarios(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }

    getUsuarioById(id: number | string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    crearUsuario(data: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, data);
    }

    actualizarUsuario(id: number | string, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data);
    }

    eliminarUsuario(id: number | string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }

    ocultarPublicaciones(id: number | string, oculta: boolean = true): Observable<any> {
        return this.http.patch<any>(`${this.apiUrl}/${id}/ocultar-publicaciones`, { oculta });
    }

    buscarUsuarios(query: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}?search=${encodeURIComponent(query)}`);
    }
}