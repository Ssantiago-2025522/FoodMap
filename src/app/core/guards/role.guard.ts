import { inject} from '@angular/core';

import {CanActivateFn,Router} from '@angular/router';

import{AuthService} from '../services/auth.service';

import {Role} from '../models/role.enum';

export const roleGuard: CanActivateFn = (
    route
) => {

    const authService =
        inject(AuthService);

    const router =
        inject(Router);

    const usuario =
        authService.getUsuario();

    if (!usuario) {

        return router.createUrlTree([
            '/login'
        ]);
    }

    const rolesPermitidos =
        route.data['roles'] as Role[];

    if (!rolesPermitidos) {

        return true;
    }

    if (
        rolesPermitidos.includes(
            usuario.id_rol
        )
    ) {

        return true;
    }

    return router.createUrlTree([
        '/acceso-denegado'
    ]);
};
