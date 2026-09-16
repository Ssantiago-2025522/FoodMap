import { Component, inject, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonacionService } from '../../services/donacion.service';
import { Donacion, CategoriaDonacion, EstadoDonacion } from '../../models/donacion';

@Component({
  selector: 'app-donacion-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './donacion-formulario.html',
  styleUrl: './donacion-formulario.css'
})
export class DonacionFormularioComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private donacionService = inject(DonacionService);

  @Input() donacionEditar: Donacion | null = null;
  @Output() cancelado = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<void>();

  form!: FormGroup;
  modoEdicion = false;

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
      latitud: [14.6349, [Validators.required]],
      longitud: [-90.5069, [Validators.required]],
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
        latitud: 14.6349,
        longitud: -90.5069,
        estado: 'Disponible'
      });
    }
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datosForm = this.form.value;

    if (this.modoEdicion && this.donacionEditar) {
      this.donacionService.actualizarDonacion(this.donacionEditar.id, datosForm);
    } else {
      this.donacionService.crearDonacion(datosForm);
    }

    this.guardado.emit();
  }

  cancelar(): void {
    this.cancelado.emit();
  }
}