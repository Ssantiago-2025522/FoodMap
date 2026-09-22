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
| ---------------- | ---------------------------------------- |
| `PORT`           | `8080`                                   |
| `CORS_ORIGIN`    | `http://localhost:4200` (separa varios con coma) |
| `DB_HOST`        | `localhost`                              |
| `DB_PORT`        | `3306`                                   |
| `DB_USER`        | `root`                                   |
| `DB_PASSWORD`    | vacío                                    |
| `DB_NAME`        | `foodmapdb_in5bm`                        |
| `JWT_SECRET`     | generado automáticamente al instalar     |
| `JWT_EXPIRES_IN` | `1d`                                     |

## Base de datos

`npm run db:init` ejecuta `../database/foodmapdb_in5bm.sql`. Si la base ya existe no modifica nada;
`npm run db:init -- --force` la recrea desde cero. También puedes importarla a mano:

```bash
mysql -u root -p < database/foodmapdb_in5bm.sql
```

Roles: `ADMIN=1`, `MODERADOR=2`, `BENEFICIARIO=3`, `DONADOR=4`.

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
