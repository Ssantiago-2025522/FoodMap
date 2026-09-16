import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Donacion } from '../../../core/models/donacion.model';

@Component({
  selector: 'app-donaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './donaciones.html'
})
export class Donaciones {
  donacionesList: Donacion[] = [];
}