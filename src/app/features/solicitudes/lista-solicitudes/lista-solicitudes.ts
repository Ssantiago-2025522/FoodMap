import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Solicitudes } from '../../../services/solicitudes.service';
import { EstadoSolicitud, RolSolicitud, SolicitudDetalle } from '../../../models/solicitud';

@Component({
  selector: 'app-lista-solicitudes',
  imports: [DatePipe, RouterLink, CommonModule],
  templateUrl: './lista-solicitudes.html',
  styleUrl: './lista-solicitudes.css',
})
export class ListaSolicitudes implements OnInit {
  private solicitudesService = inject(Solicitudes);
  private peticion?: Subscription;

  titulo_solicitud = 'Solicitudes';

  rol = signal<RolSolicitud>('beneficiario');
  solicitudes = signal<SolicitudDetalle[]>([]);
  cargando = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.cargar();
  }

  cambiarRol(rol: RolSolicitud): void {
    if (rol === this.rol()) return;
    this.rol.set(rol);
    this.cargar();
  }

  cargar(): void {
    this.peticion?.unsubscribe();
    this.cargando.set(true);
    this.error.set('');

    this.peticion = this.solicitudesService
      .obtenerSolicitudes(this.rol())
      .subscribe({
        next: (data) => {
          this.solicitudes.set(data);
          this.cargando.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set('No se pudieron cargar las solicitudes.');
          this.cargando.set(false);
        },
      });
  }

  contraparte(s: SolicitudDetalle): string {
    return this.rol() === 'donador' ? s.username_solicitante : s.username_donador;
  }

  etiquetaEstado(estado: EstadoSolicitud): string {
    return estado.charAt(0) + estado.slice(1).toLowerCase();
  }
}
