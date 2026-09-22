-- Migración: permite guardar la foto de perfil como imagen (base64) en vez de solo
-- una ruta corta, y agrega las columnas necesarias para restablecer la contraseña
-- cuando el usuario la olvida.
--
-- Ejecuta este script SOLO si tu base de datos ya existía con el esquema anterior
-- (usuario.foto era VARCHAR(225) y no existían las columnas de reset_token).
-- Si vas a crear la base de datos desde cero, usa: npm run db:init -- --force
--
-- Uso:
--   mysql -u root -p foodmapdb_in5bm < backend/scripts/migrate-usuario-perfil.sql

USE foodmapdb_in5bm;

ALTER TABLE usuario
  MODIFY COLUMN foto MEDIUMTEXT NULL;

ALTER TABLE usuario
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS reset_token_expira DATETIME NULL;
