import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-historial-solicitudes',
  imports: [CommonModule],
  templateUrl: './historial-solicitudes.html',
  styleUrl: './historial-solicitudes.css',
})
export class HistorialSolicitudes {

  historial = [
  {
    donacion: 'Frutas y Verduras',
    fecha: '08/09/2026',
    estado: 'ENTREGADA',
    observacion: 'Entrega realizada con éxito.'
  },
  {
    donacion: 'Pan Integral',
    fecha: '06/09/2026',
    estado: 'ENTREGADA',
    observacion: 'Entregado en punto acordado.'
  }
];

}
