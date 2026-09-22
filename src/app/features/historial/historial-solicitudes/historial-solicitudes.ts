import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Solicitudes } from '../../../services/solicitudes.service';
import { Sesion } from '../../../services/sesion.service';
import { HistorialItem } from '../../../models/solicitud';
import { CommonModule } from '@angular/common';

type FiltroHistorial = 'TODAS' | 'ENTREGADAS' | 'PENDIENTES' | 'RECHAZADAS';

@Component({
  selector: 'app-historial-solicitudes',
  imports: [DatePipe, CommonModule],
  templateUrl: './historial-solicitudes.html',
  styleUrl: './historial-solicitudes.css',
})
export class HistorialSolicitudes implements OnInit {
  private solicitudesService = inject(Solicitudes);
  private idUsuario = inject(Sesion).obtenerIdUsuarioActual();

  filtros: { valor: FiltroHistorial; texto: string }[] = [
    { valor: 'TODAS', texto: 'Todas' },
    { valor: 'ENTREGADAS', texto: 'Entregadas' },
    { valor: 'PENDIENTES', texto: 'Pendientes de entrega' },
    { valor: 'RECHAZADAS', texto: 'Rechazadas' },
  ];

  historial = signal<HistorialItem[]>([]);
  filtro = signal<FiltroHistorial>('TODAS');
  cargando = signal(true);
  error = signal('');

  visibles = computed(() => {
    const lista = this.historial();
    switch (this.filtro()) {
      case 'ENTREGADAS': return lista.filter(i => i.estado_entrega === 'ENTREGADA');
      case 'PENDIENTES': return lista.filter(i => i.estado === 'ACEPTADA' && i.estado_entrega === 'PENDIENTE');
      case 'RECHAZADAS': return lista.filter(i => i.estado === 'RECHAZADA');
      default: return lista;
    }
  });

  ngOnInit(): void {
    this.solicitudesService.obtenerHistorial(this.idUsuario).subscribe({
      next: (data) => {
        this.historial.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error(err);
        this.error.set('No se pudo cargar el historial.');
        this.cargando.set(false);
      }
    });
  }

  etiqueta(item: HistorialItem): string {
    if (item.estado === 'RECHAZADA') return 'Rechazada';
    return item.estado_entrega === 'ENTREGADA' ? 'Entregada' : 'Pendiente de entrega';
  }
}
