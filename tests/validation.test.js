import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ageOnDate, passwordScore, validateField } from '../js/validation.js';

test('age checks the birthday and rejects impossible or future dates', () => {
  const today = new Date(2026, 9, 15);
  assert.equal(ageOnDate('2010-10-15', today), 16);
  assert.equal(ageOnDate('2010-10-16', today), 15);
  assert.ok(Number.isNaN(ageOnDate('2025-02-29', today)));
  assert.ok(validateField('birthDate', '2028-01-01', {}, today));
  assert.ok(validateField('birthDate', '', {}, today));
  assert.equal(validateField('birthDate', '2010-10-15', {}, today), '');
});
test('password confirmation preserves significant spaces', () => {
  assert.equal(passwordScore('Secure1!'), 5);
  assert.ok(validateField('password', 'password', {}));
  assert.equal(validateField('password', ' Secure1! ', {}), '');
  assert.ok(validateField('confirmPassword', 'Secure1!', { password: ' Secure1! ' }));
  assert.equal(validateField('confirmPassword', ' Secure1! ', { password: ' Secure1! ' }), '');
});
test('names, international phones and mandatory choices validate', () => {
  assert.equal(validateField('name', 'María-José', {}), '');
  assert.equal(validateField('lastName', "O’Connor", {}), '');
  assert.ok(validateField('name', '<script>', {}));
  assert.equal(validateField('phone', '+58 (412) 123-4567', {}), '');
  assert.ok(validateField('email', 'not-an-email', {}));
  assert.ok(validateField('interests', [], {}));
  assert.equal(validateField('interests', ['Frontend'], {}), '');
  assert.ok(validateField('terms', undefined, {}));
});
