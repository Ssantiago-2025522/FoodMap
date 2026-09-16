import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonacionFiltrosComponent } from './components/donacion-filtros/donacion-filtros';
import { DonacionListaComponent } from './components/donacion-lista/donacion-lista';
import { DonacionFormularioComponent } from './components/donacion-formulario/donacion-formulario';
import { Donacion } from './models/donacion';
import { DonacionMapaComponent } from './components/donacion-mapa/donacion-mapa';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DonacionFiltrosComponent,
    DonacionListaComponent,
    DonacionFormularioComponent,
    DonacionMapaComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
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