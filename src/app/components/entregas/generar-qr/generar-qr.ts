import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EntregaService } from '../../../services/entrega.service';
import { QrService } from '../../../services/qr.service';
import { EntregaQr } from '../../../models/entrega.model';

@Component({
  selector: 'app-generar-qr',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './generar-qr.html',
  styleUrl: './generar-qr.css'
})
export class GenerarQr implements OnInit {
  private route = inject(ActivatedRoute);
  private entregaService = inject(EntregaService);
  private qrService = inject(QrService);

  private idSolicitud = Number(this.route.snapshot.paramMap.get('idSolicitud'));

  cargando = signal(true);
  error = signal('');
  entrega = signal<EntregaQr | null>(null);
  imagenQr = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.imagenQr.set(null);

    this.entregaService.obtenerQr(this.idSolicitud).subscribe({
      next: async (entrega) => {
        this.entrega.set(entrega);
        try {
          const imagen = await this.qrService.generarImagen(entrega.token_qr);
          this.imagenQr.set(imagen);
        } catch (error) {
          console.error('Error al generar la imagen del QR:', error);
          this.error.set('El código se generó, pero no se pudo dibujar la imagen QR.');
        }
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'No se pudo obtener el código QR de esta entrega.');
        this.cargando.set(false);
      }
    });
  }
}
