import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Solicitudes } from '../../../services/solicitudes.service';
import { Sesion } from '../../../services/sesion.service';

@Component({
  selector: 'app-crear-solicitud',
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './crear-solicitud.html',
  styleUrl: './crear-solicitud.css',
})
export class CrearSolicitud implements OnInit {
  idDonacion: number | null = null;
  idDonacionBloqueado = false;

  cantidadSolicitada: number | null = null;
  comentario = '';
  ubicacionEntrega = '';

  enviando = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudesService: Solicitudes,
    private sesion: Sesion
  ) {}

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('idDonacion');
    if (param) {
      this.idDonacion = Number(param);
      this.idDonacionBloqueado = true;
    }
  }

  confirmarSolicitud(): void {
    if (!this.idDonacion) {
      this.error = 'Debes indicar el ID de la donación';
      return;
    }

    this.enviando = true;
    this.error = '';
    const idUsuario = this.sesion.obtenerIdUsuarioActual();

    this.solicitudesService.crearSolicitud(this.idDonacion, idUsuario).subscribe({
      next: () => {
        this.enviando = false;
        this.router.navigate(['/solicitudes']);
      },
      error: (err) => {
        this.error = err.error?.error ?? 'No se pudo crear la solicitud';
        this.enviando = false;
      }
    });
  }
}