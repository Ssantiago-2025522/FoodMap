# FoodMap Backend

Backend para FoodMap. Node.js + TypeScript + MySQL.

## Requisitos

- Node.js 18+
- MySQL 8+ con la base de datos creada a partir de `foodmapdb_in5bm.sql`

## Instalación

```bash
npm install
cp .env.example .env
# edita .env con tus credenciales reales de MySQL
npm run dev
```

El servidor queda en `http://localhost:3000`. Puedes probar `GET /api/health`.

## Estado actual — Backend completo

- [x] Módulo de **solicitudes** (crear, listar, ver, aceptar, rechazar).
- [x] Módulo de **notificaciones** (listar por usuario, marcar leída).
  - Automáticas: nueva solicitud, aceptada, rechazada, entrega confirmada, alimento cercano.
- [x] Endpoint mínimo de **donaciones** (solo creación) para disparar la notificación de "alimento cercano".
- [x] Módulo de **entregas** (confirmar recepción). Se crea automáticamente en `PENDIENTE` al aceptar una solicitud.
- [x] Módulo de **historial** (solicitudes ya resueltas + su entrega).
- [x] Módulo de **chat y mensajes** (REST, sin Socket.IO por ahora).

## Endpoints de Solicitudes

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/solicitudes` | Crea una solicitud. Body: `{ id_donacion, id_usuario }` |
| GET | `/api/solicitudes?usuario=<id>&rol=donador\|beneficiario` | Lista solicitudes según el rol del usuario |
| GET | `/api/solicitudes/:id` | Detalle de una solicitud |
| PATCH | `/api/solicitudes/:id/aceptar` | Acepta (crea chat + entrega automáticamente) |
| PATCH | `/api/solicitudes/:id/rechazar` | Rechaza |
| PATCH | `/api/solicitudes/:id/confirmar-recepcion` | Confirma la entrega. Body: `{ id_usuario, observaciones? }` |

## Endpoints de Notificaciones

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/notificaciones?usuario=<id>` | Lista notificaciones de un usuario |
| PATCH | `/api/notificaciones/:id/leida?usuario=<id>` | Marca como leída (valida que sea dueño) |

## Endpoints de Donaciones

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/donaciones` | Publica una donación (crea también su ubicación) y notifica a usuarios de la misma zona. Body: `{ titulo, descripcion, cantidad?, fecha_vencimiento?, imagen, id_usuario, id_categoria, ubicacion: { departamento, municipio, direccion, latitud?, longitud?, referencia? } }` |

## Endpoints de Historial

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/historial?usuario=<id>&rol=donador\|beneficiario` | Solicitudes ya resueltas (no PENDIENTE) + su entrega, si la tuvo |

## Endpoints de Chat

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/chats?usuario=<id>` | Lista las conversaciones donde participa el usuario, con vista previa del último mensaje |
| GET | `/api/chats/:id?usuario=<id>` | Trae un chat puntual + todos sus mensajes (valida que sea participante) |
| POST | `/api/chats/:id/mensajes` | Envía un mensaje. Body: `{ id_usuario, contenido }` |



