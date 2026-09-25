-- Migración: agregar campo comentario a la tabla solicitud
-- 
-- Permite que los usuarios solicitantes incluyan una nota o mensaje
-- al solicitar una donación.

ALTER TABLE solicitud
  ADD COLUMN comentario TEXT NULL;