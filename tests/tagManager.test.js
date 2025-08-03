import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import MoleculeRepository from '../src/utils/MoleculeRepository.js';
import TagManager from '../src/utils/TagManager.js';

describe('TagManager', () => {
  it('adds tags to molecules', () => {
    const repo = new MoleculeRepository([{ code: 'A', status: 'pending' }]);
    const tm = new TagManager(repo);
    assert.ok(tm.addTag('A', 'important'));
    assert.deepStrictEqual(tm.getTags('A'), ['important']);
  });

  it('edits existing tags', () => {
    const repo = new MoleculeRepository([{ code: 'B', status: 'pending', tags: ['old'] }]);
    const tm = new TagManager(repo);
    assert.ok(tm.updateTag('B', 'old', 'new'));
    assert.deepStrictEqual(tm.getTags('B'), ['new']);
  });

  it('removes tags from molecules', () => {
    const repo = new MoleculeRepository([{ code: 'C', status: 'pending', tags: ['t1', 't2'] }]);
    const tm = new TagManager(repo);
    assert.ok(tm.removeTag('C', 't1'));
    assert.deepStrictEqual(tm.getTags('C'), ['t2']);
  });
});
