# FoodMap Backend

API REST de **FoodMap**, desarrollada con Node.js, Express y MySQL.

El backend proporciona autenticación, gestión de donaciones y solicitudes, entregas, códigos QR, notificaciones, chat y calificaciones.

## Tecnologías

* Node.js
* Express 5
* MySQL
* mysql2
* JWT
* bcryptjs
* Nodemailer
* CORS
* dotenv

## Requisitos

* Node.js 22 o superior
* MySQL 8 o superior

## Instalación

Desde la carpeta `backend/`:

```bash
npm install
```

## Variables de entorno

Crear:

```text
backend/.env
```

Configuración básica:

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

Las credenciales reales y el valor de `JWT_SECRET` no deben subirse al repositorio.

Si se utiliza el sistema de correo del proyecto, también deben configurarse las variables SMTP correspondientes.

## Base de datos

Inicializar la base de datos:

```bash
npm run db:init
```

Ejecutar migraciones:

```bash
npm run db:migrate
```

Insertar datos de prueba:

```bash
npm run db:seed
```

## Ejecución

Para producción:

```bash
npm start
```

Para desarrollo:

```bash
npm run dev
```

El servidor utiliza Nodemon durante el desarrollo.

Por defecto, la API se encuentra en:

```text
http://localhost:8080
```

Y sus endpoints principales utilizan:

```text
http://localhost:8080/api
```

## Autenticación

FoodMap utiliza **JSON Web Tokens (JWT)** para autenticar las solicitudes protegidas.

Después de iniciar sesión, el cliente utiliza el token obtenido para acceder a los recursos que requieren autenticación.

Las rutas protegidas identifican al usuario a partir de su token, por lo que no es necesario enviar manualmente un identificador de usuario mediante parámetros como `?usuario=ID`.

## Módulos principales

### Autenticación

```text
POST /api/auth/register
POST /api/auth/login
```

Permite registrar usuarios e iniciar sesión.

### Solicitudes

El módulo de solicitudes permite:

* Listar solicitudes.
* Consultar una solicitud específica.
* Crear solicitudes.
* Aceptar solicitudes.
* Rechazar solicitudes.
* Confirmar la recepción.
* Consultar el código QR.
* Validar códigos QR.

Las solicitudes se relacionan con las donaciones y con los usuarios participantes.

### Donaciones

Permite gestionar las donaciones disponibles dentro de la plataforma.

### Entregas

Una entrega se genera como parte del flujo de una solicitud aceptada.

El proceso principal es:

```text
Solicitud aceptada
       ↓
Creación de entrega
       ↓
Generación de token QR
       ↓
Validación del QR
       ↓
Estado ENTREGADA
```

La entrega se encuentra relacionada con una solicitud específica y utiliza un token QR único.

### Notificaciones

El sistema genera y consulta notificaciones relacionadas con las acciones realizadas dentro de FoodMap.

### Chat

Permite la comunicación entre los participantes del proceso de donación y solicitud.

### Calificaciones

Las calificaciones están asociadas a una entrega.

Para registrar una calificación:

* La entrega debe existir.
* La entrega debe encontrarse en estado `ENTREGADA`.
* El usuario debe participar en la entrega.
* No se permite registrar más de una calificación para la misma entrega por el mismo usuario.

## Estados de entrega

El estado final utilizado por el sistema es:

```text
ENTREGADA
```

Este estado representa que la entrega fue completada correctamente mediante el flujo correspondiente.

La confirmación manual de recepción también se mantiene como mecanismo de respaldo.

## Roles

El sistema utiliza cuatro roles principales:

```text
ADMIN
MODERADOR
DONADOR
BENEFICIARIO
```

El acceso a determinados recursos depende del rol del usuario autenticado.

## Estructura

```text
backend/
├── scripts/
│   ├── init-db.js
│   ├── migrate.js
│   └── seed.js
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── app/
│   └── server.js
├── test/
├── .env
├── package.json
└── README.md
```

## Scripts

| Comando              | Función                         |
| -------------------- | ------------------------------- |
| `npm start`          | Inicia el servidor              |
| `npm run dev`        | Inicia el servidor con Nodemon  |
| `npm run db:init`    | Inicializa la base de datos     |
| `npm run db:migrate` | Ejecuta migraciones             |
| `npm run db:seed`    | Inserta datos de prueba         |
| `npm test`           | Ejecuta las pruebas del backend |

## Pruebas

Las pruebas del backend utilizan el sistema de pruebas integrado de Node.js.

Ejecutar:

```bash
npm test
```

También pueden ejecutarse las pruebas directamente desde la raíz del proyecto cuando sea necesario especificar el archivo correspondiente.

## Seguridad

El backend utiliza:

* JWT para autenticación.
* bcryptjs para contraseñas.
* Variables de entorno mediante dotenv.
* CORS.
* Middleware de autenticación y autorización.
* Control de acceso según roles.

No deben almacenarse credenciales, contraseñas ni secretos directamente en el código fuente.

## Servidor

Configuración de desarrollo:

```text
Frontend: http://localhost:4200
Backend:  http://localhost:8080
API:      http://localhost:8080/api
```
