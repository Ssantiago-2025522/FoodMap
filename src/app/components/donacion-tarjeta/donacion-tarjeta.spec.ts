import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonacionTarjeta } from './donacion-tarjeta';

describe('DonacionTarjeta', () => {
  let component: DonacionTarjeta;
  let fixture: ComponentFixture<DonacionTarjeta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonacionTarjeta],
    }).compileComponents();

    fixture = TestBed.createComponent(DonacionTarjeta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
