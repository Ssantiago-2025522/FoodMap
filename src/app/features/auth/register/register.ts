import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterData } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.enum';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.html'
})
export class Register {
  registerData: RegisterData = {
    username: '',
    correo: '',
    telefono: '',
    contrasena: '',
    id_rol: Role.USER,
    foto: null
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.errorMessage = '';

    if (
      !this.registerData.username ||
      !this.registerData.correo ||
      !this.registerData.telefono ||
      !this.registerData.contrasena
    ) {
      this.errorMessage = 'Todos los campos obligatorios deben completarse.';
      return;
    }

    this.isLoading = true;

    this.authService
      .register(this.registerData)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/inicio']);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error de registro:', error);
          this.errorMessage = error?.error?.message ?? 'No se pudo registrar el usuario.';
        }
      });
  }
}