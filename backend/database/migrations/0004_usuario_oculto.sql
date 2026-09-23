-- Migración: agrega la columna "oculto" a usuario, usada para que un
-- administrador pueda ocultar/deshabilitar una cuenta sin eliminarla.
--
-- Solo agrega la columna si todavía no existe (ver nota en 0002 sobre por qué
-- se comprueba en information_schema en vez de usar "IF NOT EXISTS").

SET @existe_oculto := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME = 'oculto'
);
SET @sql_oculto := IF(@existe_oculto = 0,
  'ALTER TABLE usuario ADD COLUMN oculto BOOLEAN NOT NULL DEFAULT FALSE AFTER id_rol',
  'SELECT 1');
PREPARE stmt_oculto FROM @sql_oculto;
EXECUTE stmt_oculto;
DEALLOCATE PREPARE stmt_oculto;
