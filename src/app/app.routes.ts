import { Routes } from '@angular/router';
import { CrearEntrega } from './components/entregas/crear-entrega/crear-entrega';
import { DetalleEntrega } from './components/entregas/detalle-entrega/detalle-entrega';
import { GenerarQr } from './components/entregas/generar-qr/generar-qr';
import { ValidarQr } from './components/entregas/validar-qr/validar-qr';
import { CrearCalificacion } from './components/calificaciones/crear-calificacion/crear-calificacion';
import { ListaCalificaciones } from './components/calificaciones/lista-calificaciones/lista-calificaciones';
import { PromedioCalificaciones } from './components/calificaciones/promedio-calificaciones/promedio-calificaciones';
import { HistorialReputacion } from './components/calificaciones/historial-reputacion/historial-reputacion';

export const routes: Routes = [
  { path: '', redirectTo: 'crear-entrega', pathMatch: 'full' },
  { path: 'crear-entrega', component: CrearEntrega },
  { path: 'detalle-entrega', component: DetalleEntrega },
  { path: 'generar-qr', component: GenerarQr },
  { path: 'validar-qr', component: ValidarQr },
  { path: 'crear-calificacion', component: CrearCalificacion },
  { path: 'lista-calificaciones', component: ListaCalificaciones },
  { path: 'promedio-calificaciones', component: PromedioCalificaciones },
  { path: 'historial-reputacion', component: HistorialReputacion }
];