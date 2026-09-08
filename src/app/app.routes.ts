import { Routes } from '@angular/router';
import { ListaSolicitudes } from './features/solicitudes/lista-solicitudes/lista-solicitudes';
import { ListaNotificaciones } from './features/notificaciones/lista-notificaciones/lista-notificaciones';
import { HistorialSolicitudes } from './features/historial/historial-solicitudes/historial-solicitudes';
import { Chat } from './features/chat/chat/chat';
import { ListaChats } from './features/chat/lista-chats/lista-chats';

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
