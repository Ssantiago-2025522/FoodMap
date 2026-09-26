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

export interface ActualizarPerfilData {
    username?: string;
    /** string en base64 para guardar/cambiar la foto, null para quitarla, undefined para no tocarla. */
    foto?: string | null;
}

export interface CambiarContrasenaData {
    contrasenaActual: string;
    contrasenaNueva: string;
}

export interface RestablecerContrasenaData {
    token: string;
    contrasenaNueva: string;
}

export interface MensajeRespuesta {
    message: string;
    enlaceDesarrollo?: string;
}