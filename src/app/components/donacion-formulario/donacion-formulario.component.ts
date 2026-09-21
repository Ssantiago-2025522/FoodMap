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

    this.form = this.fb.group({
      titulo: [this.donacionEditar?.titulo || '', Validators.required],
      descripcion: [this.donacionEditar?.descripcion || '', Validators.required],
      categoria: [this.donacionEditar?.categoria || 'Comida preparada', Validators.required],
      cantidad: [this.donacionEditar?.cantidad || 1, [Validators.required, Validators.min(1)]],
      codigoPais: ['gt', Validators.required],
      ubicacion: [this.donacionEditar?.ubicacion || '', Validators.required],
      fechaExpiracion: [this.donacionEditar?.fechaExpiracion || '', Validators.required],
      estado: [this.donacionEditar?.estado || 'Disponible']
    });
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargandoUbicacion = true;
    const datos = this.form.value;

    try {
      const coords = await this.geocodingService.obtenerCoordenadas(
        datos.ubicacion, 
        datos.codigoPais
      );

      const payloadDonacion: any = {
        titulo: datos.titulo,
        descripcion: datos.descripcion,
        categoria: datos.categoria,
        cantidad: datos.cantidad,
        ubicacion: datos.ubicacion,
        fechaExpiracion: datos.fechaExpiracion,
        estado: datos.estado,
        latitud: coords.latitud,
        longitud: coords.longitud
      };

      if (this.modoEdicion && this.donacionEditar) {
        this.donacionService.actualizarDonacion(this.donacionEditar.id, payloadDonacion);
      } else {
        // Uso de crearDonacion en lugar de agregarDonacion
        this.donacionService.crearDonacion(payloadDonacion);
      }

      this.cerrar.emit();
    } catch (error) {
      console.error('Error al obtener coordenadas:', error);
    } finally {
      this.cargandoUbicacion = false;
    }
  }

  cancelar(): void {
    this.cerrar.emit();
  }
}