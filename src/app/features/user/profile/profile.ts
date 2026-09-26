import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Role } from '@core/models/role.enum';
import { mensajeDeError } from '@core/utils/http-error';
import { archivoAFotoPerfil } from '@core/utils/image.util';
import { matchPasswordValidator } from '@shared/validators/match-password.validator';
import { passwordValidator } from '@shared/validators/password.validator';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  readonly user = signal(this.authService.getUsuario());

  // --- Foto de perfil (opcional) ---
  fotoVistaPrevia = signal<string | null>(this.user()?.foto ?? null);
  fotoCargando = signal(false);
  fotoError = signal('');
  fotoMensaje = signal('');

  // --- Nombre de usuario ---
  readonly formNombre = this.fb.nonNullable.group({
    username: [this.user()?.username ?? '', [Validators.required, Validators.minLength(3)]]
  });
  nombreGuardando = signal(false);
  nombreError = signal('');
  nombreMensaje = signal('');

  // --- Cambiar contraseña ---
  readonly formContrasena = this.fb.nonNullable.group(
    {
      contrasenaActual: ['', Validators.required],
      contrasena: ['', [Validators.required, passwordValidator()]],
      confirmarContrasena: ['', Validators.required]
    },
    { validators: matchPasswordValidator() }
  );
  contrasenaGuardando = signal(false);
  contrasenaError = signal('');
  contrasenaMensaje = signal('');

  get rol(): string {
    const u = this.user();
    return u ? (Role[u.id_rol] ?? 'DESCONOCIDO') : '';
  }

  get iniciales(): string {
    const nombre = this.user()?.username ?? '';
    return nombre.trim().slice(0, 2).toUpperCase();
  }

  // ----- Foto -----

  async onFotoSeleccionada(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.fotoError.set('');
    this.fotoMensaje.set('');
    this.fotoCargando.set(true);

    try {
      const foto = await archivoAFotoPerfil(archivo);
      this.fotoVistaPrevia.set(foto);
      this.guardarFoto(foto);
    } catch (error) {
      this.fotoCargando.set(false);
      this.fotoError.set(error instanceof Error ? error.message : 'No se pudo procesar la imagen.');
    } finally {
      input.value = '';
    }
  }

  quitarFoto(): void {
    this.fotoError.set('');
    this.fotoMensaje.set('');
    this.fotoCargando.set(true);
    this.guardarFoto(null);
  }

  private guardarFoto(foto: string | null): void {
    this.authService.actualizarPerfil({ foto }).subscribe({
      next: (usuario) => {
        this.fotoCargando.set(false);
        this.user.set(usuario);
        this.fotoVistaPrevia.set(usuario.foto ?? null);
        this.fotoMensaje.set(foto ? 'Foto de perfil actualizada.' : 'Foto de perfil eliminada.');
      },
      error: (error: HttpErrorResponse) => {
        this.fotoCargando.set(false);
        this.fotoVistaPrevia.set(this.user()?.foto ?? null);
        this.fotoError.set(mensajeDeError(error, 'No se pudo actualizar la foto de perfil.'));
      }
    });
  }

  // ----- Nombre de usuario -----

  guardarNombre(): void {
    this.nombreError.set('');
    this.nombreMensaje.set('');

    if (this.formNombre.invalid) {
      this.formNombre.markAllAsTouched();
      return;
    }

    const { username } = this.formNombre.getRawValue();

    if (username === this.user()?.username) {
      return;
    }

    this.nombreGuardando.set(true);

    this.authService.actualizarPerfil({ username }).subscribe({
      next: (usuario) => {
        this.nombreGuardando.set(false);
        this.user.set(usuario);
        this.nombreMensaje.set('Nombre de usuario actualizado.');
      },
      error: (error: HttpErrorResponse) => {
        this.nombreGuardando.set(false);
        this.nombreError.set(mensajeDeError(error, 'No se pudo actualizar el nombre de usuario.'));
      }
    });
  }

  nombreInvalido(campo: string): boolean {
    const control = this.formNombre.get(campo);
    return !!control && control.invalid && control.touched;
  }

  // ----- Cambiar contraseña -----

  cambiarContrasena(): void {
    this.contrasenaError.set('');
    this.contrasenaMensaje.set('');

    if (this.formContrasena.invalid) {
      this.formContrasena.markAllAsTouched();
      return;
    }

    const { contrasenaActual, contrasena } = this.formContrasena.getRawValue();
    this.contrasenaGuardando.set(true);

    this.authService
      .cambiarContrasena({ contrasenaActual, contrasenaNueva: contrasena })
      .subscribe({
        next: () => {
          this.contrasenaGuardando.set(false);
          this.contrasenaMensaje.set('Contraseña actualizada correctamente.');
          this.formContrasena.reset();
        },
        error: (error: HttpErrorResponse) => {
          this.contrasenaGuardando.set(false);
          this.contrasenaError.set(mensajeDeError(error, 'No se pudo cambiar la contraseña.'));
        }
      });
  }

  contrasenaInvalida(campo: string): boolean {
    const control = this.formContrasena.get(campo);
    return !!control && control.invalid && control.touched;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
