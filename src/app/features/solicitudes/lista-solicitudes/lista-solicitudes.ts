import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Solicitudes } from '../../../services/solicitudes.service';
import { Sesion } from '../../../services/sesion.service';

@Component({
  selector: 'app-lista-solicitudes',
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-solicitudes.html',
  styleUrl: './lista-solicitudes.css',
})
export class ListaSolicitudes implements OnInit {
  titulo_solicitud = 'Solicitudes';
  solicitudes: any[] = [];
  rol: 'donador' | 'beneficiario' = 'beneficiario';
  cargando = true;
  error = '';

  constructor(
    private solicitudesService: Solicitudes,
    private sesion: Sesion
  ) {}

  ngOnInit(): void {
    const idUsuario = this.sesion.obtenerIdUsuarioActual();
    this.solicitudesService.obtenerSolicitudes(idUsuario, this.rol).subscribe({
      next: (data: any[]) => {
        this.solicitudes = data.map(s => ({
          id_solicitud: s.id_solicitud,
          titulo: s.titulo_donacion,
          descripcion: s.descripcion_donacion,
          cantidad: s.cantidad_donacion,
          beneficiario: s.username_solicitante,
          ubicacion: `${s.municipio}, ${s.departamento}`,
          fecha: s.fecha_solicitud,
          estado: s.estado
        }));
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudieron cargar las solicitudes';
        this.cargando = false;
      }
    });
  }
}