import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { mensajeDeError } from '@core/utils/http-error';
import { matchPasswordValidator } from '@shared/validators/match-password.validator';
import { passwordValidator } from '@shared/validators/password.validator';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly tokenValido = !!this.token;

  readonly form = this.fb.nonNullable.group(
    {
      contrasena: ['', [Validators.required, passwordValidator()]],
      confirmarContrasena: ['', Validators.required]
    },
    { validators: matchPasswordValidator() }
  );

  isLoading = signal(false);
  errorMessage = signal('');
  exito = signal(false);

  restablecer(): void {
    this.errorMessage.set('');

    if (!this.tokenValido) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { contrasena } = this.form.getRawValue();
    this.isLoading.set(true);

    this.authService
      .restablecerContrasena({ token: this.token, contrasenaNueva: contrasena })
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          this.exito.set(true);
        },
        error: (error: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.errorMessage.set(
            mensajeDeError(error, 'No se pudo restablecer la contraseña.')
          );
        }
      });
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
