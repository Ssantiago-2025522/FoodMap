-- Migración: soporte de estados reales de donación (Disponible/Reservada/Entregada/Expirada)
-- y hace que "imagen" sea opcional, ya que el formulario de donaciones aún no permite subir imágenes.
--
-- Aplica sobre bases de datos creadas con un esquema anterior donde
-- donacion.estado era BOOLEAN e imagen era NOT NULL. Es segura de ejecutar
-- más de una vez.

ALTER TABLE donacion
  MODIFY COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'Disponible';

UPDATE donacion SET estado = 'Disponible' WHERE estado = '1';
UPDATE donacion SET estado = 'Expirada' WHERE estado = '0';

ALTER TABLE donacion
  MODIFY COLUMN imagen VARCHAR(225) NULL;
