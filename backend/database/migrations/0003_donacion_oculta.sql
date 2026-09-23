-- Migración: agrega la columna "oculta" a donacion, usada para que un
-- administrador/moderador pueda ocultar una donación sin eliminarla.
--
-- Solo agrega la columna si todavía no existe (ver nota en 0002 sobre por qué
-- se comprueba en information_schema en vez de usar "IF NOT EXISTS").

SET @existe_oculta := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'donacion' AND COLUMN_NAME = 'oculta'
);
SET @sql_oculta := IF(@existe_oculta = 0,
  'ALTER TABLE donacion ADD COLUMN oculta BOOLEAN NOT NULL DEFAULT FALSE AFTER imagen',
  'SELECT 1');
PREPARE stmt_oculta FROM @sql_oculta;
EXECUTE stmt_oculta;
DEALLOCATE PREPARE stmt_oculta;
