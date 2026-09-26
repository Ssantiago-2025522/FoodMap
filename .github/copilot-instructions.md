# FoodMap Copilot Instructions

## Big picture
- FoodMap has two codebases in one repo: an Angular 22 SPA at the root and a Node.js + Express + MySQL API in `backend/`.
- The frontend is built with standalone components, lazy-loaded routes, and path aliases from `tsconfig.json` (`@core`, `@features`, `@layouts`, `@shared`, `@env`).
- The backend is organized by domain (`auth`, `donaciones`, `usuarios`, `solicitudes`, `reportes`) with routes, controllers, middlewares, and SQL helpers.

## Frontend patterns
- App startup is `src/main.ts` → `src/app/app.ts` → `src/app/app.config.ts`; global HTTP interception is registered there.
- Routes live in `src/app/app.routes.ts` and load components lazily; authenticated pages sit under `MainLayout` (`src/app/layouts/main-layout/main-layout.ts`).
- Session state is split across `src/app/core/services/auth.service.ts`, `token.service.ts`, and `user.service.ts`; token and user are persisted in `localStorage`.
- `auth.interceptor.ts` adds `Authorization: Bearer <token>` automatically, `auth.guard.ts` redirects to `/login?returnUrl=...`, and `role.guard.ts` sends unauthorized users to `/acceso-denegado`.
- Prefer `@env/environment` / `src/app/core/api.config.ts` for API URLs; some older services still hardcode localhost URLs, so update both sides together when changing ports.
- Feature folders are grouped by domain (`auth/`, `solicitudes/`, `chat/`, `notificaciones/`, `admin/`, `user/`); add new pages as standalone components and lazy-load them from the router.

## Backend patterns
- `backend/src/server.js` loads `.env`, checks the database connection, and starts the API; `backend/src/app.js` sets CORS, JSON parsing, `/api/health`, and mounts the routes.
- Use `pool` and `conTransaccion()` from `backend/src/config/db.js` for SQL work; multi-step mutations should be wrapped in transactions.
- Throw `ApiError` for expected failures and let `backend/src/middlewares/errorHandler.js` return JSON errors shaped like `{ "message": "..." }`.
- Protect routes with `requiereAutenticacion` and `requiereRol` from `backend/src/middlewares/auth.middleware.js`; JWT data is attached to `req.usuario`.
- `backend/src/controllers/solicitudes.controller.js` is the best reference for business rules: it blocks self-requests, limits quantity by available stock, creates chat/entrega/notificación records in one transaction, and hides requester contact data from non-donors.
- Reuse helpers like `backend/src/helpers/notificar.js`, `backend/src/utils/sql.js`, and `backend/src/utils/validar.js` instead of duplicating SQL fragments or validation logic.
- Admin-only endpoints are guarded in `backend/src/routes/usuarioRoutes.js` and `backend/src/routes/reporteRoutes.js` with role `1` (ADMIN).

## Workflow
- From repo root, use `npm install`, `npm run db:init`, and `npm start` to bring up the full stack.
- Useful commands are `npm run start:frontend`, `npm run start:backend`, `npm run build`, and `npm test`.
- For backend-only work, use `cd backend && npm run dev`.
- The documented runtime is MySQL 8+/MariaDB 10.5+ with the frontend on `http://localhost:4200` and the API on `http://localhost:8080`; verify both before changing API clients or environment values.

## Editing guidance
- Keep changes surgical and aligned with the existing folder boundaries; do not move code across feature domains unless the change truly requires it.
- When adding a new screen or API flow, update the route, the corresponding service, and any guard/role checks together.
- If you touch authentication, session storage, or API base URLs, re-check the interceptor, guards, and the matching backend route before finishing.
