import {
    Component
} from '@angular/core';

import {
    Router
} from '@angular/router';

import {
    Auth
} from '../../models/auth.model';

import {
    AuthService
} from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    templateUrl: './profile.html'
})
export class Profile {

    usuario: Auth | null = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {

        this.usuario =
            this.authService.getUsuario();
    }

    logout(): void {

        this.authService.logout();

        this.router.navigate([
            '/login'
        ]);
    }
}
