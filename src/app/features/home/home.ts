import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { Role } from '@core/models/role.enum';
import { Solicitudes } from '../../services/solicitudes.service';
import { Notificaciones } from '../../services/notificaciones.service';
import { Sesion } from '../../services/sesion.service';
import { DonacionService } from '../../services/donacion.service';
import { HistorialItem } from '../../models/solicitud';

interface AccesoRapido {
  id: string;
  icono: 'solicitudes' | 'chat' | 'notificaciones' | 'historial' | 'perfil';
  titulo: string;
  descripcion: string;
  ruta: string;
}

interface ActividadItem {
  icono: 'aceptada' | 'rechazada' | 'entregada';
  descripcion: string;
  fecha: string;
  estado: 'pendiente' | 'aceptada' | 'rechazada' | 'entregada';
  estadoTexto: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private userService = inject(UserService);
  private solicitudesService = inject(Solicitudes);
  private notificaciones = inject(Notificaciones);
  private sesion = inject(Sesion);
  private donacionService = inject(DonacionService);

  readonly usuario = toSignal(this.userService.user$, {
    initialValue: this.userService.getUser()
  });

  readonly noLeidas = this.notificaciones.noLeidas;

  readonly esAdmin = computed(() => this.usuario()?.id_rol === Role.ADMIN);

  private historial = signal<HistorialItem[]>([]);
  cargandoActividad = signal(true);
  errorActividad = signal('');

  readonly accesos: AccesoRapido[] = [
    {
      id: 'solicitudes',
      icono: 'solicitudes',
      titulo: 'Solicitudes',
      descripcion: 'Revisa y gestiona tus solicitudes activas.',
      ruta: '/solicitudes'
    },
    {
      id: 'chat',
      icono: 'chat',
      titulo: 'Chat',
      descripcion: 'Coordina la entrega con la otra persona.',
      ruta: '/chats'
    },
    {
      id: 'notificaciones',
      icono: 'notificaciones',
      titulo: 'Notificaciones',
      descripcion: 'Mantente al día de lo que pasa en tu cuenta.',
      ruta: '/notificaciones'
    },
    {
      id: 'historial',
      icono: 'historial',
      titulo: 'Historial',
      descripcion: 'Consulta tus donaciones y entregas pasadas.',
      ruta: '/solicitudes/historial'
    },
    {
      id: 'perfil',
      icono: 'perfil',
      titulo: 'Mi perfil',
      descripcion: 'Actualiza tus datos y tu foto de cuenta.',
      ruta: '/profile'
    }
  ];

  readonly donacionesRealizadas = computed(() => {
    const idUsuario = this.usuario()?.id_usuario;
    if (!idUsuario) return 0;
    return this.donacionService.donaciones().filter((d) => d.idUsuario === idUsuario).length;
  });

  readonly solicitudesCompletadas = computed(
    () => this.historial().filter((item) => item.estado === 'ACEPTADA').length
  );

  readonly entregasRealizadas = computed(
    () => this.historial().filter((item) => item.estado_entrega === 'ENTREGADA').length
  );

  readonly actividadReciente = computed<ActividadItem[]>(() =>
    [...this.historial()]
      .sort((a, b) => {
        const fechaA = a.fecha_entrega ?? a.fecha_solicitud;
        const fechaB = b.fecha_entrega ?? b.fecha_solicitud;
        return new Date(fechaB).getTime() - new Date(fechaA).getTime();
      })
      .slice(0, 4)
      .map((item) => this.mapearActividad(item))
  );

  ngOnInit(): void {
    const idUsuario = this.sesion.obtenerIdUsuarioActual();
    this.notificaciones.actualizarContador(idUsuario);

    this.solicitudesService.obtenerHistorial().subscribe({
      next: (data) => {
        this.historial.set(data);
        this.cargandoActividad.set(false);
      },
      error: (err) => {
        console.error('No se pudo cargar la actividad reciente:', err);
        this.errorActividad.set('No se pudo cargar tu actividad reciente.');
        this.cargandoActividad.set(false);
      }
    });
  }

  private mapearActividad(item: HistorialItem): ActividadItem {
    const esDonador = item.rol === 'donador';

    if (item.estado === 'RECHAZADA') {
      return {
        icono: 'rechazada',
        estado: 'rechazada',
        estadoTexto: 'Rechazada',
        fecha: item.fecha_solicitud,
        descripcion: esDonador
          ? `Rechazaste la solicitud de ${item.contraparte} para "${item.titulo_donacion}".`
          : `Tu solicitud para "${item.titulo_donacion}" fue rechazada.`
      };
    }

    if (item.estado === 'PENDIENTE') {
      return {
        icono: 'aceptada',
        estado: 'pendiente',
        estadoTexto: 'Pendiente de respuesta',
        fecha: item.fecha_solicitud,
        descripcion: esDonador
          ? `${item.contraparte} solicitó tu donación "${item.titulo_donacion}".`
          : `Tu solicitud para "${item.titulo_donacion}" está esperando respuesta.`
      };
    }

    if (item.estado_entrega === 'ENTREGADA') {
      return {
        icono: 'entregada',
        estado: 'entregada',
        estadoTexto: 'Entregada',
        fecha: item.fecha_entrega ?? item.fecha_solicitud,
        descripcion: esDonador
          ? `Entregaste "${item.titulo_donacion}" a ${item.contraparte}.`
          : `Recibiste "${item.titulo_donacion}" de ${item.contraparte}.`
      };
    }

    return {
      icono: 'aceptada',
      estado: 'aceptada',
      estadoTexto: 'Pendiente de entrega',
      fecha: item.fecha_solicitud,
      descripcion: esDonador
        ? `Aceptaste la solicitud de ${item.contraparte} para "${item.titulo_donacion}".`
        : `${item.contraparte} aceptó tu solicitud para "${item.titulo_donacion}".`
    };
  }
}