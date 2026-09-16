import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonacionMapa } from './donacion-mapa';

describe('DonacionMapa', () => {
  let component: DonacionMapa;
  let fixture: ComponentFixture<DonacionMapa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonacionMapa],
    }).compileComponents();

    fixture = TestBed.createComponent(DonacionMapa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
