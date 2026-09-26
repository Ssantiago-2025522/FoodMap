-- Migración: agrega la columna token_qr a la tabla entrega.
--
-- Guarda el token único que identifica el código QR de una entrega real.
-- No contiene información sensible del usuario, solo un identificador
-- aleatorio usado para relacionar el QR físico/impreso con id_entrega.
--
-- Solo agrega la columna y el índice único si todavía no existen (ver nota
-- en 0002 sobre por qué se comprueba en information_schema en vez de
-- depender de "IF NOT EXISTS" en ADD COLUMN).

SET @existe_token_qr := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'entrega' AND COLUMN_NAME = 'token_qr'
);
SET @sql_token_qr := IF(@existe_token_qr = 0,
  'ALTER TABLE entrega ADD COLUMN token_qr VARCHAR(64) NULL AFTER estado',
  'SELECT 1');
PREPARE stmt_token_qr FROM @sql_token_qr;
EXECUTE stmt_token_qr;
DEALLOCATE PREPARE stmt_token_qr;

SET @existe_indice_token_qr := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'entrega' AND INDEX_NAME = 'uq_entrega_token_qr'
);
SET @sql_indice_token_qr := IF(@existe_indice_token_qr = 0,
  'ALTER TABLE entrega ADD CONSTRAINT uq_entrega_token_qr UNIQUE (token_qr)',
  'SELECT 1');
PREPARE stmt_indice_token_qr FROM @sql_indice_token_qr;
EXECUTE stmt_indice_token_qr;
DEALLOCATE PREPARE stmt_indice_token_qr;
