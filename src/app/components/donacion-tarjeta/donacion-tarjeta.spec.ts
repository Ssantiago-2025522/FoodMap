import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonacionTarjetaComponent } from './donacion-tarjeta.component';

describe('DonacionTarjeta', () => {
  let component: DonacionTarjetaComponent;
  let fixture: ComponentFixture<DonacionTarjetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonacionTarjetaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DonacionTarjetaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
