import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import EnzymeDesigner from '../src/components/EnzymeDesigner.js';

describe('EnzymeDesigner', () => {
  it('analyzeSequence computes properties', () => {
    const res = EnzymeDesigner.analyzeSequence('ACD');
    assert.ok(res);
    assert.strictEqual(res.length, 3);
    assert.ok(Math.abs(res.molecularWeight - 361.35) < 0.1);
    assert.strictEqual(res.composition.A, 1);
    assert.strictEqual(res.composition.C, 1);
    assert.strictEqual(res.composition.D, 1);
  });

  it('analyzeSequence rejects invalid characters', () => {
    assert.strictEqual(EnzymeDesigner.analyzeSequence('ABZ'), null);
  });
});
