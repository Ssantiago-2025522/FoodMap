import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
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
import { AuthApiService } from './auth-api.service';
import { TokenService } from './token.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private authApiService: AuthApiService,
    private tokenService: TokenService,
    private userService: UserService
  ) {}

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.authApiService
      .login(credentials)
      .pipe(
        tap((response: AuthResponse) => {
          this.tokenService.setToken(response.token);
          this.userService.setUser(response.usuario);
        })
      );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.authApiService
      .register(data)
      .pipe(
        tap((response: AuthResponse) => {
          this.tokenService.setToken(response.token);
          this.userService.setUser(response.usuario);
        })
      );
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasToken() && this.userService.hasUser();
  }

  getUsuario(): User | null {
    return this.userService.getUser();
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  actualizarPerfil(data: ActualizarPerfilData): Observable<User> {
    return this.authApiService
      .actualizarPerfil(data)
      .pipe(tap((usuario) => this.userService.setUser(usuario)));
  }

  cambiarContrasena(data: CambiarContrasenaData): Observable<MensajeRespuesta> {
    return this.authApiService.cambiarContrasena(data);
  }

  olvideContrasena(correo: string): Observable<MensajeRespuesta> {
    return this.authApiService.olvideContrasena(correo);
  }

  restablecerContrasena(data: RestablecerContrasenaData): Observable<MensajeRespuesta> {
    return this.authApiService.restablecerContrasena(data);
  }

  logout(): void {
    this.tokenService.removeToken();
    this.userService.removeUser();
  }
}