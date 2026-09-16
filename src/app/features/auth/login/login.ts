import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginCredentials } from '../../../core/models/auth.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  credentials: LoginCredentials = {
    correo: '',
    contrasena: ''
  };

  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    if (!this.credentials.correo || !this.credentials.contrasena) {
      this.errorMessage = 'Debe ingresar correo y contraseña.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService
      .login(this.credentials)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/inicio']);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error de login:', error);
          this.errorMessage = error?.error?.message ?? 'No se pudo iniciar sesión.';
        }
      });
  }
}