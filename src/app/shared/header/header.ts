import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { Notificaciones } from '../../services/notificaciones.service';
import { AuthService } from '@core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  imports: [RouterLink, RouterLinkActive, CommonModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private notificaciones = inject(Notificaciones);
  private authService = inject(AuthService);

  noLeidas = this.notificaciones.noLeidas;

  constructor() {
    timer(0, 30_000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const idUsuario = this.authService.getUsuario()?.id_usuario;
        if (idUsuario) this.notificaciones.actualizarContador(idUsuario);
      });
  }
}
