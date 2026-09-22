import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Role } from '@core/models/role.enum';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  readonly usuario = toSignal(this.userService.user$, {
    initialValue: this.userService.getUser()
  });

  get esAdmin(): boolean {
    return this.usuario()?.id_rol === Role.ADMIN;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
