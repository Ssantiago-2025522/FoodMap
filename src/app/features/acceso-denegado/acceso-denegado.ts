import {
    Component
} from '@angular/core';

import {
    Router
} from '@angular/router';

@Component({
    selector: 'app-acceso-denegado',
    standalone: true,
    imports: [],
    templateUrl: './acceso-denegado.html'
})
export class AccesoDenegado {

    constructor(
        private router: Router
    ) {}

    volverAlInicio(): void {
        this.router.navigate([
            '/inicio'
        ]);
    }

}