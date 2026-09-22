import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaNotificaciones } from './lista-notificaciones';

describe('ListaNotificaciones', () => {
  let component: ListaNotificaciones;
  let fixture: ComponentFixture<ListaNotificaciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaNotificaciones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaNotificaciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
