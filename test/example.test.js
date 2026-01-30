const { describe, it } = require('node:test');
const assert = require('node:assert');
const { getValue } = require('../src/example.js');

describe('getValue', () => {
  it('should return truthy when condition is true', () => {
    assert.strictEqual(getValue(true), 'truthy');
  });
});
