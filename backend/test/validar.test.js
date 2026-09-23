const test = require('node:test');
const assert = require('node:assert/strict');

const { entero, texto } = require('../src/utils/validar');
const ApiError = require('../src/utils/ApiError');

test('entero() acepta números enteros positivos', () => {
  assert.equal(entero('5', 'campo'), 5);
  assert.equal(entero(1, 'campo'), 1);
});

test('entero() rechaza valores no enteros o no positivos', () => {
  for (const valor of ['abc', -1, 0, 1.5, undefined, null]) {
    assert.throws(() => entero(valor, 'campo'), ApiError);
  }
});

test('entero() incluye el nombre del campo en el mensaje de error', () => {
  try {
    entero('abc', 'cantidad');
    assert.fail('Debía lanzar un error');
  } catch (error) {
    assert.match(error.message, /cantidad/);
    assert.equal(error.status, 400);
  }
});

test('texto() recorta espacios y permite valores vacíos como null', () => {
  assert.equal(texto('  hola  ', 10), 'hola');
  assert.equal(texto('   ', 10), null);
  assert.equal(texto(undefined, 10), null);
  assert.equal(texto(null, 10), null);
});

test('texto() rechaza textos más largos que el máximo permitido', () => {
  assert.throws(() => texto('123456', 5, 'La descripción'), ApiError);
});
