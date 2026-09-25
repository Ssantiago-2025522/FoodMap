
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
# FoodMap Backend

API REST en Node.js + Express + MySQL para el frontend Angular de FoodMap.

- `POST /api/auth/register` registra un usuario y devuelve `{ token, usuario }`
- `POST /api/auth/login` inicia sesión y devuelve `{ token, usuario }`
- `GET /api/health` comprueba que el servidor está arriba

Escucha en `http://localhost:8080`, que coincide con `apiUrl` en `src/environments/environment.ts`,
y permite CORS desde `http://localhost:4200`.

## Uso desde la raíz del proyecto

```bash
npm install        # instala también este backend y crea backend/.env
npm run db:init    # crea la base de datos
npm start          # frontend + backend
```

## Uso independiente

```bash
cd backend
npm install
cp .env.example .env
npm run db:init
npm run dev        # con nodemon
npm start          # sin recarga automática
```

## Variables de entorno (`.env`)

| Variable         | Valor por defecto                        |
| ---------------- | ----------------------------------------- |
| `PORT`           | `8080`                                   |
| `CORS_ORIGIN`    | `http://localhost:4200` (separa varios con coma) |
| `DB_HOST`        | `localhost`                              |
| `DB_PORT`        | `3306`                                   |
| `DB_USER`        | `root`                                   |
| `DB_PASSWORD`    | vacío                                    |
| `DB_NAME`        | `foodmapdb_in5bm`                        |
| `JWT_SECRET`     | generado automáticamente al instalar     |
| `JWT_EXPIRES_IN` | `1d`                                     |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | vacíos (ver "Envío de correo") |

`.env.example` solo tiene valores genéricos de ejemplo (`usuario` / `contrasena`, etc.), nunca
credenciales reales. Copia ese archivo a `.env` y coloca ahí tus propios valores; `.env` está en
`.gitignore` y nunca debe subirse al repositorio.

> ⚠️ Si credenciales reales llegaron a subirse alguna vez al repositorio (por ejemplo en un
> commit anterior de `.env.example`), tómalas como comprometidas y rótalas (cambia el usuario o
> la contraseña en la base de datos), aunque ya no aparezcan en la versión actual del archivo:
> siguen visibles en el historial de git.

## Envío de correo (recuperación de contraseña)

`POST /api/auth/olvide-contrasena` envía el enlace para restablecer la contraseña usando SMTP
(vía Nodemailer):

- **Producción** (`NODE_ENV=production`): es obligatorio configurar `SMTP_HOST`, `SMTP_USER` y
  `SMTP_PASSWORD` (Gmail, Resend, SendGrid, Amazon SES o un servidor propio). Si faltan, la
  petición falla explícitamente en vez de fallar en silencio.
- **Desarrollo**: si no configuras SMTP, no se envía un correo real; el enlace se imprime en la
  consola del servidor y se incluye en la respuesta de la API (`enlaceDesarrollo`) solo para
  poder probar el flujo localmente. Ese campo nunca aparece en producción, ni cuando ya se envió
  un correo real.

## Base de datos

`npm run db:init` ejecuta `../database/foodmapdb_in5bm.sql`. Si la base ya existe no modifica nada;
`npm run db:init -- --force` la recrea desde cero. También puedes importarla a mano:

```bash
mysql -u root -p < database/foodmapdb_in5bm.sql
```

Roles: `ADMIN=1`, `MODERADOR=2`, `BENEFICIARIO=3`, `DONADOR=4`.

### Migraciones

Los cambios de esquema posteriores al script inicial viven en `database/migrations/` (un archivo
`.sql` por cambio, numerado en orden: `0001_...`, `0002_...`, etc.). Se aplican con un runner que
registra cada migración ejecutada en una tabla `schema_migrations`, en vez de depender de correr
archivos `.sql` sueltos a mano y de recordar cuáles ya se aplicaron:

```bash
npm run db:migrate            # aplica las migraciones pendientes
npm run db:migrate -- --list  # muestra cuáles ya se aplicaron y cuáles faltan
```

Para agregar un cambio de esquema nuevo: crea `database/migrations/000N_descripcion.sql` con el
siguiente número disponible y ejecuta `npm run db:migrate`.

## Pruebas automatizadas

```bash
npm test
```

Usa el runner de pruebas integrado en Node.js (`node --test`, sin dependencias adicionales) y
cubre las utilidades puras del backend (`src/utils/`) y el helper de correo
(`src/helpers/correo.js`), incluyendo el caso de SMTP no configurado en desarrollo y el error
esperado en producción. Los archivos de prueba están en `test/*.test.js`.


## Probar

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"juan","correo":"juan@test.com","telefono":"12345678","contrasena":"Password1","id_rol":4,"foto":null}'

curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"juan@test.com","contrasena":"Password1"}'
```

## Estructura

```
scripts/init-db.js            Crea la base de datos
src/
├── app.js                    Express (CORS, rutas, errores)
├── server.js                 Carga .env, verifica la BD y levanta el servidor
├── config/db.js              Pool de conexión MySQL
├── controllers/              authController: register y login
├── routes/                   authRoutes
├── middlewares/              auth.middleware (requiereAutenticacion, requiereRol) y errorHandler
└── utils/                    jwt y ApiError
```

## Seguridad

- Las contraseñas se guardan con bcrypt.
- El registro público solo acepta los roles BENEFICIARIO y DONADOR.
- El JWT incluye `id_usuario` e `id_rol` y expira según `JWT_EXPIRES_IN`.
- `requiereAutenticacion` y `requiereRol` están listos para proteger rutas futuras.

