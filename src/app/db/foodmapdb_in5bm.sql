CREATE TABLE rol (
    id_rol BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL UNIQUE,

    descripcion VARCHAR(225) NOT NULL
);

CREATE TABLE usuario (
    id_usuario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    username VARCHAR(100) NOT NULL,

    correo VARCHAR(100) NOT NULL UNIQUE,

    telefono VARCHAR(10) NOT NULL UNIQUE,

    contrasena VARCHAR(225) NOT NULL,

    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    foto VARCHAR(225),

    id_rol BIGINT NOT NULL,

    CONSTRAINT fk_usuario_rol
        FOREIGN KEY (id_rol)
        REFERENCES rol(id_rol)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE ubicacion (
    id_ubicacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    departamento VARCHAR(100) NOT NULL,

    municipio VARCHAR(100) NOT NULL,

    direccion VARCHAR(255) NOT NULL,

    latitud DECIMAL(10, 8),

    longitud DECIMAL(11, 8),

    referencia VARCHAR(255),

    CONSTRAINT chk_latitud
        CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90),

    CONSTRAINT chk_longitud
        CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180)
);

CREATE TABLE categoria (
    id_categoria BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    nombre VARCHAR(100) NOT NULL UNIQUE,

    descripcion VARCHAR(225) NOT NULL
);

CREATE TABLE donacion (
    id_donacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    titulo VARCHAR(100) NOT NULL,

    descripcion VARCHAR(225) NOT NULL,

    cantidad INTEGER NOT NULL DEFAULT 1,

    fecha_publicacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    fecha_vencimiento TIMESTAMP,

    estado BOOLEAN NOT NULL DEFAULT TRUE,

    imagen VARCHAR(225) NOT NULL,

    id_usuario BIGINT NOT NULL,

    id_ubicacion BIGINT NOT NULL,

    id_categoria BIGINT NOT NULL,

    CONSTRAINT fk_donacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_donacion_ubicacion
        FOREIGN KEY (id_ubicacion)
        REFERENCES ubicacion(id_ubicacion)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_donacion_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT chk_donacion_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_donacion_fechas
        CHECK (
            fecha_vencimiento IS NULL
            OR fecha_vencimiento >= fecha_publicacion
        )
);

CREATE TABLE solicitud (
    id_solicitud BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    fecha_solicitud TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    estado BOOLEAN NOT NULL DEFAULT TRUE,

    id_donacion BIGINT NOT NULL,

    id_usuario BIGINT NOT NULL,

    CONSTRAINT fk_solicitud_donacion
        FOREIGN KEY (id_donacion)
        REFERENCES donacion(id_donacion)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_solicitud_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_solicitud_donacion_usuario
        UNIQUE (id_donacion, id_usuario)
);


CREATE TABLE entrega (
    id_entrega BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    fecha_entrega DATE NOT NULL DEFAULT CURRENT_DATE,

    hora_entrega TIME NOT NULL DEFAULT CURRENT_TIME,

    observaciones VARCHAR(255),

    estado VARCHAR(50) NOT NULL,

    id_solicitud BIGINT NOT NULL UNIQUE,

    CONSTRAINT fk_entrega_solicitud
        FOREIGN KEY (id_solicitud)
        REFERENCES solicitud(id_solicitud)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE calificacion (
    id_calificacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    puntuacion INTEGER NOT NULL,

    comentario VARCHAR(255) NOT NULL,

    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    id_usuario BIGINT NOT NULL,

    id_entrega BIGINT NOT NULL,

    CONSTRAINT fk_calificacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_calificacion_entrega
        FOREIGN KEY (id_entrega)
        REFERENCES entrega(id_entrega)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_calificacion_puntuacion
        CHECK (puntuacion BETWEEN 1 AND 5),

    CONSTRAINT uq_calificacion_usuario_entrega
        UNIQUE (id_usuario, id_entrega)
);

CREATE TABLE reporte (
    id_reporte BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    motivo VARCHAR(225) NOT NULL,

    descripcion VARCHAR(225) NOT NULL,

    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    estado BOOLEAN NOT NULL DEFAULT TRUE,

    id_usuario BIGINT NOT NULL,

    id_donacion BIGINT NOT NULL,

    CONSTRAINT fk_reporte_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_reporte_donacion
        FOREIGN KEY (id_donacion)
        REFERENCES donacion(id_donacion)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE notificacion (
    id_notificacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    titulo VARCHAR(50) NOT NULL,

    mensaje VARCHAR(255) NOT NULL,

    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    leida BOOLEAN NOT NULL DEFAULT FALSE,

    id_usuario BIGINT NOT NULL,

    CONSTRAINT fk_notificacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE INDEX idx_usuario_rol
    ON usuario(id_rol);

CREATE INDEX idx_donacion_usuario
    ON donacion(id_usuario);

CREATE INDEX idx_donacion_ubicacion
    ON donacion(id_ubicacion);

CREATE INDEX idx_donacion_categoria
    ON donacion(id_categoria);

CREATE INDEX idx_donacion_estado
    ON donacion(estado);

CREATE INDEX idx_donacion_fecha_publicacion
    ON donacion(fecha_publicacion);

CREATE INDEX idx_solicitud_donacion
    ON solicitud(id_donacion);

CREATE INDEX idx_solicitud_usuario
    ON solicitud(id_usuario);

CREATE INDEX idx_solicitud_estado
    ON solicitud(estado);

CREATE INDEX idx_reporte_usuario
    ON reporte(id_usuario);

CREATE INDEX idx_reporte_donacion
    ON reporte(id_donacion);

CREATE INDEX idx_notificacion_usuario
    ON notificacion(id_usuario);

CREATE INDEX idx_notificacion_leida
    ON notificacion(leida);


INSERT INTO rol (nombre, descripcion)
VALUES
    ('ADMIN', 'Administrador del sistema'),
    ('MODERADOR', 'Moderador de contenido y usuarios'),
    ('ESTUDIANTE', 'Usuario estudiante que utiliza la plataforma');

