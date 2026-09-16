// src/app/core/services/reporte-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReporteApiService {
    private apiUrl = 'http://localhost:3000/api/reportes';

    constructor(private http: HttpClient) {}

    getReportes(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }

    getReporteById(id: number | string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    crearReporte(data: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, data);
    }

    actualizarReporte(id: number | string, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, data);
    }

    eliminarReporte(id: number | string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}