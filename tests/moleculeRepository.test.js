import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import MoleculeRepository from '../src/utils/MoleculeRepository.js';

describe('MoleculeRepository', () => {
  it('adds unique molecules and prevents duplicates', () => {
    const repo = new MoleculeRepository();
    assert.ok(repo.addMolecule('A'));
    assert.strictEqual(repo.addMolecule('A'), false);
    assert.deepStrictEqual(repo.getAllMolecules(), [
      { code: 'A', status: 'pending', id: 'A', tags: [] },
    ]);
  });

  it('stores instance metadata when provided', () => {
    const repo = new MoleculeRepository();
    repo.addMolecule({ code: 'B', pdbId: '1ABC', authSeqId: '5', labelAsymId: 'A' });
    assert.deepStrictEqual(repo.getMolecule('B'), {
      code: 'B',
      status: 'pending',
      pdbId: '1ABC',
      authSeqId: '5',
      labelAsymId: 'A',
      id: '1ABC_A_5_B',
      tags: []
    });
  });

  it('allows same code for different pdb instances', () => {
    const repo = new MoleculeRepository();
    assert.ok(repo.addMolecule('DUP'));
    assert.ok(
      repo.addMolecule({
        code: 'DUP',
        pdbId: '9XYZ',
        authSeqId: '1',
        labelAsymId: 'A',
      })
    );
    assert.strictEqual(repo.getAllMolecules().length, 2);
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

    it('exportToSdf concatenates SDF records', () => {
      const repo = new MoleculeRepository([
        { code: 'A', status: 'loaded', sdf: 'A\n$$$$' },
        { code: 'B', status: 'loaded', sdf: 'B\n$$$$' },
      ]);
      const result = repo.exportToSdf();
      assert.strictEqual(result, 'A\n$$$$\nB\n$$$$');
    });

    it('exportToSdf removes hydrogens when requested', () => {
      const sdf = `Example\n  test\n\n  3  2  0  0  0  0            999 V2000\n    0.0000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0\n    1.0000    0.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n   -1.0000    0.0000    0.0000 H   0  0  0  0  0  0  0  0  0  0  0  0\n  1  2  1  0  0  0  0\n  1  3  1  0  0  0  0\nM  END\n$$$$`;
      const repo = new MoleculeRepository([{ code: 'X', status: 'loaded', sdf }]);
      const result = repo.exportToSdf({ removeHydrogens: true });
      const lines = result.split('\n');
      assert.strictEqual(parseInt(lines[3].slice(0, 3)), 1);
      assert.strictEqual(parseInt(lines[3].slice(3, 6)), 0);
      assert.ok(!result.includes(' H '));
      assert.ok(result.endsWith('$$$$'));
    });
  });
