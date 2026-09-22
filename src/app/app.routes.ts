import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { Role } from '@core/models/role.enum';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    title: 'FoodMap | Iniciar sesión',
    loadComponent: () => import('@features/auth/login/login').then((m) => m.Login)
  },
  {
    path: 'register',
    title: 'FoodMap | Crear cuenta',
    loadComponent: () => import('@features/auth/register/register').then((m) => m.Register)
  },
  {
    path: '',
    loadComponent: () => import('@layouts/main-layout/main-layout').then((m) => m.MainLayout),
    canActivateChild: [authGuard],
    children: [
      {
        path: 'inicio',
        title: 'FoodMap | Inicio',
        loadComponent: () => import('@features/home/home').then((m) => m.Home)
      },
      {
        path: 'profile',
        title: 'FoodMap | Mi perfil',
        loadComponent: () => import('@features/user/profile/profile').then((m) => m.Profile)
      },
      {
        path: 'donaciones',
        title: 'FoodMap | Donaciones',
        canActivate: [roleGuard],
        data: {
          roles: [Role.ADMIN, Role.MODERADOR, Role.DONADOR, Role.BENEFICIARIO]
        },
        loadComponent: () =>
          import('./paginas/donaciones/donaciones.component').then((m) => m.DonacionesComponent)
      },
      {
        path: 'admin',
        title: 'FoodMap | Administración',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadComponent: () => import('@features/admin/admin').then((m) => m.Admin)
      },
      {
        path: 'admin/reportes',
        title: 'FoodMap | Reportes',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadComponent: () =>
          import('@features/admin/reportes/lista/reportes-lista').then((m) => m.ReportesLista)
      },
      {
        path: 'admin/reportes/nuevo',
        title: 'FoodMap | Nuevo reporte',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadComponent: () =>
          import('@features/admin/reportes/formulario/reporte-formulario').then(
            (m) => m.ReporteFormulario
          )
      },
      {
        path: 'admin/reportes/:id',
        title: 'FoodMap | Detalle de reporte',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadComponent: () =>
          import('@features/admin/reportes/formulario/reporte-formulario').then(
            (m) => m.ReporteFormulario
          )
      },
      {
        path: 'acceso-denegado',
        title: 'FoodMap | Acceso denegado',
        loadComponent: () =>
          import('@features/acceso-denegado/acceso-denegado').then((m) => m.AccesoDenegado)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
