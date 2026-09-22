import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.html',
  styleUrl: './loading.css'
})
export class Loading {
  readonly mensaje = input('Cargando...');
}
