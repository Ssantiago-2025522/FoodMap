-- Migración: permite guardar la foto de perfil como imagen (base64) en vez de solo
-- una ruta corta, y agrega las columnas necesarias para restablecer la contraseña
-- cuando el usuario la olvida.
--
-- Es segura de ejecutar tanto sobre una base antigua (sin estas columnas) como
-- sobre una creada con la versión más reciente de database/foodmapdb_in5bm.sql
-- (que ya las incluye): cada columna solo se agrega si todavía no existe,
-- comprobándolo en information_schema en vez de depender de "IF NOT EXISTS"
-- en ADD COLUMN (no todas las versiones de MySQL/MariaDB lo aceptan igual).

ALTER TABLE usuario
  MODIFY COLUMN foto MEDIUMTEXT NULL;

SET @existe_reset_token := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME = 'reset_token'
);
SET @sql_reset_token := IF(@existe_reset_token = 0,
  'ALTER TABLE usuario ADD COLUMN reset_token VARCHAR(255) NULL',
  'SELECT 1');
PREPARE stmt_reset_token FROM @sql_reset_token;
EXECUTE stmt_reset_token;
DEALLOCATE PREPARE stmt_reset_token;

SET @existe_reset_token_expira := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuario' AND COLUMN_NAME = 'reset_token_expira'
);
SET @sql_reset_token_expira := IF(@existe_reset_token_expira = 0,
  'ALTER TABLE usuario ADD COLUMN reset_token_expira DATETIME NULL',
  'SELECT 1');
PREPARE stmt_reset_token_expira FROM @sql_reset_token_expira;
EXECUTE stmt_reset_token_expira;
DEALLOCATE PREPARE stmt_reset_token_expira;
