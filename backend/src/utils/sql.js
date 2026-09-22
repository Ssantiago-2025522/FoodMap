const DISPONIBLE = `(d.cantidad - CAST(COALESCE((
    SELECT SUM(a.cantidad_solicitada) FROM solicitud a
    WHERE a.id_donacion = d.id_donacion AND a.estado = 'ACEPTADA'), 0) AS SIGNED))`;

const VIGENTE = `(d.estado = 'Disponible' AND (d.fecha_vencimiento IS NULL OR d.fecha_vencimiento > NOW()))`;

module.exports = { DISPONIBLE, VIGENTE };
