import { Injectable } from '@angular/core';

import { Auth } from '../models/auth.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private readonly USER_KEY = 'usuario';

    private usuario: Auth | null = null;

    constructor() {
        this.restoreUser();
    }

    getUser(): Auth | null {
        return this.usuario;
    }

    setUser(usuario: Auth): void {

        this.usuario = usuario;

        localStorage.setItem(
            this.USER_KEY,
            JSON.stringify(usuario)
        );
    }

    removeUser(): void {

        this.usuario = null;

        localStorage.removeItem(
            this.USER_KEY
        );
    }

    hasUser(): boolean {
        return this.usuario !== null;
    }

    getUserId(): number | null {

        return this.usuario?.id_usuario ?? null;
    }

    getRoleId(): number | null {

        return this.usuario?.id_rol ?? null;
    }

    private restoreUser(): void {

        const usuarioGuardado =
            localStorage.getItem(this.USER_KEY);

        if (!usuarioGuardado) {
            return;
        }

        try {

            this.usuario =
                JSON.parse(usuarioGuardado);

        } catch {

            this.removeUser();
        }
    }
}
