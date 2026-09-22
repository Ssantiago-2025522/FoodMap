import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Role } from '@core/models/role.enum';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly user = this.authService.getUsuario();

  get rol(): string {
    return this.user ? (Role[this.user.id_rol] ?? 'DESCONOCIDO') : '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
