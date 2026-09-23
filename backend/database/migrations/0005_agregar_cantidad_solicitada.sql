-- Migración: agregar campo cantidad_solicitada a la tabla solicitud
-- 
-- Agrega la columna cantidad_solicitada requerida por el backend para gestionar
-- la cantidad de ítems/porciones requeridas en una solicitud de donación.
-- Asigna un valor por defecto de 1 a los registros existentes.

ALTER TABLE solicitud
  ADD COLUMN cantidad_solicitada INT NOT NULL DEFAULT 1;