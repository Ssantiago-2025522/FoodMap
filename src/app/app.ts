import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonacionFiltrosComponent } from './components/donacion-filtros/donacion-filtros.component';
import { DonacionListaComponent } from './components/donacion-lista/donacion-lista.component';
import { DonacionFormularioComponent } from './components/donacion-formulario/donacion-formulario.component';
import { DonacionMapaComponent } from './components/donacion-mapa/donacion-mapa.component';
import { GeocodingService } from './services/geocoding.service';
import { Donacion } from './models/donacion';

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
  private geocodingService = inject(GeocodingService);

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