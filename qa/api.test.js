const test = require('node:test');
const assert = require('node:assert');
const { calculateUrgency } = require('../backend/server');

test('Expiry Tracker classifies <= 3 hours as CRITICAL', () => {
  assert.strictEqual(calculateUrgency(1.5), 'CRITICAL');
  assert.strictEqual(calculateUrgency(3), 'CRITICAL');
});

test('Expiry Tracker classifies 3.1 to 6 hours as EXPIRING SOON', () => {
  assert.strictEqual(calculateUrgency(4.5), 'EXPIRING SOON');
  assert.strictEqual(calculateUrgency(6), 'EXPIRING SOON');
});

test('Expiry Tracker classifies > 6 hours as FRESH', () => {
  assert.strictEqual(calculateUrgency(8), 'FRESH');
  assert.strictEqual(calculateUrgency(12), 'FRESH');
});
