import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonacionFiltrosComponent } from '../../components/donacion-filtros/donacion-filtros.component';
import { DonacionListaComponent } from '../../components/donacion-lista/donacion-lista.component';
import { DonacionFormularioComponent } from '../../components/donacion-formulario/donacion-formulario.component';
import { DonacionMapaComponent } from '../../components/donacion-mapa/donacion-mapa.component';
import { Donacion } from '../../models/donacion';

@Component({
  selector: 'app-donaciones',
  standalone: true,
  imports: [
    CommonModule,
    DonacionFiltrosComponent,
    DonacionListaComponent,
    DonacionFormularioComponent,
    DonacionMapaComponent
  ],
  templateUrl: './donaciones.component.html',
  styleUrl: './donaciones.component.css'
})
export class DonacionesComponent {
  @ViewChild(DonacionMapaComponent) mapaComponent!: DonacionMapaComponent;

  mostrarFormulario = false;
  donacionSeleccionada: Donacion | null = null;

  abrirFormularioCrear(): void {
    this.donacionSeleccionada = null;
    this.mostrarFormulario = true;
  }

  abrirFormularioEditar(donacion: Donacion): void {
    this.donacionSeleccionada = donacion;
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    this.mostrarFormulario = false;
    this.donacionSeleccionada = null;
  }
}