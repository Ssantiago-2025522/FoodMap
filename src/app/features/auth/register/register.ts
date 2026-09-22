import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RegisterData } from '@core/models/auth.model';
import { Role } from '@core/models/role.enum';
import { AuthService } from '@core/services/auth.service';
import { mensajeDeError } from '@core/utils/http-error';
import { matchPasswordValidator } from '@shared/validators/match-password.validator';
import { passwordValidator } from '@shared/validators/password.validator';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly roles = [
    { id: Role.BENEFICIARIO, nombre: 'Quiero recibir alimentos' },
    { id: Role.DONADOR, nombre: 'Quiero donar alimentos' }
  ];

  readonly form = this.fb.nonNullable.group(
    {
      username: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{8,10}$/)]],
      contrasena: ['', [Validators.required, passwordValidator()]],
      confirmarContrasena: ['', Validators.required],
      id_rol: [Role.BENEFICIARIO as number, Validators.required]
    },
    { validators: matchPasswordValidator() }
  );

  isLoading = signal(false);
  errorMessage = signal('');

  register(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { confirmarContrasena: _confirmar, ...valores } = this.form.getRawValue();
    const data: RegisterData = { ...valores, foto: null };

    this.isLoading.set(true);

    this.authService.register(data).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/inicio']);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error('Error de registro:', error);
        this.errorMessage.set(mensajeDeError(error, 'No se pudo registrar el usuario.'));
      }
    });
  }

  invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
