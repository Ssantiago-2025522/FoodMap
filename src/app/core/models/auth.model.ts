export interface User {
    id_usuario?: number;
    username: string;
    correo: string;
    telefono: string;
    id_rol: number;
    foto?: string | null;
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
    usuario: User;
}