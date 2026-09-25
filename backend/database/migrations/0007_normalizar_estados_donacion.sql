-- Migración: normalizar estados de donación a valores de texto
-- Convierte valores numéricos antiguos ('1', '2') a 'Disponible' y 'Reservada' / 'Entregada'

UPDATE donacion SET estado = 'Disponible' WHERE estado = '1';
UPDATE donacion SET estado = 'Reservada'  WHERE estado = '2';
UPDATE donacion SET estado = 'Expirada'   WHERE estado = '0';