import { TestBed } from '@angular/core/testing';
import { Donacion } from './donacion';

describe('Donacion', () => {
  let service: Donacion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Donacion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
