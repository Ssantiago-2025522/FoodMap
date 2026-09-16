import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonacionFormulario } from './donacion-formulario';

describe('DonacionFormulario', () => {
  let component: DonacionFormulario;
  let fixture: ComponentFixture<DonacionFormulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonacionFormulario],
    }).compileComponents();

    fixture = TestBed.createComponent(DonacionFormulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
