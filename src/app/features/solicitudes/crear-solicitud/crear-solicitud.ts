import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { Solicitudes } from '../../../services/solicitudes.service';
import { DonacionDisponible } from '../../../models/solicitud';

@Component({
  selector: 'app-crear-solicitud',
  imports: [RouterLink, FormsModule, DatePipe, CommonModule],
  templateUrl: './crear-solicitud.html',
  styleUrl: './crear-solicitud.css',
})
export class CrearSolicitud implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private solicitudesService = inject(Solicitudes);

  donaciones = signal<DonacionDisponible[]>([]);
  idDonacion = signal<number | null>(null);
  cantidadSolicitada = signal<number | null>(1);
  comentario = signal('');

  cargando = signal(true);
  enviando = signal(false);
  error = signal('');

  donacionSeleccionada = computed(
    () => this.donaciones().find(d => d.id_donacion === this.idDonacion()) ?? null
  );

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('idDonacion');
    if (param) this.idDonacion.set(Number(param));

    this.solicitudesService.obtenerDonacionesDisponibles().subscribe({
      next: (data) => {
        this.donaciones.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar las donaciones disponibles.');
        this.cargando.set(false);
      }
    });
  }

  seleccionar(d: DonacionDisponible): void {
    this.idDonacion.set(d.id_donacion);
    this.error.set('');
    const cantidad = this.cantidadSolicitada();
    if (cantidad !== null && cantidad > d.cantidad) this.cantidadSolicitada.set(d.cantidad);
  }

  confirmarSolicitud(): void {
    const donacion = this.donacionSeleccionada();
    const cantidad = this.cantidadSolicitada();

    if (!donacion) {
      this.error.set('Elige la donación que quieres solicitar.');
      return;
    }
    if (cantidad === null || !Number.isInteger(cantidad) || cantidad < 1 || cantidad > donacion.cantidad) {
      this.error.set(`La cantidad debe ser un número entre 1 y ${donacion.cantidad}.`);
      return;
    }
    if (this.comentario().length > 255) {
      this.error.set('El comentario no puede pasar de 255 caracteres.');
      return;
    }

    this.enviando.set(true);
    this.error.set('');

    this.solicitudesService
      .crearSolicitud(donacion.id_donacion, cantidad, this.comentario().trim())
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.router.navigate(['/solicitudes']);
        },
        error: (err) => {
          this.error.set(err.error?.message ?? 'No se pudo crear la solicitud.');
          this.enviando.set(false);
        }
      });
  }
}
