import { Injectable } from '@angular/core';
import { toDataURL } from 'qrcode';

@Injectable({
  providedIn: 'root'
})
export class QrService {
  generarImagen(token: string): Promise<string> {
    return toDataURL(token);
  }
}
