import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notificaciones } from '../../../services/notificaciones.service';
import { Sesion } from '../../../services/sesion.service';
import { Notificacion } from '../../../models/notificacion';

@Component({
  selector: 'app-lista-notificaciones',
  imports: [CommonModule],
  templateUrl: './lista-notificaciones.html',
  styleUrl: './lista-notificaciones.css',
})
export class ListaNotificaciones implements OnInit {
  notificaciones: Notificacion[] = [];
  cargando = true;
  error = '';

  constructor(
    private notificacionesService: Notificaciones,
    private sesion: Sesion
  ) {}

  ngOnInit(): void {
    const idUsuario = this.sesion.obtenerIdUsuarioActual();
    this.notificacionesService.obtenerPorUsuario(idUsuario).subscribe({
      next: (data) => {
        this.notificaciones = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar las notificaciones';
        this.cargando = false;
      }
    });
  }

  marcarLeida(idNotificacion: number): void {
    const idUsuario = this.sesion.obtenerIdUsuarioActual();
    this.notificacionesService.marcarComoLeida(idNotificacion, idUsuario).subscribe({
      next: (actualizada) => {
        const i = this.notificaciones.findIndex(n => n.id_notificacion === idNotificacion);
        if (i !== -1) this.notificaciones[i] = actualizada;
      },
      error: (err) => console.error(err)
    });
  }
}