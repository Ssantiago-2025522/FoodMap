import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ReporteApiService } from '../../../../core/services/reporte-api.service';
import { DonacionService } from '../../../../services/donacion.service';

@Component({
    selector: 'app-reportes-lista',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './reportes-lista.html',
    styleUrl: './reportes-lista.css'
})
export class ReportesLista implements OnInit {
    reportes: any[] = [];
    isLoading = false;
    errorMessage = '';

    filtroEstado = '';
    filtroId = '';
    filtroDonacion = '';
    filtroUsuario = '';

    constructor(
        private reporteApiService: ReporteApiService,
        private donacionService: DonacionService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.cargarReportes();
    }

    get reportesFiltrados(): any[] {
        return this.reportes.filter(reporte => {
            const cumpleEstado = !this.filtroEstado || this.filtroEstado === 'TODOS' || reporte.estado === this.filtroEstado;
            const cumpleId = !this.filtroId || String(reporte.id_reporte) === this.filtroId.trim();
            const cumpleDonacion = !this.filtroDonacion || String(reporte.id_donacion) === this.filtroDonacion.trim();
            const cumpleUsuario = !this.filtroUsuario || String(reporte.id_usuario) === this.filtroUsuario.trim();
            return cumpleEstado && cumpleId && cumpleDonacion && cumpleUsuario;
        });
    }

    cargarReportes(): void {
        this.isLoading = true;
        this.reporteApiService.getReportes().subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this.reportes = Array.isArray(response) ? response : response?.data ?? [];
                this.cdr.markForCheck();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cargar lista de reportes.';
                console.error(error);
                this.cdr.markForCheck();
            }
        });
    }

    cambiarEstado(reporte: any, nuevoEstado: string): void {
        this.isLoading = true;
        this.reporteApiService.actualizarReporte(reporte.id_reporte, { estado: nuevoEstado }).subscribe({
            next: () => {
                this.isLoading = false;
                reporte.estado = nuevoEstado;
                this.cdr.markForCheck();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cambiar estado.';
                console.error(error);
                this.cdr.markForCheck();
            }
        });
    }

    alternarVisibilidadDonacion(reporte: any): void {
        const nuevoValor = !reporte.donacion_oculta;

        this.isLoading = true;
        this.donacionService
            .cambiarVisibilidad(String(reporte.id_donacion), nuevoValor)
            .then(() => {
                this.isLoading = false;
                reporte.donacion_oculta = nuevoValor;
                this.cdr.markForCheck();
            })
            .catch((error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cambiar la visibilidad de la donación.';
                console.error(error);
                this.cdr.markForCheck();
            });
    }

    eliminar(id: number | string): void {
        if (!confirm('¿Desea eliminar este reporte?')) return;

        this.isLoading = true;
        this.reporteApiService.eliminarReporte(id).subscribe({
            next: () => {
                this.isLoading = false;
                this.cargarReportes();
                this.cdr.markForCheck();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al eliminar el reporte.';
                console.error(error);
                this.cdr.markForCheck();
            }
        });
    }
}