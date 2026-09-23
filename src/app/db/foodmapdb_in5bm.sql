CREATE TABLE donacion (
    id_donacion BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(225) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    fecha_publicacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATETIME,
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible',
    imagen LONGTEXT,
    oculta BOOLEAN NOT NULL DEFAULT FALSE,
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