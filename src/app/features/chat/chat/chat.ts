import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, switchMap, timer } from 'rxjs';
import { Chat as ChatService } from '../../../services/chat.service';
import { AuthService } from '@core/services/auth.service';
import { ChatDetalle } from '../../../models/chat';
import { Mensaje } from '../../../models/mensaje';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, DatePipe, RouterLink, CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
  private route = inject(ActivatedRoute);
  private chatService = inject(ChatService);
  private idChat = Number(this.route.snapshot.paramMap.get('idChat'));
  private contenedor = viewChild<ElementRef<HTMLElement>>('contenedor');
  private totalMensajes = 0;

  readonly idUsuario = inject(AuthService).getUsuario()?.id_usuario ?? 0;

  detalle = signal<ChatDetalle | null>(null);
  texto = signal('');
  cargando = signal(true);
  enviando = signal(false);
  error = signal('');

  constructor() {
    timer(0, 5_000)
      .pipe(
        switchMap(() =>
          this.chatService.obtenerChatConMensajes(this.idChat, this.idUsuario).pipe(
            catchError((err) => {
              this.cargando.set(false);
              this.error.set(err.error?.error ?? 'No se pudo cargar el chat.');
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe((d) => {
        this.error.set('');
        this.detalle.set(d);
        this.cargando.set(false);
        this.bajarSiHayNuevos();
      });
  }

  esMio(m: Mensaje): boolean {
    return m.id_usuario === this.idUsuario;
  }

  enviar(): void {
    const contenido = this.texto().trim();
    if (!contenido || this.enviando() || !this.detalle()) return;

    this.enviando.set(true);
    this.chatService.enviarMensaje(this.idChat, this.idUsuario, contenido).subscribe({
      next: (m) => {
        this.detalle.update(d => (d ? { ...d, mensajes: [...d.mensajes, m] } : d));
        this.texto.set('');
        this.enviando.set(false);
        this.bajarSiHayNuevos();
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(err.error?.error ?? 'No se pudo enviar el mensaje.');
      }
    });
  }

  private bajarSiHayNuevos(): void {
    const total = this.detalle()?.mensajes.length ?? 0;
    if (total === this.totalMensajes) return;
    this.totalMensajes = total;
    setTimeout(() => {
      const el = this.contenedor()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
