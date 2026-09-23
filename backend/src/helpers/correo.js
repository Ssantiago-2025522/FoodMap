/**
 * Envía el correo con el enlace para restablecer la contraseña.
 *
 * NOTA IMPORTANTE: este proyecto todavía no tiene integrado un proveedor real
 * de envío de correos (por ejemplo Nodemailer + SMTP, Resend, SendGrid, etc.).
 * Mientras tanto, esta función solo registra el enlace en la consola del
 * servidor para poder probar el flujo de "olvidé mi contraseña" en desarrollo.
 *
 * Para producción, reemplaza el contenido de esta función por el envío real
 * (por ejemplo usando nodemailer.createTransport(...) con las credenciales
 * SMTP en el .env) sin necesidad de tocar el resto del controlador.
 */
async function enviarCorreoRecuperacion(correo, enlace) {
  console.log('----------------------------------------------------');
  console.log(`[FoodMap] Solicitud de recuperación de contraseña para: ${correo}`);
  console.log(`[FoodMap] Enlace de restablecimiento: ${enlace}`);
  console.log('----------------------------------------------------');
}

module.exports = { enviarCorreoRecuperacion };
