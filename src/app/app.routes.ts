import {
    Routes
} from '@angular/router';

import {
    authGuard
} from './core/guards/auth.guard';

import {
    roleGuard
} from './core/guards/role.guard';

import {
    Role
} from './core/models/role.enum';

export const routes: Routes = [

    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login')
                .then(m => m.Login)
    },

    {
        path: 'register',
        loadComponent: () =>
            import('./features/auth/register/register')
                .then(m => m.Register)
    },

    {
        path: 'inicio',
        canActivate: [
            authGuard
        ],
        loadComponent: () =>
            import('./features/home/home')
                .then(m => m.Home)
    },

    {
        path: 'profile',
        canActivate: [
            authGuard
        ],
        loadComponent: () =>
            import('./features/user/profile/profile')
                .then(m => m.Profile)
    },

    {
        path: 'donaciones',
        canActivate: [
            authGuard,
            roleGuard
        ],
        data: {
            roles: [
                Role.ADMIN,
                Role.USER,
                Role.DONADOR,
                Role.BENEFICIARIO
            ]
        },
        loadComponent: () =>
            import('./shared/components/donaciones/donaciones')
                .then(m => m.Donaciones)
    },

    {
        path: 'admin',
        canActivate: [
            authGuard,
            roleGuard
        ],
        data: {
            roles: [
                Role.ADMIN
            ]
        },
        loadComponent: () =>
            import('./pages/admin/admin')
                .then(m => m.Admin)
    },

    {
        path: 'moderador',
        canActivate: [
            authGuard,
            roleGuard
        ],
        data: {
            roles: [
                Role.MODERADOR
            ]
        },
        loadComponent: () =>
            import('./pages/moderador/moderador')
                .then(m => m.Moderador)
    },

    {
        path: 'acceso-denegado',
        loadComponent: () =>
            import('./pages/acceso-denegado/acceso-denegado')
                .then(m => m.AccesoDenegado)
    },

    {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
    },

    {
        path: '**',
        redirectTo: 'inicio'
    }
];
