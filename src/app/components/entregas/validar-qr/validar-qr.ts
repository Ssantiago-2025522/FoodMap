import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EntregaService } from '../../../services/entrega.service';
import { Entrega } from '../../../models/entrega.model';

@Component({
  selector: 'app-validar-qr',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './validar-qr.html',
  styleUrl: './validar-qr.css'
})
export class ValidarQr implements OnInit {
  private route = inject(ActivatedRoute);
  private entregaService = inject(EntregaService);

  token = '';
  observaciones = '';

  enviando = signal(false);
  error = signal('');
  entregaValidada = signal<Entrega | null>(null);

  ngOnInit(): void {
    const tokenUrl = this.route.snapshot.queryParamMap.get('token');
    if (tokenUrl) this.token = tokenUrl;
  }

  confirmarPorQr(): void {
    this.error.set('');
    this.entregaValidada.set(null);

    if (!this.token.trim()) {
      this.error.set('Debes ingresar el código QR.');
      return;
    }

    this.enviando.set(true);
    this.entregaService.validarQr(this.token.trim(), this.observaciones.trim() || undefined).subscribe({
      next: (entrega) => {
        this.entregaValidada.set(entrega);
        this.enviando.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'No se pudo validar el código QR.');
        this.enviando.set(false);
      }
    });
  }

  limpiar(): void {
    this.token = '';
    this.observaciones = '';
    this.error.set('');
    this.entregaValidada.set(null);
  }
}
