import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReporteApiService } from '../../../../core/services/reporte-api.service';

@Component({
    selector: 'app-reportes-lista',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './reportes-lista.html'
})
export class ReportesLista implements OnInit {
    reportes: any[] = [];
    isLoading = false;
    errorMessage = '';

    filtroEstado = '';
    filtroTipo = '';
    tipos: string[] = ['Publicación', 'Usuario', 'Donación', 'Comentario'];

    constructor(
        private reporteApiService: ReporteApiService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.cargarReportes();
    }

    get reportesFiltrados(): any[] {
        return this.reportes.filter(reporte => {
            const cumpleEstado = !this.filtroEstado || reporte.estado === this.filtroEstado;
            const cumpleTipo = !this.filtroTipo || reporte.tipo === this.filtroTipo;
            return cumpleEstado && cumpleTipo;
        });
    }

    cargarReportes(): void {
        this.isLoading = true;
        this.reporteApiService.getReportes().subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this.reportes = Array.isArray(response) ? response : response?.data ?? [];
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cargar lista de reportes.';
                console.error(error);
            }
        });
    }

    cambiarEstado(reporte: any, nuevoEstado: string): void {
        this.isLoading = true;
        this.reporteApiService.actualizarReporte(reporte.id_reporte, { estado: nuevoEstado }).subscribe({
            next: () => {
                this.isLoading = false;
                reporte.estado = nuevoEstado;
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cambiar estado.';
                console.error(error);
            }
        });
    }

    eliminar(id: number | string): void {
        if (!confirm('¿Desea eliminar este reporte?')) return;

        this.isLoading = true;
        this.reporteApiService.eliminarReporte(id).subscribe({
            next: () => {
                this.isLoading = false;
                this.cargarReportes();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al eliminar el reporte.';
                console.error(error);
            }
        });
    }
}