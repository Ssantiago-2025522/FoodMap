import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lista-solicitudes',
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-solicitudes.html',
  styleUrl: './lista-solicitudes.css',
})
export class ListaSolicitudes {

  titulo_solicitud = "Solictudes";

  solicitudes = [
  {
    titulo: 'Frutas y Verduras',
    descripcion: 'Donación de frutas y verduras frescas.',
    cantidad: 5,
    beneficiario: 'María López',
    ubicacion: 'Zona 7, Guatemala',
    fecha: '08/09/2026',
    estado: 'PENDIENTE'
  },
  {
    titulo: 'Pan Integral',
    cantidad: 2,
    estado: 'ACEPTADA'  
  },
  {
    titulo: 'Leche',
    cantidad: 3,
    estado: 'RECHAZADA'
  }
  ];

}
