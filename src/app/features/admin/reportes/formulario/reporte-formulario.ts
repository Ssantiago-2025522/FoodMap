import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReporteApiService } from '../../../../core/services/reporte-api.service';

@Component({
    selector: 'app-reporte-formulario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reporte-formulario.html'
})
export class ReporteFormulario implements OnInit {
    reporteId: string | null = null;
    modoEdicion = false;
    isLoading = false;
    errorMessage = '';

    reporte: any = null;
    estado = '';
    resolucion = '';

    data: any = {
        motivo: '',
        descripcion: '',
        id_usuario: null,
        id_donacion: null
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private reporteApiService: ReporteApiService
    ) {}

    ngOnInit(): void {
        this.reporteId = this.route.snapshot.paramMap.get('id');
        if (this.reporteId) {
            this.modoEdicion = true;
            this.cargarReporte(this.reporteId);
        }
    }

    cargarReporte(id: string): void {
        this.isLoading = true;
        this.reporteApiService.getReporteById(id).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this.reporte = response;
                this.data = { ...response };
                this.estado = response?.estado ?? '';
                this.resolucion = response?.resolucion ?? '';
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cargar el reporte.';
                console.error(error);
            }
        });
    }

    guardar(): void {
        this.isLoading = true;
        if (this.modoEdicion && this.reporteId) {
            this.reporteApiService.actualizarReporte(this.reporteId, this.data).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/admin/reportes']);
                },
                error: (error: any) => {
                    this.isLoading = false;
                    this.errorMessage = 'Error al actualizar.';
                    console.error(error);
                }
            });
        } else {
            this.reporteApiService.crearReporte(this.data).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/admin/reportes']);
                },
                error: (error: any) => {
                    this.isLoading = false;
                    this.errorMessage = 'Error al crear.';
                    console.error(error);
                }
            });
        }
    }

    resolver(): void {
        if (!this.reporteId) return;
        this.isLoading = true;
        const payload = {
            estado: this.estado,
            resolucion: this.resolucion
        };
        this.reporteApiService.actualizarReporte(this.reporteId, payload).subscribe({
            next: () => {
                this.isLoading = false;
                this.router.navigate(['/admin/reportes']);
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al resolver reporte.';
                console.error(error);
            }
        });
    }
}