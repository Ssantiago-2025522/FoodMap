import { Injectable } from '@angular/core';

import {HttpClient} from '@angular/common/http';

import{Observable} from 'rxjs';

import {
    AuthResponse,
    LoginCredentials,
    RegisterData
} from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class AuthApiService {

    private readonly API_URL =
        'http://localhost:8080/api/auth';

    constructor(
        private http: HttpClient
    ) {}

    login(
        credentials: LoginCredentials
    ): Observable<AuthResponse> {

        return this.http.post<AuthResponse>(
            `${this.API_URL}/login`,
            credentials
        );
    }

    register(
        data: RegisterData
    ): Observable<AuthResponse> {

        return this.http.post<AuthResponse>(
            `${this.API_URL}/register`,
            data
        );
    }
}
