import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { Role } from '@core/models/role.enum';

export const routes: Routes = [
  {
    path: '',
    title: 'FoodMap | La comida que sobra llega a quien la necesita',
    pathMatch: 'full',
    loadComponent: () => import('@features/landing/landing').then((m) => m.Landing)
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
    path: 'olvide-contrasena',
    title: 'FoodMap | Recuperar contraseña',
    loadComponent: () =>
      import('@features/auth/forgot-password/forgot-password').then((m) => m.ForgotPassword)
  },
  {
    path: 'restablecer-contrasena',
    title: 'FoodMap | Restablecer contraseña',
    loadComponent: () =>
      import('@features/auth/reset-password/reset-password').then((m) => m.ResetPassword)
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
        path: 'solicitudes',
        title: 'FoodMap | Solicitudes',
        loadComponent: () =>
          import('./features/solicitudes/lista-solicitudes/lista-solicitudes').then((m) => m.ListaSolicitudes)
      },
      {
        path: 'crear-solicitud',
        title: 'FoodMap | Crear Solicitud',
        loadComponent: () =>
          import('./features/solicitudes/crear-solicitud/crear-solicitud').then((m) => m.CrearSolicitud)
      },
      {
        path: 'crear-solicitud/:idDonacion',
        title: 'FoodMap | Crear Solicitud',
        loadComponent: () =>
          import('./features/solicitudes/crear-solicitud/crear-solicitud').then((m) => m.CrearSolicitud)
      },
      {
        path: 'detalle-solicitud/:id',
        title: 'FoodMap | Detalle de Solicitud',
        loadComponent: () =>
          import('./features/solicitudes/detalle-solicitud/detalle-solicitud').then((m) => m.DetalleSolicitud)
      },
      {
        path: 'notificaciones',
        title: 'FoodMap | Notificaciones',
        loadComponent: () =>
          import('./features/notificaciones/lista-notificaciones/lista-notificaciones').then((m) => m.ListaNotificaciones)
      },
      {
        path: 'historial',
        title: 'FoodMap | Historial de Solicitudes',
        loadComponent: () =>
          import('./features/historial/historial-solicitudes/historial-solicitudes').then((m) => m.HistorialSolicitudes)
      },
      {
        path: 'lista-chats',
        title: 'FoodMap | Mensajes',
        loadComponent: () =>
          import('./features/chat/lista-chats/lista-chats').then((m) => m.ListaChats)
      },
      {
        path: 'chat/:idChat',
        title: 'FoodMap | Chat',
        loadComponent: () =>
          import('./features/chat/chat/chat').then((m) => m.Chat)
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
        path: 'admin/usuarios',
        title: 'FoodMap | Usuarios',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadComponent: () =>
          import('@features/admin/usuarios/lista/usuarios-lista').then((m) => m.UsuariosLista)
      },
      {
        path: 'admin/usuarios/nuevo',
        title: 'FoodMap | Nuevo usuario',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadComponent: () =>
          import('@features/admin/usuarios/formulario/usuario-formulario').then((m) => m.UsuarioFormulario)
      },
      {
        path: 'admin/usuarios/:id',
        title: 'FoodMap | Editar usuario',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        loadComponent: () =>
          import('@features/admin/usuarios/formulario/usuario-formulario').then((m) => m.UsuarioFormulario)
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