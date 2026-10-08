const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret-key-16chars';
process.env.DB_URI = process.env.DB_URI || 'mongodb://127.0.0.1:27017/test';
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const {
  validateCart,
  normalizeEmail,
  validatePassword,
  validateScanData,
  toObjectId,
  MAX_TICKETS_PER_ORDER,
} = require('../others/validate');

describe('validate', () => {
  it('rejects unsafe cart quantities', () => {
    assert.equal(validateCart([]).ok, false);
    assert.equal(validateCart([{ id: '507f1f77bcf86cd799439014', quantity: 1.5 }]).ok, false);
    assert.equal(validateCart([{ id: '507f1f77bcf86cd799439014', quantity: -1 }]).ok, false);
    assert.equal(validateCart([{ id: '507f1f77bcf86cd799439014', quantity: Infinity }]).ok, false);
    assert.equal(validateCart([{ id: '507f1f77bcf86cd799439014', quantity: '2' }]).ok, false);
  });

  it('accepts bounded cart', () => {
    const result = validateCart([{ id: '507f1f77bcf86cd799439014', quantity: 2 }]);
    assert.equal(result.ok, true);
    assert.equal(result.totalTickets, 2);
  });

  it('caps total tickets', () => {
    const panier = Array.from({ length: 10 }, () => ({
      id: '507f1f77bcf86cd799439014',
      quantity: 20,
    }));
    assert.equal(panier.reduce((a, i) => a + i.quantity, 0) > MAX_TICKETS_PER_ORDER, true);
    assert.equal(validateCart(panier).ok, false);
  });

  it('normalizes emails and rejects operators', () => {
    assert.equal(normalizeEmail({ $ne: null }), null);
    assert.equal(normalizeEmail('Foo@Bar.COM'), 'foo@bar.com');
  });

  it('validates password length', () => {
    assert.equal(validatePassword('short'), false);
    assert.equal(validatePassword('longenough'), true);
  });

  it('validates scan data', () => {
    assert.equal(validateScanData('123+456'), true);
    assert.equal(validateScanData('12+456'), false);
  });

  it('normalizes ObjectId casing', () => {
    assert.equal(
      toObjectId('507f1f77bcf86cd799439013').toString(),
      toObjectId('507F1F77BCF86CD799439013').toString()
    );
  });
});
