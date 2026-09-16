import { Component, inject, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonacionService } from '../../services/donacion.service';
import { GeocodingService } from '../../services/geocoding.service';
import { DonacionMapaComponent } from '../donacion-mapa/donacion-mapa.component';
import { Donacion, CategoriaDonacion, EstadoDonacion } from '../../models/donacion';

@Component({
  selector: 'app-donacion-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DonacionMapaComponent],
  templateUrl: './donacion-formulario.component.html',
  styleUrl: './donacion-formulario.component.css'
})
export class DonacionFormularioComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private donacionService = inject(DonacionService);
  private geocodingService = inject(GeocodingService);

  @Input() donacionEditar: Donacion | null = null;
  @Output() cancelado = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form!: FormGroup;
  modoEdicion = false;
  cargandoUbicacion = false;

  categorias: CategoriaDonacion[] = [
    'Frutas',
    'Verduras',
    'Lácteos',
    'Pan',
    'Comida preparada',
    'Bebidas'
  ];

  estados: EstadoDonacion[] = ['Disponible', 'Reservada', 'Entregada', 'Expirada'];

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['donacionEditar'] && this.form) {
      this.cargarDatosEdicion();
    }
  }

  private inicializarFormulario(): void {
    this.form = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(5)]],
      categoria: ['Frutas', [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      ubicacion: ['', [Validators.required]],
      fechaExpiracion: ['', [Validators.required]],
      estado: ['Disponible']
    });

    this.cargarDatosEdicion();
  }

  private cargarDatosEdicion(): void {
    if (this.donacionEditar) {
      this.modoEdicion = true;
      this.form.patchValue(this.donacionEditar);
    } else {
      this.modoEdicion = false;
      this.form?.reset({
        categoria: 'Frutas',
        cantidad: 1,
        estado: 'Disponible'
      });
    }
  }

  async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargandoUbicacion = true;
    const datosForm = this.form.value;

    // Obtiene latitud y longitud automáticamente usando la dirección exacta ingresada
    const { latitud, longitud } = await this.geocodingService.obtenerCoordenadas(datosForm.ubicacion);
    const donacionConCoords = { ...datosForm, latitud, longitud };

    if (this.modoEdicion && this.donacionEditar) {
      this.donacionService.actualizarDonacion(this.donacionEditar.id, donacionConCoords);
    } else {
      this.donacionService.crearDonacion(donacionConCoords);
    }

    this.cargandoUbicacion = false;
    this.guardado.emit();
  }

  cancelar(): void {
    this.cancelado.emit();
  }
}