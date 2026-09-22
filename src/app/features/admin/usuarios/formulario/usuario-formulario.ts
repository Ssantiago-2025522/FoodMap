import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioApiService } from '../../../../core/services/usuario-api.service';

@Component({
    selector: 'app-usuario-formulario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './usuario-formulario.html'
})
export class UsuarioFormulario implements OnInit {
    usuarioId: string | null = null;
    modoEdicion = false;
    isLoading = false;
    errorMessage = '';

    data: any = {
        username: '',
        correo: '',
        telefono: '',
        contrasena: '',
        id_rol: 4
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private usuarioApiService: UsuarioApiService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.usuarioId = this.route.snapshot.paramMap.get('id');
        if (this.usuarioId) {
            this.modoEdicion = true;
            this.cargarUsuario(this.usuarioId);
        }
    }

    cargarUsuario(id: string): void {
        this.isLoading = true;
        this.usuarioApiService.getUsuarioById(id).subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this.data = { ...response, contrasena: '' };
                this.cdr.markForCheck();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cargar el usuario.';
                console.error(error);
                this.cdr.markForCheck();
            }
        });
    }

    guardar(): void {
        this.isLoading = true;
        if (this.modoEdicion && this.usuarioId) {
            const payload = { ...this.data };
            if (!payload.contrasena) delete payload.contrasena;
            this.usuarioApiService.actualizarUsuario(this.usuarioId, payload).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/admin/usuarios']);
                },
                error: (error: any) => {
                    this.isLoading = false;
                    this.errorMessage = 'Error al actualizar el usuario.';
                    console.error(error);
                    this.cdr.markForCheck();
                }
            });
        } else {
            this.usuarioApiService.crearUsuario(this.data).subscribe({
                next: () => {
                    this.isLoading = false;
                    this.router.navigate(['/admin/usuarios']);
                },
                error: (error: any) => {
                    this.isLoading = false;
                    this.errorMessage = 'Error al crear el usuario.';
                    console.error(error);
                    this.cdr.markForCheck();
                }
            });
        }
    }
}