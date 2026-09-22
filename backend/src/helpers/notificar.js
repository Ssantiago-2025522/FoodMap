function recortar(texto, max) {
  return texto.length > max ? texto.slice(0, max - 1) + '…' : texto;
}

async function notificar(conn, idUsuario, titulo, mensaje) {
  await conn.query(
    'INSERT INTO notificacion (titulo, mensaje, id_usuario) VALUES (?, ?, ?)',
    [recortar(titulo, 50), recortar(mensaje, 255), idUsuario]
  );
}

module.exports = { recortar, notificar };
