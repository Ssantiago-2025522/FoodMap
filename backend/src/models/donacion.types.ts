export interface Donacion {
  id_donacion: number;
  titulo: string;
  descripcion: string;
  cantidad: number;
  fecha_publicacion: Date;
  fecha_vencimiento: Date | null;
  estado: boolean;
  imagen: string;
  id_usuario: number;
  id_ubicacion: number;
  id_categoria: number;
}

export interface UbicacionDTO {
  departamento: string;
  municipio: string;
  direccion: string;
  latitud?: number;
  longitud?: number;
  referencia?: string;
}

export interface CrearDonacionDTO {
  titulo: string;
  descripcion: string;
  cantidad?: number;
  fecha_vencimiento?: string | null;
  imagen: string;
  id_usuario: number;
  id_categoria: number;
  ubicacion: UbicacionDTO;
}
