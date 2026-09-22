export interface Rol {
    id_rol: number;
    nombre: string;
    descripcion: string;
}

export interface RolResponses {
    roles: Rol[];
}
