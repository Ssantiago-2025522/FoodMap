import {
    Component,
    OnInit
} from '@angular/core';

import {
    Donacion
} from '../../../core/models/donacion.model';

@Component({
    selector: 'app-donaciones',
    standalone: true,
    templateUrl: './donaciones.html'
})
export class Donaciones implements OnInit {

    donaciones: Donacion[] = [];

    isLoading = false;

    errorMessage = '';

    ngOnInit(): void {

        this.obtenerDonaciones();
    }

    obtenerDonaciones(): void {

        this.isLoading = true;


        this.isLoading = false;
    }
}
