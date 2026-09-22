export type CategoriaDonacion =
  | 'Frutas'
  | 'Verduras'
  | 'Lácteos'
  | 'Pan'
  | 'Comida preparada'
  | 'Bebidas';

export type EstadoDonacion =
  | 'Disponible'
  | 'Reservada'
  | 'Entregada'
  | 'Expirada';

export interface Donacion {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaDonacion;
  cantidad: number;
  estado: EstadoDonacion;
  ubicacion: string;
  latitud: number;
  longitud: number;
  fechaCreacion: string;
  fechaExpiracion: string;
  imagenUrl?: string;
}

export interface FiltrosDonacion {
  busqueda?: string;
  pais?: string;
  categoria?: CategoriaDonacion | 'Todas';
  estado?: EstadoDonacion | 'Todos';
}