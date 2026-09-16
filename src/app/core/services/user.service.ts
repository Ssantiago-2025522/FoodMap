// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private userSubject = new BehaviorSubject<User | null>(null);
    user$ = this.userSubject.asObservable();

    setUser(user: User): void {
        this.userSubject.next(user);
    }

    getUser(): User | null {
        return this.userSubject.value;
    }

    hasUser(): boolean {
        return !!this.userSubject.value;
    }

    removeUser(): void {
        this.userSubject.next(null);
    }
}