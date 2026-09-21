import { Routes } from '@angular/router';
import { DonacionesComponent } from './paginas/donaciones/donaciones.component';

export const routes: Routes = [
  { path: 'donaciones', component: DonacionesComponent },
  { path: '', redirectTo: 'donaciones', pathMatch: 'full' }
];