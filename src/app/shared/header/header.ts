import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { timer } from 'rxjs';
import { Notificaciones } from '../../services/notificaciones.service';
import { Sesion } from '../../services/sesion.service';
import { CommonModule } from '@angular/common';

@Component({
  imports: [RouterLink, RouterLinkActive, CommonModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  private notificaciones = inject(Notificaciones);
  private sesion = inject(Sesion);

  noLeidas = this.notificaciones.noLeidas;

  constructor() {
    timer(0, 30_000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.notificaciones.actualizarContador(this.sesion.obtenerIdUsuarioActual()));
  }
}
