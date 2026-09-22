import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuarioApiService } from '../../../../core/services/usuario-api.service';
import { Role } from '../../../../core/models/role.enum';

@Component({
    selector: 'app-usuarios-lista',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './usuarios-lista.html'
})
export class UsuariosLista implements OnInit {
    usuarios: any[] = [];
    isLoading = false;
    errorMessage = '';
    busqueda = '';
    Role = Role;

    constructor(
        private usuarioApiService: UsuarioApiService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.cargarUsuarios();
    }

    get usuariosFiltrados(): any[] {
        const q = this.busqueda.trim().toLowerCase();
        if (!q) return this.usuarios;
        return this.usuarios.filter(u =>
            (u.username ?? '').toLowerCase().includes(q) ||
            (u.correo ?? '').toLowerCase().includes(q)
        );
    }

    cargarUsuarios(): void {
        this.isLoading = true;
        this.usuarioApiService.getUsuarios().subscribe({
            next: (response: any) => {
                this.isLoading = false;
                this.usuarios = Array.isArray(response) ? response : response?.usuarios ?? response?.data ?? [];
                this.cdr.markForCheck();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cargar usuarios.';
                console.error(error);
                this.cdr.markForCheck();
            }
        });
    }

    hacerAdmin(usuario: any): void {
        this.cambiarRol(usuario, Role.ADMIN);
    }

    cambiarRol(usuario: any, id_rol: number): void {
        this.isLoading = true;
        this.usuarioApiService.actualizarUsuario(usuario.id_usuario, { id_rol }).subscribe({
            next: () => {
                this.isLoading = false;
                usuario.id_rol = id_rol;
                this.cdr.markForCheck();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al cambiar el rol.';
                console.error(error);
                this.cdr.markForCheck();
            }
        });
    }

    publicacionesOcultas(usuario: any): boolean {
        return (usuario.total_publicaciones ?? 0) > 0 &&
            (usuario.publicaciones_ocultas ?? 0) >= (usuario.total_publicaciones ?? 0);
    }

    alternarPublicaciones(usuario: any): void {
        const ocultarAhora = !this.publicacionesOcultas(usuario);
        const mensaje = ocultarAhora
            ? '¿Ocultar todas las publicaciones de este usuario?'
            : '¿Volver a mostrar todas las publicaciones de este usuario?';

        if (!confirm(mensaje)) return;

        this.isLoading = true;
        this.usuarioApiService.ocultarPublicaciones(usuario.id_usuario, ocultarAhora).subscribe({
            next: () => {
                this.isLoading = false;
                usuario.publicaciones_ocultas = ocultarAhora ? usuario.total_publicaciones : 0;
                this.cdr.markForCheck();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = ocultarAhora
                    ? 'Error al ocultar las publicaciones del usuario.'
                    : 'Error al mostrar las publicaciones del usuario.';
                console.error(error);
                this.cdr.markForCheck();
            }
        });
    }

    eliminar(id: number | string): void {
        if (!confirm('¿Desea eliminar este usuario?')) return;

        this.isLoading = true;
        this.usuarioApiService.eliminarUsuario(id).subscribe({
            next: () => {
                this.isLoading = false;
                this.cargarUsuarios();
                this.cdr.markForCheck();
            },
            error: (error: any) => {
                this.isLoading = false;
                this.errorMessage = 'Error al eliminar el usuario.';
                console.error(error);
                this.cdr.markForCheck();
            }
        });
    }
}