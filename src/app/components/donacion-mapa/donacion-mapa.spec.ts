import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DonacionMapaComponent } from './donacion-mapa.component';

describe('DonacionMapaComponent', () => {
  let component: DonacionMapaComponent;
  let fixture: ComponentFixture<DonacionMapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DonacionMapaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DonacionMapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});