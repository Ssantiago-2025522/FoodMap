import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env/environment';

export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return porDefecto;
  }

  if (error.status === 0) {
    return (
      `No se pudo conectar con el servidor (${environment.apiUrl}). ` +
      'Verifica que el backend esté en ejecución y que permita CORS desde este origen.'
    );
  }

  if (error.status === 404) {
    return `El servidor respondió 404: la ruta ${error.url ?? ''} no existe.`;
  }

  const mensaje = error.error?.message;
  return typeof mensaje === 'string' && mensaje ? mensaje : porDefecto;
}
