import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialSolicitudes } from './historial-solicitudes';

describe('HistorialSolicitudes', () => {
  let component: HistorialSolicitudes;
  let fixture: ComponentFixture<HistorialSolicitudes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialSolicitudes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialSolicitudes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
