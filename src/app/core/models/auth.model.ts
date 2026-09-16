import { Rol } from './role.model';

export interface Auth {
    id_usuario: number;
    username: string;
    correo: string;
    id_rol: number;
    rol?: Rol;
}

export interface LoginCredentials {
    correo: string;
    contrasena: string;
}

export interface RegisterData {
    username: string;
    correo: string;
    telefono: string;
    contrasena: string;
    id_rol: number;
    foto?: string | null;
}

export interface AuthResponse {
    token: string;
    refreshToken?: string;
    usuario: Auth;
}

export interface AuthState {
    usuario: Auth | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
