import { Component } from '@angular/core';

@Component({
  selector: 'app-chat',
  imports: [],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  chats = [
    {
      usuario: 'María López',
      ultimoMensaje: 'Hola'
    },
    {
      usuario: 'Juan Pérez',
      ultimoMensaje: '¿Dónde entregamos?'
    }
  ];

}
