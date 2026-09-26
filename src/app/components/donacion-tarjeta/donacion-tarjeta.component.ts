import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { Role } from '@core/models/role.enum';
import { Donacion, EstadoDonacion } from '../../models/donacion';

const ROLES_CON_GESTION: Role[] = [Role.DONADOR, Role.ADMIN];

@Component({
  selector: 'app-donacion-tarjeta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donacion-tarjeta.component.html',
  styleUrl: './donacion-tarjeta.component.css'
})
export class DonacionTarjetaComponent implements OnInit {

  private router = inject(Router);
  private authService = inject(AuthService);

  @Input({ required: true }) donacion!: Donacion;

  @Output() cambiarEstado = new EventEmitter<{
    id: string;
    estado: EstadoDonacion;
  }>();

  @Output() eliminar = new EventEmitter<string>();

  @Output() editar = new EventEmitter<Donacion>();

  esDonanteOAdmin: boolean = false;

  estadosDisponibles: EstadoDonacion[] = [
    'Disponible',
    'Reservada',
    'Entregada'
  ];

  ngOnInit(): void {
    this.verificarPermisos();
  }

  private verificarPermisos(): void {
    const usuario = this.authService.getUsuario();

    this.esDonanteOAdmin =
      !!usuario &&
      ROLES_CON_GESTION.includes(usuario.id_rol);
  }

  readonly imagenPlaceholder =
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg"
           width="400"
           height="300"
           viewBox="0 0 400 300">

        <rect width="400" height="300" fill="#e9e3d6"/>

        <g fill="#a89f8c">
          <circle cx="140" cy="120" r="28"/>
          <path d="M60 230 L160 140 L220 190 L260 150 L340 230 Z"/>
        </g>

        <text
          x="200"
          y="270"
          font-family="Arial, sans-serif"
          font-size="16"
          fill="#8a8171"
          text-anchor="middle">
          Sin imagen
        </text>

      </svg>
    `);

  obtenerUrlImagen(): string {

    if (!this.donacion) {
      return this.imagenPlaceholder;
    }

    const d = this.donacion as any;

    const url =
      d.imagen ||
      d.imagenUrl ||
      d.urlImagen ||
      d.imagen_url ||
      d.foto ||
      d.imageUrl;

    if (
      !url ||
      typeof url !== 'string' ||
      url.trim() === ''
    ) {
      return this.imagenPlaceholder;
    }

    return url.trim();
  }

  onImagenError(event: Event): void {

    const img = event.target as HTMLImageElement;

    if (img.src !== this.imagenPlaceholder) {
      img.src = this.imagenPlaceholder;
    }
  }

  obtenerClaseEstado(estado: string): string {
    return estado ? estado.toLowerCase() : '';
  }

  onCambiarEstado(event: Event): void {

    const selectElement =
      event.target as HTMLSelectElement;

    const nuevoEstado =
      selectElement.value as EstadoDonacion;

    this.cambiarEstado.emit({
      id: this.donacion.id,
      estado: nuevoEstado
    });
  }

  onEliminar(): void {
    this.eliminar.emit(this.donacion.id);
  }

  onEditar(): void {
    this.editar.emit(this.donacion);
  }

  abrirChat(): void {
    this.router.navigate(
      ['/chats'],
      {
        queryParams: {
          idDonacion: this.donacion.id
        }
      }
    );
  }
}