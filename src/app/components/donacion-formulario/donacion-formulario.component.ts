import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DonacionService } from '../../services/donacion.service';
import { GeocodingService } from '../../services/geocoding.service';
import { Donacion, CategoriaDonacion, EstadoDonacion } from '../../models/donacion';

@Component({
  selector: 'app-donacion-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donacion-formulario.component.html',
  styleUrl: './donacion-formulario.component.css'
})
export class DonacionFormularioComponent implements OnInit {
  private fb = inject(FormBuilder);
  private donacionService = inject(DonacionService);
  private geocodingService = inject(GeocodingService);

  @Input() donacionEditar: Donacion | null = null;
  @Output() cerrar = new EventEmitter<void>();

  form!: FormGroup;
  cargandoUbicacion = false;
  modoEdicion = false;
  errorGuardado = '';
  imagenPreview: string = '';

  categorias: CategoriaDonacion[] = [
    'Frutas', 
    'Verduras', 
    'Lácteos', 
    'Pan', 
    'Comida preparada', 
    'Bebidas'
  ];

  estados: EstadoDonacion[] = [
    'Disponible', 
    'Reservada', 
    'Entregada', 
    'Expirada'
  ];

  ngOnInit(): void {
    this.modoEdicion = !!this.donacionEditar;
    this.imagenPreview = (this.donacionEditar as any)?.imagen || this.donacionEditar?.imagenUrl || '';

    this.form = this.fb.group({
      titulo: [this.donacionEditar?.titulo || '', Validators.required],
      descripcion: [this.donacionEditar?.descripcion || '', Validators.required],
      imagenUrl: [this.imagenPreview],
      categoria: [this.donacionEditar?.categoria || 'Comida preparada', Validators.required],
      cantidad: [this.donacionEditar?.cantidad || 1, [Validators.required, Validators.min(1)]],
      codigoPais: ['gt', Validators.required],
      ubicacion: [this.donacionEditar?.ubicacion || '', Validators.required],
      fechaExpiracion: [this.donacionEditar?.fechaExpiracion || '', Validators.required],
      estado: [this.donacionEditar?.estado || 'Disponible']
    });
  }

  /** Convertir archivo local a cadena Base64 */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const archivo = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        this.imagenPreview = base64String;
        this.form.patchValue({ imagenUrl: base64String });
      };

      reader.readAsDataURL(archivo);
    }
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargandoUbicacion = true;
    this.errorGuardado = '';
    const datos = this.form.value;

    let latitud = 14.6349;
    let longitud = -90.5069;

    try {
      const coords = await this.geocodingService.obtenerCoordenadas(
        datos.ubicacion, 
        datos.codigoPais
      );
      if (coords && coords.latitud && coords.longitud) {
        latitud = coords.latitud;
        longitud = coords.longitud;
      }
    } catch (e) {
      console.warn('No se pudo geocodificar la ubicación, usando coordenadas por defecto.', e);
    }

    const payloadDonacion: any = {
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      imagenUrl: datos.imagenUrl || null,
      categoria: datos.categoria,
      cantidad: datos.cantidad,
      ubicacion: datos.ubicacion,
      fechaExpiracion: datos.fechaExpiracion,
      estado: datos.estado,
      latitud: latitud,
      longitud: longitud
    };

    try {
      if (this.modoEdicion && this.donacionEditar) {
        await this.donacionService.actualizarDonacion(this.donacionEditar.id, payloadDonacion);
      } else {
        await this.donacionService.crearDonacion(payloadDonacion);
      }

      this.cerrar.emit();
    } catch (error) {
      console.error('Error al guardar la donación:', error);
      this.errorGuardado =
        (error as any)?.error?.message ||
        'No se pudo guardar la donación. Verifica los datos e inténtalo de nuevo.';
    } finally {
      this.cargandoUbicacion = false;
    }
  }

  cancelar(): void {
    this.cerrar.emit();
  }
}