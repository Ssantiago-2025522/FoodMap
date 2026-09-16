import {
    Component
} from '@angular/core';

import {
    Router
} from '@angular/router';

import {
    AuthService
} from '../../core/services/auth.service';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [],
    templateUrl: './admin.html'
})
export class Admin {

    isLoading = false;

    errorMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    volverseInicio(): void {
        this.router.navigate([
            '/inicio'
        ]);
    }

}