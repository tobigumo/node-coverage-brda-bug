const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getValue } = require('../src/example-c8.js');

describe('getValue (c8)', () => {
  it('should return truthy when condition is true', () => {
    assert.strictEqual(getValue(true), 'truthy');
  });
});
