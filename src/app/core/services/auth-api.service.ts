import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  ActualizarPerfilData,
  AuthResponse,
  CambiarContrasenaData,
  LoginCredentials,
  MensajeRespuesta,
  RegisterData,
  RestablecerContrasenaData,
  User
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly API_URL = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials);
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data);
  }

  actualizarPerfil(data: ActualizarPerfilData): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/perfil`, data);
  }

  cambiarContrasena(data: CambiarContrasenaData): Observable<MensajeRespuesta> {
    return this.http.put<MensajeRespuesta>(`${this.API_URL}/contrasena`, data);
  }

  olvideContrasena(correo: string): Observable<MensajeRespuesta> {
    return this.http.post<MensajeRespuesta>(`${this.API_URL}/olvide-contrasena`, { correo });
  }

  restablecerContrasena(data: RestablecerContrasenaData): Observable<MensajeRespuesta> {
    return this.http.post<MensajeRespuesta>(`${this.API_URL}/restablecer-contrasena`, data);
  }
}
