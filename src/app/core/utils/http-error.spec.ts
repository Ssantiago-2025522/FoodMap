import { HttpErrorResponse } from '@angular/common/http';
import { mensajeDeError } from './http-error';

describe('mensajeDeError', () => {
  it('explica el error de red (status 0) en lugar de "Failed to fetch"', () => {
    const error = new HttpErrorResponse({ status: 0, error: new TypeError('Failed to fetch') });
    const mensaje = mensajeDeError(error, 'defecto');
    expect(mensaje).toContain('No se pudo conectar con el servidor');
    expect(mensaje).not.toContain('Failed to fetch');
  });

  it('indica la ruta cuando el API responde 404', () => {
    const error = new HttpErrorResponse({ status: 404, url: 'http://localhost:8080/api/auth/register' });
    expect(mensajeDeError(error, 'defecto')).toContain('/api/auth/register');
  });

  it('usa el message del backend cuando existe', () => {
    const error = new HttpErrorResponse({ status: 409, error: { message: 'El correo ya existe' } });
    expect(mensajeDeError(error, 'defecto')).toBe('El correo ya existe');
  });

  it('usa el mensaje por defecto si no hay nada más', () => {
    const error = new HttpErrorResponse({ status: 500 });
    expect(mensajeDeError(error, 'defecto')).toBe('defecto');
  });
});
