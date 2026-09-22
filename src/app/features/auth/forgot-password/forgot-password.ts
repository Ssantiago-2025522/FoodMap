import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { mensajeDeError } from '@core/utils/http-error';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  readonly form = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  isLoading = signal(false);
  errorMessage = signal('');
  enviado = signal(false);
  // Enlace de prueba que el backend devuelve solo en desarrollo (no hay
  // servicio de correo real conectado todavía).
  enlaceDesarrollo = signal<string | null>(null);

  enviar(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { correo } = this.form.getRawValue();

    this.authService.olvideContrasena(correo).subscribe({
      next: (respuesta) => {
        this.isLoading.set(false);
        this.enviado.set(true);
        this.enlaceDesarrollo.set(respuesta.enlaceDesarrollo ?? null);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(mensajeDeError(error, 'No se pudo procesar la solicitud.'));
      }
    });
  }

  invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
