import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-notificaciones',
  imports: [CommonModule],
  templateUrl: './lista-notificaciones.html',
  styleUrl: './lista-notificaciones.css',
})
export class ListaNotificaciones {

  notificaciones = [
  {
    titulo: 'Nueva Solicitud',
    mensaje: 'María López ha solicitado Frutas y Verduras.',
    fecha: '08/09/2026',
    leida: false
  },
  {
    titulo: 'Solicitud Aceptada',
    mensaje: 'Tu solicitud de Pan Integral fue aceptada.',
    fecha: '07/09/2026',
    leida: true
  },
  {
    titulo: 'Solicitud Rechazada',
    mensaje: 'Tu solicitud de Leche fue rechazada.',
    fecha: '06/09/2026',
    leida: true
  }
];

}