import { Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoginCredentials } from '@core/models/auth.model';
import { AuthService } from '@core/services/auth.service';
import { mensajeDeError } from '@core/utils/http-error';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  credentials: LoginCredentials = {
    correo: '',
    contrasena: ''
  };

  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  login(): void {
    if (!this.credentials.correo || !this.credentials.contrasena) {
      this.errorMessage.set('Debe ingresar correo y contraseña.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigateByUrl(this.destinoTrasLogin());
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error('Error de login:', error);
        this.errorMessage.set(mensajeDeError(error, 'No se pudo iniciar sesión.'));
      }
    });
  }

  private destinoTrasLogin(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    return returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')
      ? returnUrl
      : '/inicio';
  }
}
