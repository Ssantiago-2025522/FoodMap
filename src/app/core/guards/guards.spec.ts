import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';
import { Role } from '../models/role.enum';
import { TokenService } from '../services/token.service';
import { UserService } from '../services/user.service';

function ejecutar(guard: typeof authGuard, data: Record<string, unknown> = {}, url = '/inicio') {
  return TestBed.runInInjectionContext(() =>
    guard({ data } as unknown as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
  );
}

describe('guards', () => {
  const usuario = (id_rol: number) => ({
    id_usuario: 1, username: 'x', correo: 'x@x.com', telefono: '12345678', id_rol
  });

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('authGuard redirige al login con returnUrl si no hay sesión', () => {
    const resultado = ejecutar(authGuard, {}, '/donaciones') as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/login?returnUrl=%2Fdonaciones');
  });

  it('authGuard deja pasar con sesión', () => {
    TestBed.inject(TokenService).setToken('abc');
    TestBed.inject(UserService).setUser(usuario(Role.DONADOR));
    expect(ejecutar(authGuard)).toBe(true);
  });

  it('roleGuard manda a acceso-denegado si el rol no está permitido', () => {
    TestBed.inject(UserService).setUser(usuario(Role.DONADOR));
    const resultado = ejecutar(roleGuard, { roles: [Role.ADMIN] }) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(resultado)).toBe('/acceso-denegado');
  });

  it('roleGuard permite el rol correcto', () => {
    TestBed.inject(UserService).setUser(usuario(Role.ADMIN));
    expect(ejecutar(roleGuard, { roles: [Role.ADMIN] })).toBe(true);
  });
});
