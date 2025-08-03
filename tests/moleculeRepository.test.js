import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import MoleculeRepository from '../src/utils/MoleculeRepository.js';

describe('MoleculeRepository', () => {
  it('adds unique molecules and prevents duplicates', () => {
    const repo = new MoleculeRepository();
    assert.ok(repo.addMolecule('A'));
    assert.strictEqual(repo.addMolecule('A'), false);
    assert.deepStrictEqual(repo.getAllMolecules(), [{ code: 'A', status: 'pending' }]);
  });

  it('removes molecules by code', () => {
    const repo = new MoleculeRepository([{ code: 'A', status: 'pending' }]);
    assert.ok(repo.removeMolecule('A'));
    assert.strictEqual(repo.removeMolecule('A'), false);
  });

  it('updates molecule status', () => {
    const repo = new MoleculeRepository([{ code: 'A', status: 'pending' }]);
    repo.updateMoleculeStatus('A', 'loaded');
    assert.strictEqual(repo.getMolecule('A').status, 'loaded');
  });

  it('getAllMolecules returns copy', () => {
    const repo = new MoleculeRepository([{ code: 'A', status: 'pending' }]);
    const arr = repo.getAllMolecules();
    arr.push({ code: 'B', status: 'pending' });
    assert.strictEqual(repo.getAllMolecules().length, 1);
  });

  it('deleteAllMolecules clears repository', () => {
    const repo = new MoleculeRepository([{ code: 'A', status: 'loaded' }]);
    repo.deleteAllMolecules();
    assert.strictEqual(repo.getAllMolecules().length, 0);
  });
});
