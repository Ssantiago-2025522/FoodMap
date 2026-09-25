const test = require('node:test');
const assert = require('node:assert/strict');

const { enviarCorreoRecuperacion } = require('../src/helpers/correo');

function limpiarEnvSmtp() {
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
}

test('en desarrollo, sin SMTP configurado, no envía correo real y no lanza error', async () => {
  const nodeEnvOriginal = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  limpiarEnvSmtp();

  const resultado = await enviarCorreoRecuperacion('persona@example.com', 'http://localhost/token');
  assert.deepEqual(resultado, { enviado: false });

  process.env.NODE_ENV = nodeEnvOriginal;
});

test('en producción, sin SMTP configurado, lanza un error en vez de fallar en silencio', async () => {
  const nodeEnvOriginal = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  limpiarEnvSmtp();

  await assert.rejects(
    () => enviarCorreoRecuperacion('persona@example.com', 'http://localhost/token'),
    /SMTP/
  );

  process.env.NODE_ENV = nodeEnvOriginal;
});
