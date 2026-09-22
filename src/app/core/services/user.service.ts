import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_KEY = 'usuario';

  private userSubject = new BehaviorSubject<User | null>(this.leerUsuarioGuardado());
  user$ = this.userSubject.asObservable();

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  hasUser(): boolean {
    return !!this.userSubject.value;
  }

  removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }

  private leerUsuarioGuardado(): User | null {
    try {
      const guardado = localStorage.getItem(this.USER_KEY);
      return guardado ? (JSON.parse(guardado) as User) : null;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
}
