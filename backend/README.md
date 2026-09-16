# FoodMap Backend

Backend para FoodMap. Node.js + TypeScript + PostgreSQL.

## Requisitos

- Node.js 18+
- PostgreSQL 14+ con la base de datos creada a partir de `foodmapdb_in5bm.sql`

## Instalación

```bash
npm install
cp .env.example .env
# edita .env con tus credenciales reales de PostgreSQL
npm run dev
```

El servidor queda en `http://localhost:3000`. Puedes probar `GET /api/health`.

## Estado actual

- [x] Módulo de **solicitudes** (crear, listar, ver, aceptar, rechazar).
- [ ] Notificaciones
- [ ] Entregas / confirmar recepción
- [ ] Chat y mensajes
- [ ] Historial

## Endpoints de Solicitudes

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/solicitudes` | Crea una solicitud. Body: `{ id_donacion, id_usuario }` |
| GET | `/api/solicitudes?usuario=<id>&rol=donador\|beneficiario` | Lista solicitudes según el rol del usuario |
| GET | `/api/solicitudes/:id` | Detalle de una solicitud |
| PATCH | `/api/solicitudes/:id/aceptar` | Acepta (crea el chat automáticamente) |
| PATCH | `/api/solicitudes/:id/rechazar` | Rechaza |
