import { Routes } from '@angular/router';
import { ListaSolicitudes } from './features/solicitudes/lista-solicitudes/lista-solicitudes';
import { ListaNotificaciones } from './features/notificaciones/lista-notificaciones/lista-notificaciones';
import { HistorialSolicitudes } from './features/historial/historial-solicitudes/historial-solicitudes';
import { Chat } from './features/chat/chat/chat';
import { ListaChats } from './features/chat/lista-chats/lista-chats';
import { CrearSolicitud } from './features/solicitudes/crear-solicitud/crear-solicitud';
import { DetalleSolicitud } from './features/solicitudes/detalle-solicitud/detalle-solicitud';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'solicitudes',
        pathMatch: 'full'
    },

    {
        path: 'solicitudes',
        component: ListaSolicitudes
    },

    {
        path: 'crear-solicitud',
        component: CrearSolicitud
    },

    {
        path: 'detalle-solicitud',
        component: DetalleSolicitud
    },

    {
        path: 'notificaciones',
        component: ListaNotificaciones
    },

    {
        path: 'historial',
        component: HistorialSolicitudes
    },

    {
        path: 'chat',
        component: Chat
    },

    {
        path: 'listaChats',
        component: ListaChats
    }
];
