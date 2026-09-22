import { HttpError } from './http-error.js';

export function entero(valor, nombre) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) {
    throw new HttpError(400, `${nombre} debe ser un número entero positivo.`);
  }
  return n;
}

export function texto(valor, max, nombre = 'El texto') {
  if (valor === undefined || valor === null) return null;
  const t = String(valor).trim();
  if (t.length > max) throw new HttpError(400, `${nombre} no puede pasar de ${max} caracteres.`);
  return t === '' ? null : t;
}
