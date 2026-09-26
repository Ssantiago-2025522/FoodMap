const nodemailer = require('nodemailer');

let transportador = null;

function smtpConfigurado() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function obtenerTransportador() {
  if (transportador) return transportador;

  transportador = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  return transportador;
}

async function enviarCorreoRecuperacion(correo, enlace) {
  if (!smtpConfigurado()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'No se puede enviar el correo de recuperación: falta configurar SMTP_HOST, SMTP_USER y SMTP_PASSWORD en producción.'
      );
    }

    // Sin proveedor configurado y en desarrollo: solo se registra en consola.
    console.log('----------------------------------------------------');
    console.log('[FoodMap] SMTP no configurado (modo desarrollo). No se envió un correo real.');
    console.log(`[FoodMap] Solicitud de recuperación de contraseña para: ${correo}`);
    console.log(`[FoodMap] Enlace de restablecimiento: ${enlace}`);
    console.log('----------------------------------------------------');
    return { enviado: false };
  }

  const remitente = process.env.SMTP_FROM || process.env.SMTP_USER;

  await obtenerTransportador().sendMail({
    from: remitente,
    to: correo,
    subject: 'Recupera tu contraseña de FoodMap',
    text:
      `Recibimos una solicitud para restablecer tu contraseña.\n\n` +
      `Usa este enlace (válido por 1 hora) para crear una nueva contraseña:\n${enlace}\n\n` +
      `Si no solicitaste esto, puedes ignorar este mensaje.`,
    html:
      `<p>Recibimos una solicitud para restablecer tu contraseña.</p>` +
      `<p>Usa este enlace (válido por 1 hora) para crear una nueva contraseña:</p>` +
      `<p><a href="${enlace}">${enlace}</a></p>` +
      `<p>Si no solicitaste esto, puedes ignorar este mensaje.</p>`
  });

  return { enviado: true };
}

module.exports = { enviarCorreoRecuperacion };
