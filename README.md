# FoodMap

Plataforma que conecta excedentes de alimentos con las personas y organizaciones que los necesitan.
Frontend en Angular 22 (standalone components, señales y carga perezosa de rutas) y backend en
Node.js + Express + MySQL dentro de la carpeta `backend/`.

## Requisitos

- Node.js 22.22.3+ (o 24.15+)
- MySQL 8+ o MariaDB 10.5+ corriendo en local

## Puesta en marcha

```bash
npm install        # instala frontend y backend, y crea backend/.env con un JWT_SECRET aleatorio
npm run db:init    # crea la base de datos foodmapdb_in5bm (solo la primera vez)
npm start          # levanta frontend y backend al mismo tiempo
```

- Frontend: http://localhost:4200 (abre en `/login`)
- Backend: http://localhost:8080/api

Si tu MySQL tiene contraseña, edita `DB_PASSWORD` en `backend/.env` antes de `npm run db:init`.
Con pnpm funciona igual: `pnpm install`, `pnpm run db:init`, `pnpm start`.

`npm run dev` es un alias de `npm start`.

## Scripts

| Script                   | Qué hace                                                                 |
| ------------------------ | ------------------------------------------------------------------------ |
| `npm start`              | Frontend + backend juntos, con salida diferenciada `FRONTEND` / `BACKEND` |
| `npm run start:frontend` | Solo Angular (`ng serve`)                                                |
| `npm run start:backend`  | Solo la API con recarga automática (nodemon)                             |
| `npm run db:init`        | Crea la base de datos. Si ya existe no toca nada                         |
| `npm run db:init -- --force` | Recrea la base desde cero (borra sus datos)                          |
| `npm run build`          | Build de producción en `dist/`                                           |
| `npm test`               | Pruebas unitarias (Vitest)                                               |

## Estructura

```
backend/                      API REST (Node.js + Express + MySQL); ver backend/README.md
database/                     Script SQL de la base de datos
scripts/setup.js              Crea backend/.env e instala las dependencias del backend
public/                       Archivos estáticos (favicon, img/ para el banner del login)
src/
├── environments/             URL del API (apiUrl)
└── app/
    ├── app.config.ts         Providers globales (router, HttpClient, interceptor)
    ├── app.routes.ts         Rutas de la SPA
    ├── core/                 Guards, interceptor, modelos y servicios de sesión
    ├── layouts/main-layout/  Shell de páginas privadas: navbar + contenido + footer
    ├── features/             auth, home, user/profile, admin, acceso-denegado
    ├── shared/               navbar, footer, loading, validators
    ├── paginas/donaciones/   Página del módulo de donaciones
    ├── components/           Componentes del módulo de donaciones
    ├── services/, models/    Servicios y modelos del módulo de donaciones
    └── ...
```

## Rutas

| Ruta                                | Acceso          | Descripción                                |
| ----------------------------------- | --------------- | ------------------------------------------ |
| `/`                                 | Público         | Redirige a `/login`                        |
| `/login`, `/register`               | Público         | Autenticación, sin navbar ni footer        |
| `/inicio`, `/profile`               | Sesión iniciada | Dentro de `MainLayout`                     |
| `/donaciones`                       | Sesión iniciada | Módulo de donaciones                       |
| `/admin`, `/admin/reportes[/nuevo\|/:id]` | Rol ADMIN | Administración                             |
| `/acceso-denegado`                  | Sesión iniciada | Se muestra cuando falta el rol necesario   |
| `**`                                | —               | Redirige a `/login`                        |

Los alias `@core/*`, `@features/*`, `@layouts/*`, `@shared/*` y `@env/*` están en `tsconfig.json`.

## Notas

- El registro público solo permite los roles BENEFICIARIO y DONADOR. Para probar la administración,
  asigna el rol a mano: `UPDATE usuario SET id_rol = 1 WHERE correo = 'tu@correo.com';`
- El banner del login usa `public/img/img1.jpg`, `img2.jpg` e `img3.jpg`; agrega esas imágenes.
- El backend solo implementa `/api/auth`. El servicio de reportes de administración apunta a
  `http://localhost:3000/api/reportes` y todavía no tiene backend.
