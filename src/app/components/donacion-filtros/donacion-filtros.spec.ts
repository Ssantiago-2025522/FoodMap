import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonacionFiltros } from './donacion-filtros';

describe('DonacionFiltros', () => {
  let component: DonacionFiltros;
  let fixture: ComponentFixture<DonacionFiltros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonacionFiltros],
    }).compileComponents();

    fixture = TestBed.createComponent(DonacionFiltros);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
