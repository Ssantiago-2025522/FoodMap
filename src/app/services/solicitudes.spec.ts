import { TestBed } from '@angular/core/testing';
import { Solicitudes } from './solicitudes.service';

describe('Solicitudes', () => {
  let service: Solicitudes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Solicitudes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
