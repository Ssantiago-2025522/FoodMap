# FoodMap · Backend (FM-004: Solicitudes, Notificaciones y Chat)

Node.js + Express + MySQL (`mysql2`). Va en la carpeta `backend/` en la raíz del repositorio.

## Puesta en marcha

1. **Base de datos** (MySQL 8.0.16+):
   1. Crea la base y ejecuta `src/app/db/foodmapdb_in5bm.sql` sobre ella.
   2. Ejecuta `backend/sql/01-migracion-solicitudes.sql` (agrega `cantidad_solicitada` y `comentario`).
   3. (Opcional) `backend/sql/02-datos-de-prueba.sql` para tener usuarios y donaciones de ejemplo.
2. **Configuración**: copia `.env.example` a `.env` y pon tus datos (sobre todo `DB_PASSWORD` y `DB_NAME`).
3. **Dependencias y arranque** (Node 20+):
   ```bash
   cd backend
   npm install express cors mysql2 dotenv
   npm run dev
   ```
   Debe mostrar `Conectado a MySQL` y `API lista en http://localhost:3000`.
   Comprueba abriendo http://localhost:3000/api/salud
4. Levanta el frontend con `ng serve` (http://localhost:4200).

## Endpoints
El usuario se envía con `?usuario=ID` o `id_usuario` en el body (temporal, hasta que exista el login).
Los errores siempre responden `{ "error": "mensaje" }`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/solicitudes/donaciones-disponibles` | Donaciones que el usuario puede pedir |
| POST | `/api/solicitudes` | Crear solicitud `{ id_donacion, id_usuario, cantidad_solicitada, comentario }` |
| GET | `/api/solicitudes?rol=donador\|beneficiario` | Solicitudes recibidas / enviadas |
| GET | `/api/solicitudes/historial` | Solicitudes respondidas y sus entregas |
| GET | `/api/solicitudes/:id` | Detalle (solo participantes) |
| PATCH | `/api/solicitudes/:id/aceptar` | Solo el donador. Crea chat y entrega, notifica |
| PATCH | `/api/solicitudes/:id/rechazar` | Solo el donador. Notifica |
| PATCH | `/api/solicitudes/:id/confirmar-recepcion` | Solo el beneficiario. `{ observaciones? }` |
| GET | `/api/notificaciones[?leida=false]` | Notificaciones del usuario |
| PATCH | `/api/notificaciones/:id/leida` | Marcar una como leída |
| PATCH | `/api/notificaciones/leidas` | Marcar todas como leídas |
| POST | `/api/notificaciones/cercanos` | `{ id_usuario, latitud, longitud, radio_km }` |
| GET | `/api/chats` | Chats del usuario |
| GET | `/api/chats/:id` | `{ chat, mensajes }` (solo participantes) |
| POST | `/api/chats/:id/mensajes` | `{ id_usuario, contenido }` |

## Reglas de negocio
- No se puede solicitar la propia donación ni la misma donación dos veces (409).
- Cantidad pedida ≤ disponible. Disponible = `donacion.cantidad` − suma de solicitudes ACEPTADAS.
  Al aceptar la última unidad, la donación pasa a `estado = FALSE`.
- Aceptar: solicitud `ACEPTADA` + fila en `chat` + fila en `entrega` (`PENDIENTE`) + notificación al beneficiario.
- Confirmar recepción: `entrega.estado = 'ENTREGADA'` con fecha/hora actuales + notificación al donador.
- Cada acción crea su notificación dentro de la misma transacción (si algo falla, no queda a medias).
- El correo y teléfono del solicitante solo los recibe el donador.
- Cercanía: fórmula de Haversine con `ubicacion.latitud/longitud`; radio máximo 50 km; no repite avisos.

## Estructura (para que otros módulos sigan el mismo patrón)
```
src/
  server.js               # registra las rutas de cada módulo (una línea por módulo)
  config/db.js            # pool MySQL y conTransaccion()
  middlewares/            # usuario.js (identifica al usuario), errores.js
  routes/  controllers/   # un par de archivos por módulo
  helpers/notificar.js    # crear notificaciones
  utils/                  # HttpError, validaciones, fragmentos SQL
```
Cuando exista el login, solo se cambia `middlewares/usuario.js` para leer el token.

## Si algo falla
- `Unknown column 'cantidad_solicitada'` → falta ejecutar `01-migracion-solicitudes.sql`.
- `No se pudo conectar a MySQL` → revisa `.env` (usuario, contraseña, nombre de la base).
- El navegador dice error de CORS → `FRONTEND_ORIGIN` debe ser la URL exacta del frontend.
