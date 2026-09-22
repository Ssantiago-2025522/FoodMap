import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonacionFiltrosComponent } from './donacion-filtros.component';

describe('DonacionFiltros', () => {
  let component: DonacionFiltrosComponent;
  let fixture: ComponentFixture<DonacionFiltrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonacionFiltrosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DonacionFiltrosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
