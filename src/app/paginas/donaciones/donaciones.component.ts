import { Component, ViewChild, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
export class DonacionesComponent implements OnInit {
  @ViewChild(DonacionMapaComponent) mapaComponent!: DonacionMapaComponent;

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  mostrarFormulario = false;
  donacionSeleccionada: Donacion | null = null;

  ngOnInit(): void {
    // Permite enlazar directamente a /donaciones?crear=1 para abrir el formulario de creación
    if (this.route.snapshot.queryParamMap.get('crear') === '1') {
      this.abrirFormularioCrear();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });
    }
  }

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