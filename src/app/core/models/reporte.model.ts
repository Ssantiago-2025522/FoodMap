export interface Reporte {
    id_reporte: number;
    motivo: string;
    descripcion: string;
    fecha: string;
    estado: string;
    resolucion?: string | null;
    id_usuario: number;
    id_donacion: number;
    donacion_oculta?: boolean | number;
}

export interface ReporteData {
    motivo: string;
    descripcion: string;
    id_usuario: number;
    id_donacion: number;
}

export interface ReporteEstadoData {
    estado: string;
    resolucion?: string | null;
}

export interface ReporteResponse {
    reporte: Reporte;
}

export interface ReporteResponses {
    reportes: Reporte[];
}