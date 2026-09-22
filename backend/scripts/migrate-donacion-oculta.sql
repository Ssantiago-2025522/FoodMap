
USE foodmapdb_in5bm;

ALTER TABLE donacion
  ADD COLUMN oculta BOOLEAN NOT NULL DEFAULT FALSE AFTER imagen;