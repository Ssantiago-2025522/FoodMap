import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Solicitudes } from '../../../services/solicitudes.service';
import { AuthService } from '@core/services/auth.service';
import { SolicitudDetalle } from '../../../models/solicitud';

@Component({
  selector: 'app-detalle-solicitud',
  imports: [RouterLink, DatePipe, FormsModule, CommonModule],
  templateUrl: './detalle-solicitud.html',
  styleUrl: './detalle-solicitud.css',
})
export class DetalleSolicitud implements OnInit {
  private route = inject(ActivatedRoute);
  private solicitudesService = inject(Solicitudes);
  private authService = inject(AuthService);
  private idUsuario = this.authService.getUsuario()?.id_usuario ?? null;
  private idSolicitud = Number(this.route.snapshot.paramMap.get('id'));

  solicitud = signal<SolicitudDetalle | null>(null);
  cargando = signal(true);
  procesando = signal(false);
  confirmandoRechazo = signal(false);
  observaciones = signal('');
  error = signal('');

  esDonador = computed(() => Number(this.solicitud()?.id_donador) === Number(this.idUsuario));

  puedeResponder = computed(() => this.esDonador() && this.solicitud()?.estado === 'PENDIENTE');

  puedeConfirmar = computed(() => {
    const s = this.solicitud();
    return !!s && !this.esDonador() && s.estado === 'ACEPTADA' && s.estado_entrega === 'PENDIENTE';
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.solicitudesService.obtenerSolicitud(this.idSolicitud).subscribe({
      next: (s) => {
        this.solicitud.set(s);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'No se pudo cargar la solicitud.');
        this.cargando.set(false);
      }
    });
  }

  aceptarSolicitud(): void {
    this.ejecutar(this.solicitudesService.aceptarSolicitud(this.idSolicitud));
  }

  rechazarSolicitud(): void {
    this.confirmandoRechazo.set(false);
    this.ejecutar(this.solicitudesService.rechazarSolicitud(this.idSolicitud));
  }

  confirmarRecepcion(): void {
    const texto = this.observaciones().trim() || undefined;
    this.ejecutar(this.solicitudesService.confirmarRecepcion(this.idSolicitud, texto));
  }

  private ejecutar(peticion: Observable<unknown>): void {
    this.procesando.set(true);
    this.error.set('');
    peticion.subscribe({
      next: () => {
        this.procesando.set(false);
        this.cargar();
      },
      error: (err) => {
        this.procesando.set(false);
        this.error.set(err.error?.message ?? 'No se pudo completar la acción.');
      }
    });
  }
}