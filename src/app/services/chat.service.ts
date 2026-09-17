import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Chat as ChatModel } from '../models/chat';
import { Mensaje } from '../models/mensaje';

@Injectable({ 
    providedIn: 'root' 
})
export class Chat {
  private baseUrl = 'http://localhost:3000/api/chats';

  constructor(private http: HttpClient) {}

  obtenerChats(idUsuario: number): Observable<ChatModel[]> {
    return this.http.get<ChatModel[]>(`${this.baseUrl}?usuario=${idUsuario}`);
  }

  obtenerChatConMensajes(idChat: number, idUsuario: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${idChat}?usuario=${idUsuario}`);
  }

  enviarMensaje(idChat: number, idUsuario: number, contenido: string): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.baseUrl}/${idChat}/mensajes`, {
      id_usuario: idUsuario,
      contenido
    });
  }
}