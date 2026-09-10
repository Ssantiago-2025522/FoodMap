import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-detalle-solicitud',
  imports: [RouterLink],
  templateUrl: './detalle-solicitud.html',
  styleUrl: './detalle-solicitud.css',
})
export class DetalleSolicitud {

  aceptarSolicitud(): void {
    console.log("Solicitud Aceptada")
  }

  rechazarSolicitud(): void {
    console.log("Solicitud rechazada")
  }
}