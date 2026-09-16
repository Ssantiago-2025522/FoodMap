export interface Usuario {
    id_usuario: number;
    id_rol: number;
    username: string;
    correo: string;
    telefono: string;
    foto?: string | null;
    fecha_registro: string;
}

export interface UsuarioData {
    username: string;
    correo: string;
    telefono: string;
    contrasena: string;
    id_rol: number;
    foto?: string | null;
}

export interface UsuarioResponse {
    usuario: Usuario;
}

export interface UsuarioResponses {
    usuarios: Usuario[];
}
