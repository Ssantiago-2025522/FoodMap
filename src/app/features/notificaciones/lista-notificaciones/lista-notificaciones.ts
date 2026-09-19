import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Notificaciones } from '../../../services/notificaciones.service';
import { Sesion } from '../../../services/sesion.service';
import { Notificacion } from '../../../models/notificacion';
import { CommonModule } from '@angular/common';

const RADIO_KM = 5;

@Component({
  selector: 'app-lista-notificaciones',
  imports: [DatePipe, CommonModule],
  templateUrl: './lista-notificaciones.html',
  styleUrl: './lista-notificaciones.css',
})
export class ListaNotificaciones implements OnInit {
  private notificacionesService = inject(Notificaciones);
  private idUsuario = inject(Sesion).obtenerIdUsuarioActual();

  radioKm = RADIO_KM;

  notificaciones = signal<Notificacion[]>([]);
  soloNoLeidas = signal(false);
  cargando = signal(true);
  error = signal('');
  buscandoCercanos = signal(false);
  mensajeCercanos = signal('');

  noLeidas = computed(() => this.notificaciones().filter(n => !n.leida).length);
  visibles = computed(() =>
    this.soloNoLeidas() ? this.notificaciones().filter(n => !n.leida) : this.notificaciones()
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.notificacionesService.obtenerPorUsuario(this.idUsuario).subscribe({
      next: (data) => {
        this.notificaciones.set(data);
        this.cargando.set(false);
        this.sincronizarContador();
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar las notificaciones.');
        this.cargando.set(false);
      }
    });
  }

  marcarLeida(idNotificacion: number): void {
    this.notificacionesService.marcarComoLeida(idNotificacion, this.idUsuario).subscribe({
      next: (actualizada) => {
        this.notificaciones.update(lista =>
          lista.map(n => (n.id_notificacion === idNotificacion ? actualizada : n))
        );
        this.sincronizarContador();
      },
      error: () => this.error.set('No se pudo marcar la notificación como leída.')
    });
  }

  marcarTodasLeidas(): void {
    this.notificacionesService.marcarTodasComoLeidas(this.idUsuario).subscribe({
      next: () => {
        this.notificaciones.update(lista => lista.map(n => ({ ...n, leida: true })));
        this.sincronizarContador();
      },
      error: () => this.error.set('No se pudieron marcar las notificaciones como leídas.')
    });
  }

  /** Pide la ubicación al navegador (solo cuando el usuario lo pide) y genera avisos de donaciones cercanas. */
  buscarCercanos(): void {
    if (!navigator.geolocation) {
      this.mensajeCercanos.set('Tu navegador no permite obtener la ubicación.');
      return;
    }
    this.buscandoCercanos.set(true);
    this.mensajeCercanos.set('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.notificacionesService
          .generarCercanas(this.idUsuario, pos.coords.latitude, pos.coords.longitude, this.radioKm)
          .subscribe({
            next: (r) => {
              this.buscandoCercanos.set(false);
              this.mensajeCercanos.set(
                r.generadas > 0
                  ? `Encontramos ${r.generadas} donaciones nuevas a menos de ${this.radioKm} km.`
                  : `No hay donaciones nuevas a menos de ${this.radioKm} km.`
              );
              this.cargar();
            },
            error: () => {
              this.buscandoCercanos.set(false);
              this.mensajeCercanos.set('No se pudo buscar donaciones cercanas.');
            }
          });
      },
      () => {
        this.buscandoCercanos.set(false);
        this.mensajeCercanos.set('Permite el acceso a tu ubicación para buscar donaciones cercanas.');
      }
    );
  }

  private sincronizarContador(): void {
    this.notificacionesService.noLeidas.set(this.noLeidas());
  }
}
