import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('no llama al API si faltan credenciales', () => {
    const fixture = TestBed.createComponent(Login);
    fixture.componentInstance.login();
    expect(fixture.componentInstance.errorMessage()).toBe('Debe ingresar correo y contraseña.');
  });
});
