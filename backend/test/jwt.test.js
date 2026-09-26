const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'clave-de-pruebas';
process.env.JWT_EXPIRES_IN = '1h';

const { firmarToken, verificarToken } = require('../src/utils/jwt');

test('firmarToken() genera un token que verificarToken() puede validar', () => {
  const usuario = { id_usuario: 42, id_rol: 4 };
  const token = firmarToken(usuario);

  assert.equal(typeof token, 'string');

  const payload = verificarToken(token);
  assert.equal(payload.id_usuario, 42);
  assert.equal(payload.id_rol, 4);
});

test('verificarToken() rechaza tokens inválidos', () => {
  assert.throws(() => verificarToken('token-invalido'));
});
