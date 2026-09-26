# FoodMap

Plataforma web que conecta excedentes de alimentos con personas que los necesitan, facilitando la publicación de donaciones, solicitudes, entregas y comunicación entre usuarios.

El proyecto está dividido en un **frontend desarrollado con Angular** y una **API REST desarrollada con Node.js, Express y MySQL**.

## Tecnologías

### Frontend

* Angular 22
* TypeScript
* Angular Router
* Angular Forms
* RxJS
* Angular Signals
* Leaflet
* QRCode

### Backend

* Node.js
* Express 5
* MySQL
* mysql2
* JWT
* bcryptjs
* Nodemailer
* CORS

## Requisitos

* Node.js 22 o superior
* MySQL 8 o superior
* pnpm 10.29.2, recomendado para mantener la versión definida por el proyecto

## Instalación

Clonar el repositorio e instalar las dependencias:

```bash
pnpm install
```

También puede utilizarse:

```bash
npm install
```

Durante la instalación se ejecutan los scripts de configuración del proyecto.

### Configuración del backend

Crear el archivo:

```text
backend/.env
```

con las variables necesarias para la conexión a MySQL, autenticación y configuración del servidor.

Ejemplo:

```env
PORT=8080
CORS_ORIGIN=http://localhost:4200

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=foodmapdb_in5bm

JWT_SECRET=tu_clave_secreta
```

Las credenciales y claves reales no deben subirse al repositorio.

## Base de datos

Para inicializar la base de datos:

```bash
npm run db:init
```

Para ejecutar las migraciones:

```bash
npm run db:migrate
```

También pueden ejecutarse directamente desde `backend/`:

```bash
npm run db:init
npm run db:migrate
npm run db:seed
```

El script `db:seed` se encuentra únicamente en el `package.json` del backend.

## Ejecución

Para iniciar frontend y backend simultáneamente:

```bash
npm start
```

El proyecto quedará disponible en:

* **Frontend:** `http://localhost:4200`
* **Backend:** `http://localhost:8080`
* **API:** `http://localhost:8080/api`

Para ejecutar únicamente el frontend:

```bash
npm run start:frontend
```

Para ejecutar únicamente el backend:

```bash
npm run start:backend
```

El backend se ejecuta mediante `nodemon` durante el desarrollo.

También existe el alias:

```bash
npm run dev
```

que ejecuta `npm start`.

## Funcionalidades principales

### Autenticación

* Registro de usuarios
* Inicio de sesión
* Autenticación mediante JWT
* Protección de rutas
* Control de acceso según rol

### Donaciones

Los usuarios con permisos de donador pueden publicar y gestionar donaciones de alimentos.

### Solicitudes

Los beneficiarios pueden consultar donaciones disponibles y realizar solicitudes.

El flujo principal es:

```text
Donación
   ↓
Solicitud
   ↓
Solicitud aceptada
   ↓
Entrega creada
   ↓
Validación mediante QR
   ↓
Entrega ENTREGADA
   ↓
Calificación
```

### Entregas y códigos QR

Las entregas se generan a partir de solicitudes aceptadas.

El sistema genera un código QR asociado a la entrega y permite validarlo para completar el proceso.

### Chat

Los usuarios pueden comunicarse mediante chats relacionados con las solicitudes y entregas.

### Notificaciones

El sistema genera notificaciones para informar sobre eventos relevantes, como cambios en solicitudes y otras acciones del sistema.

### Calificaciones

Después de una entrega completada, los participantes pueden registrar una calificación y comentario.

### Administración

El sistema incluye módulos administrativos para la gestión y consulta de información según los permisos del usuario.

## Roles

FoodMap maneja los siguientes roles:

* **ADMIN:** acceso a funciones administrativas y gestión del sistema.
* **MODERADOR:** funciones de moderación.
* **DONADOR:** publicación y gestión de donaciones.
* **BENEFICIARIO:** consulta de donaciones y creación de solicitudes.

El acceso a determinadas rutas y funcionalidades depende del rol autenticado.

## Principales rutas del frontend

Entre las rutas principales se encuentran:

```text
/
 /login
 /register
 /inicio
 /profile
 /donaciones
 /solicitudes
 /solicitudes/crear
 /solicitudes/:id
 /solicitudes/historial
 /notificaciones
 /chats
 /chats/:idChat
 /entregas/generar-qr/:idSolicitud
 /entregas/validar-qr
 /calificaciones
 /admin
 /admin/reportes
 /admin/usuarios
 /acceso-denegado
```

Las rutas protegidas requieren autenticación y algunas requieren un rol específico.

## Estructura general

```text
FoodMap/
├── backend/
│   ├── scripts/
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── .env
├── database/
├── public/
│   └── img/
├── scripts/
├── src/
│   ├── app/
│   ├── assets/
│   └── ...
├── angular.json
├── package.json
└── README.md
```

Las imágenes utilizadas por el frontend se encuentran dentro de `public/img/`.

## Scripts del proyecto

### Raíz

| Comando                  | Función                          |
| ------------------------ | -------------------------------- |
| `npm start`              | Inicia frontend y backend        |
| `npm run dev`            | Alias de `npm start`             |
| `npm run start:frontend` | Inicia Angular                   |
| `npm run start:backend`  | Inicia el backend                |
| `npm run db:init`        | Inicializa la base de datos      |
| `npm run db:migrate`     | Ejecuta migraciones              |
| `npm run build`          | Genera el build de Angular       |
| `npm run watch`          | Ejecuta Angular en modo watch    |
| `npm test`               | Ejecuta las pruebas del frontend |

### Backend

Desde `backend/`:

| Comando              | Función                         |
| -------------------- | ------------------------------- |
| `npm start`          | Inicia el servidor              |
| `npm run dev`        | Inicia el servidor con Nodemon  |
| `npm run db:init`    | Inicializa la base de datos     |
| `npm run db:migrate` | Ejecuta migraciones             |
| `npm run db:seed`    | Inserta datos de prueba         |
| `npm test`           | Ejecuta las pruebas del backend |

## Seguridad

El proyecto utiliza:

* JWT para autenticación.
* bcryptjs para el manejo de contraseñas.
* Guards e interceptores en el frontend.
* Control de acceso basado en roles.
* Variables de entorno para credenciales y secretos.
* CORS para controlar el acceso desde el frontend.

Los archivos `.env` no deben incluirse en el repositorio.

## Estado del proyecto

FoodMap incluye los módulos principales de autenticación, donaciones, solicitudes, entregas, códigos QR, chat, notificaciones, calificaciones y administración.

El proyecto se encuentra preparado para su presentación y despliegue como proyecto académico.
