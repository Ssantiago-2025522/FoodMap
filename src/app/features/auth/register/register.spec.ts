import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Register } from './register';

describe('Register', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('es inválido mientras el formulario está vacío', () => {
    const fixture = TestBed.createComponent(Register);
    expect(fixture.componentInstance.form.valid).toBe(false);
  });
});
