const test = require('node:test');
const assert = require('node:assert/strict');
const { calculate } = require('./public/arithmetic-core');

test('adds positive and negative numbers', () => {
  assert.equal(calculate('12', '+', '-5'), 7);
});

test('subtracts numbers', () => {
  assert.equal(calculate(4, '-', 9), -5);
});

test('multiplies decimals', () => {
  assert.equal(calculate(2.5, '*', 4), 10);
});

test('divides numbers', () => {
  assert.equal(calculate(9, '/', 3), 3);
});

test('rejects division by zero', () => {
  assert.throws(() => calculate(9, '/', 0), /divide by zero/i);
});

test('rejects invalid input', () => {
  assert.throws(() => calculate('abc', '+', 1), /valid numbers/i);
});
