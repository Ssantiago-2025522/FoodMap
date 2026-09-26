import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonacionListaComponent } from './donacion-lista.component';

describe('DonacionLista', () => {
  let component: DonacionListaComponent;
  let fixture: ComponentFixture<DonacionListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonacionListaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DonacionListaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
