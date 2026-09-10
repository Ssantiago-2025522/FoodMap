import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  imports: [CommonModule],
  selector: 'app-lista-chats',
  styleUrl: './lista-chats.css',
  templateUrl: './lista-chats.html',
})
export class ListaChats {
  chats = [
  {
    usuario: 'María López',
    ultimoMensaje: 'Hola, ¿sigue disponible?',
    fecha: 'Hace 5 min'
  },
  {
    usuario: 'Juan Pérez',
    ultimoMensaje: '¿Dónde podemos encontrarnos?',
    fecha: 'Hace 20 min'
  },
  {
    usuario: 'Carlos López',
    ultimoMensaje: 'Gracias por la donación.',
    fecha: 'Ayer'
  }
];
}
