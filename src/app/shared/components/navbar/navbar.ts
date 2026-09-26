import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Role } from '@core/models/role.enum';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { Notificaciones } from '../../../services/notificaciones.service';

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
  private notificaciones = inject(Notificaciones);

  readonly usuario = toSignal(this.userService.user$, {
    initialValue: this.userService.getUser()
  });

  readonly noLeidas = this.notificaciones.noLeidas;

  constructor() {
    timer(0, 30_000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const idUsuario = this.authService.getUsuario()?.id_usuario;
        if (idUsuario) this.notificaciones.actualizarContador(idUsuario);
      });
  }

  get esAdmin(): boolean {
    return this.usuario()?.id_rol === Role.ADMIN;
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
