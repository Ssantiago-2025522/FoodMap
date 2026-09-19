import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chat as ChatService } from '../../../services/chat.service';
import { Sesion } from '../../../services/sesion.service';
import { ChatResumen } from '../../../models/chat';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-chats',
  imports: [DatePipe, RouterLink, CommonModule],
  styleUrl: './lista-chats.css',
  templateUrl: './lista-chats.html',
})
export class ListaChats implements OnInit {
  private chatService = inject(ChatService);
  private idUsuario = inject(Sesion).obtenerIdUsuarioActual();

  chats = signal<ChatResumen[]>([]);
  busqueda = signal('');
  cargando = signal(true);
  error = signal('');

  visibles = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.chats();
    return this.chats().filter(c =>
      c.username_contraparte.toLowerCase().includes(q) ||
      c.titulo_donacion.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.chatService.obtenerChats(this.idUsuario).subscribe({
      next: (data) => {
        this.chats.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudieron cargar los chats.');
        this.cargando.set(false);
      }
    });
  }
}
