export interface Usuario {
    id_usuario: number;
    username: string;
    correo: string;
    telefono: string;
    contrasena: string;
    fecha_registro: Date;
    foto: string;
    id_rol: number
}
