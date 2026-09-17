import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Sesion {
  private idUsuarioDePrueba = 1;

  obtenerIdUsuarioActual(): number {
    return this.idUsuarioDePrueba;
  }
}