import { Injectable } from '@angular/core';

@Injectable({ 
  providedIn: 'root' 
})
export class Sesion {
  private readonly clave = 'idUsuarioPrueba';

  obtenerIdUsuarioActual(): number {
    return Number(localStorage.getItem(this.clave)) || 1;
  }
}
