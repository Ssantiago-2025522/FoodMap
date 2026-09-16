export interface Donacion {
    id_donacion: number;
    titulo: string;
    descripcion: string;
    cantidad: number;
    fecha_publicacion: string;
    fecha_vencimiento?: string | null;
    estado: boolean;
    imagen: string;
    id_usuario: number;
    id_ubicacion: number;
    id_categoria: number;
}

export interface DonacionResponse {
    donacion: Donacion;
}

export interface DonacionResponses {
    donaciones: Donacion[];
}
