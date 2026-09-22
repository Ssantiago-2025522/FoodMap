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
        path: 'solicitudes',
        title: 'FoodMap | Solicitudes',
        loadComponent: () =>
          import('@features/solicitudes/lista-solicitudes/lista-solicitudes').then((m) => m.ListaSolicitudes)
      },
      {
        path: 'solicitudes/crear',
        title: 'FoodMap | Crear Solicitud',
        loadComponent: () =>
          import('@features/solicitudes/crear-solicitud/crear-solicitud').then((m) => m.CrearSolicitud)
      },
      {
        path: 'solicitudes/crear/:idDonacion',
        title: 'FoodMap | Crear Solicitud',
        loadComponent: () =>
          import('@features/solicitudes/crear-solicitud/crear-solicitud').then((m) => m.CrearSolicitud)
      },
      {
        path: 'solicitudes/historial',
        title: 'FoodMap | Historial de Solicitudes',
        loadComponent: () =>
          import('@features/historial/historial-solicitudes/historial-solicitudes').then((m) => m.HistorialSolicitudes)
      },
      {
        path: 'solicitudes/:id',
        title: 'FoodMap | Detalle de Solicitud',
        loadComponent: () =>
          import('@features/solicitudes/detalle-solicitud/detalle-solicitud').then((m) => m.DetalleSolicitud)
      },
      {
        path: 'notificaciones',
        title: 'FoodMap | Notificaciones',
        loadComponent: () =>
          import('@features/notificaciones/lista-notificaciones/lista-notificaciones').then((m) => m.ListaNotificaciones)
      },
      {
        path: 'chats',
        title: 'FoodMap | Mensajes',
        loadComponent: () =>
          import('@features/chat/lista-chats/lista-chats').then((m) => m.ListaChats)
      },
      {
        path: 'chats/:idChat',
        title: 'FoodMap | Chat',
        loadComponent: () =>
          import('@features/chat/chat/chat').then((m) => m.Chat)
      },
      {
        path: 'entregas/crear',
        title: 'FoodMap | Crear entrega',
        loadComponent: () =>
          import('@components/entregas/crear-entrega/crear-entrega').then((m) => m.CrearEntrega)
      },
      {
        path: 'entregas/detalle',
        title: 'FoodMap | Detalle de entrega',
        loadComponent: () =>
          import('@components/entregas/detalle-entrega/detalle-entrega').then((m) => m.DetalleEntrega)
      },
      {
        path: 'entregas/generar-qr',
        title: 'FoodMap | Generar QR',
        loadComponent: () =>
          import('@components/entregas/generar-qr/generar-qr').then((m) => m.GenerarQr)
      },
      {
        path: 'entregas/validar-qr',
        title: 'FoodMap | Validar QR',
        loadComponent: () =>
          import('@components/entregas/validar-qr/validar-qr').then((m) => m.ValidarQr)
      },
      {
        path: 'calificaciones',
        title: 'FoodMap | Lista de calificaciones',
        loadComponent: () =>
          import('@components/calificaciones/lista-calificaciones/lista-calificaciones').then((m) => m.ListaCalificaciones)
      },
      {
        path: 'calificaciones/crear',
        title: 'FoodMap | Crear calificación',
        loadComponent: () =>
          import('@components/calificaciones/crear-calificacion/crear-calificacion').then((m) => m.CrearCalificacion)
      },
      {
        path: 'calificaciones/promedio',
        title: 'FoodMap | Promedio de calificaciones',
        loadComponent: () =>
          import('@components/calificaciones/promedio-calificaciones/promedio-calificaciones').then((m) => m.PromedioCalificaciones)
      },
      {
        path: 'calificaciones/historial',
        title: 'FoodMap | Historial de reputación',
        loadComponent: () =>
          import('@components/calificaciones/historial-reputacion/historial-reputacion').then((m) => m.HistorialReputacion)
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
        children: [
          {
            path: '',
            title: 'FoodMap | Administración',
            loadComponent: () => import('@features/admin/admin').then((m) => m.Admin)
          },
          {
            path: 'reportes',
            title: 'FoodMap | Reportes',
            loadComponent: () =>
              import('@features/admin/reportes/lista/reportes-lista').then((m) => m.ReportesLista)
          },
          {
            path: 'reportes/nuevo',
            title: 'FoodMap | Nuevo reporte',
            loadComponent: () =>
              import('@features/admin/reportes/formulario/reporte-formulario').then((m) => m.ReporteFormulario)
          },
          {
            path: 'reportes/:id',
            title: 'FoodMap | Detalle de reporte',
            loadComponent: () =>
              import('@features/admin/reportes/formulario/reporte-formulario').then((m) => m.ReporteFormulario)
          },
          {
            path: 'usuarios',
            title: 'FoodMap | Usuarios',
            loadComponent: () =>
              import('@features/admin/usuarios/lista/usuarios-lista').then((m) => m.UsuariosLista)
          },
          {
            path: 'usuarios/nuevo',
            title: 'FoodMap | Nuevo usuario',
            loadComponent: () =>
              import('@features/admin/usuarios/formulario/usuario-formulario').then((m) => m.UsuarioFormulario)
          },
          {
            path: 'usuarios/:id',
            title: 'FoodMap | Editar usuario',
            loadComponent: () =>
              import('@features/admin/usuarios/formulario/usuario-formulario').then((m) => m.UsuarioFormulario)
          }
        ]
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