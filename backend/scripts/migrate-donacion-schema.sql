-- Migración: soporte de estados reales de donación (Disponible/Reservada/Entregada/Expirada)
-- y hace que "imagen" sea opcional, ya que el formulario de donaciones aún no permite subir imágenes.
--
-- Ejecuta este script SOLO si tu base de datos ya existía con el esquema anterior
-- (donacion.estado era BOOLEAN e imagen era NOT NULL) y quieres conservar los datos.
-- Si vas a crear la base de datos desde cero, usa: npm run db:init -- --force
--
-- Uso:
--   mysql -u root -p foodmapdb_in5bm < backend/scripts/migrate-donacion-schema.sql

USE foodmapdb_in5bm;

ALTER TABLE donacion
  MODIFY COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'Disponible';

UPDATE donacion SET estado = 'Disponible' WHERE estado = '1';
UPDATE donacion SET estado = 'Expirada' WHERE estado = '0';

ALTER TABLE donacion
  MODIFY COLUMN imagen VARCHAR(225) NULL;
