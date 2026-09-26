import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../core/api.config';
import { ChatDetalle, ChatResumen } from '../models/chat';
import { Mensaje } from '../models/mensaje';

@Injectable({
  providedIn: 'root'
})
export class Chat {
  private baseUrl = `${API_URL}/chats`;

  constructor(private http: HttpClient) {}

  obtenerChats(idUsuario: number): Observable<ChatResumen[]> {
    const params = new HttpParams().set('usuario', idUsuario);
    return this.http.get<ChatResumen[]>(this.baseUrl, { params });
  }

  obtenerChatConMensajes(idChat: number, idUsuario: number): Observable<ChatDetalle> {
    const params = new HttpParams().set('usuario', idUsuario);
    return this.http.get<ChatDetalle>(`${this.baseUrl}/${idChat}`, { params });
  }

  enviarMensaje(idChat: number, idUsuario: number, contenido: string): Observable<Mensaje> {
    return this.http.post<Mensaje>(`${this.baseUrl}/${idChat}/mensajes`, {
      id_usuario: idUsuario,
      contenido
    });
  }
}
