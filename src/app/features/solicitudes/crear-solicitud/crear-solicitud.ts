import { Component, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Solicitudes } from '../../../services/solicitudes.service';
import { Sesion } from '../../../services/sesion.service';

@Component({
  selector: 'app-crear-solicitud',
  imports: [RouterLink],
  templateUrl: './crear-solicitud.html',
  styleUrl: './crear-solicitud.css',
})
export class CrearSolicitud implements OnInit {
  idDonacion!: number;
  enviando = false;
  error = '';
  exito = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private solicitudesService: Solicitudes,
    private sesion: Sesion
  ) {}

  ngOnInit(): void {
    this.idDonacion = Number(this.route.snapshot.paramMap.get('idDonacion'));
  }

  confirmarSolicitud(): void {
    this.enviando = true;
    const idUsuario = this.sesion.obtenerIdUsuarioActual();

    this.solicitudesService.crearSolicitud(this.idDonacion, idUsuario).subscribe({
      next: () => {
        this.exito = true;
        this.enviando = false;
        this.router.navigate(['/lista-solicitudes']); // ajusta a tu ruta real
      },
      error: (err) => {
        this.error = err.error?.error ?? 'No se pudo crear la solicitud';
        this.enviando = false;
      }
    });
  }
}