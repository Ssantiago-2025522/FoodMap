import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReporteApiService } from '../../../../core/services/reporte-api.service';
import { DonacionService } from '../../../../services/donacion.service';

@Component({
    selector: 'app-reporte-formulario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reporte-formulario.html',
    styleUrl: './reporte-formulario.css'
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
        private reporteApiService: ReporteApiService,
        private donacionService: DonacionService,
        private cdr: ChangeDetectorRef
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
                this.cdr.markForCheck();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cargar el reporte.';
                console.error(error);
                this.cdr.markForCheck();
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
                    this.cdr.markForCheck();
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
                    this.cdr.markForCheck();
                }
            });
        }
    }

    alternarVisibilidadDonacion(): void {
        if (!this.reporte) return;
        const nuevoValor = !this.reporte.donacion_oculta;

        this.isLoading = true;
        this.donacionService
            .cambiarVisibilidad(String(this.reporte.id_donacion), nuevoValor)
            .then(() => {
                this.isLoading = false;
                this.reporte.donacion_oculta = nuevoValor;
                this.cdr.markForCheck();
            })
            .catch((error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cambiar la visibilidad de la donación.';
                console.error(error);
                this.cdr.markForCheck();
            });
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
                this.cdr.markForCheck();
            }
        });
    }
}