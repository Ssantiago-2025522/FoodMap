import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { Role } from '@core/models/role.enum';
import { TokenService } from '@core/services/token.service';
import { UserService } from '@core/services/user.service';

describe('rutas de la SPA', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()]
    });
    harness = await RouterTestingHarness.create();
  });

  function iniciarSesion(id_rol: number) {
    TestBed.inject(TokenService).setToken('token');
    TestBed.inject(UserService).setUser({
      id_usuario: 1,
      username: 'sebas',
      correo: 's@s.com',
      telefono: '12345678',
      id_rol
    });
  }

  it('la ruta raíz carga primero el login', async () => {
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement?.querySelector('form')).toBeTruthy();
  });

  it('la ruta de registro es pública', async () => {
    await harness.navigateByUrl('/register');
    expect(TestBed.inject(Router).url).toBe('/register');
    expect(harness.routeNativeElement?.querySelector('app-register form')).toBeTruthy();
  });

  it('una ruta desconocida termina en el login', async () => {
    await harness.navigateByUrl('/no-existe');
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('sin sesión, una ruta privada redirige al login', async () => {
    await harness.navigateByUrl('/donaciones');
    expect(TestBed.inject(Router).url).toContain('/login?returnUrl=%2Fdonaciones');
  });

  it('con sesión, las rutas privadas se muestran dentro del layout (navbar + footer)', async () => {
    iniciarSesion(Role.DONADOR);
    await harness.navigateByUrl('/inicio');
    const el = harness.routeNativeElement as HTMLElement;
    expect(TestBed.inject(Router).url).toBe('/inicio');
    expect(el.querySelector('app-navbar')).toBeTruthy();
    expect(el.querySelector('app-footer')).toBeTruthy();
    expect(el.querySelector('app-home')).toBeTruthy();
  });

  it('la ruta de donaciones está disponible para un donador', async () => {
    iniciarSesion(Role.DONADOR);
    await harness.navigateByUrl('/donaciones');
    const el = harness.routeNativeElement as HTMLElement;
    expect(TestBed.inject(Router).url).toBe('/donaciones');
    expect(el.querySelector('app-navbar')).toBeTruthy();
    expect(el.querySelector('app-donaciones')).toBeTruthy();
  });

  it('el navbar y el footer se mantienen al navegar entre páginas (SPA)', async () => {
    iniciarSesion(Role.DONADOR);
    await harness.navigateByUrl('/inicio');
    const navbar = (harness.routeNativeElement as HTMLElement).querySelector('app-navbar');

    await harness.navigateByUrl('/profile');
    expect((harness.routeNativeElement as HTMLElement).querySelector('app-navbar')).toBe(navbar);
  });

  it('un usuario sin rol ADMIN no entra a /admin', async () => {
    iniciarSesion(Role.DONADOR);
    await harness.navigateByUrl('/admin/reportes');
    expect(TestBed.inject(Router).url).toBe('/acceso-denegado');
  });

  it('un ADMIN entra a /admin y a /admin/reportes', async () => {
    iniciarSesion(Role.ADMIN);
    await harness.navigateByUrl('/admin');
    expect(TestBed.inject(Router).url).toBe('/admin');

    await harness.navigateByUrl('/admin/reportes');
    expect(TestBed.inject(Router).url).toBe('/admin/reportes');
  });
});
