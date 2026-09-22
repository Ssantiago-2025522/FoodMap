import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  const usuario = { id_usuario: 1, username: 'sebas', correo: 's@s.com', telefono: '12345678', id_rol: 1 };

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('persiste el usuario para sobrevivir a una recarga', () => {
    TestBed.inject(UserService).setUser(usuario);

    TestBed.resetTestingModule();
    expect(TestBed.inject(UserService).getUser()).toEqual(usuario);
  });

  it('borra el usuario al cerrar sesión', () => {
    const service = TestBed.inject(UserService);
    service.setUser(usuario);
    service.removeUser();

    TestBed.resetTestingModule();
    expect(TestBed.inject(UserService).hasUser()).toBe(false);
  });
});
