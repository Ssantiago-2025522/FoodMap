import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonacionLista } from './donacion-lista';

describe('DonacionLista', () => {
  let component: DonacionLista;
  let fixture: ComponentFixture<DonacionLista>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonacionLista],
    }).compileComponents();

    fixture = TestBed.createComponent(DonacionLista);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
