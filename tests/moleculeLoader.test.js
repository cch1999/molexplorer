import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import MoleculeLoader from '../src/utils/MoleculeLoader.js';
import MoleculeRepository from '../src/utils/MoleculeRepository.js';
import ApiService from '../src/utils/apiService.js';

describe('MoleculeLoader', () => {
  let cardUI;

  beforeEach(() => {
    cardUI = {
      createMoleculeCard: mock.fn(),
      createMoleculeCardFromSmiles: mock.fn(),
      createNotFoundCard: mock.fn(),
    };
  });

  afterEach(() => {
    mock.restoreAll();
  });
  it('loads molecule from local TSV when available', async () => {
    const repo = new MoleculeRepository([{ code: 'XYZ', status: 'pending' }]);
    const loader = new MoleculeLoader(repo, cardUI);
    mock.method(ApiService, 'getFragmentLibraryTsv', async () => '0\t1\t2\tC1=O\t4\t5\t6\t7\tXYZ');
    await loader.loadMolecule('XYZ');
    assert.strictEqual(cardUI.createMoleculeCardFromSmiles.mock.callCount(), 1);
    assert.strictEqual(cardUI.createMoleculeCardFromSmiles.mock.calls[0].arguments[0], 'C1=O');
    assert.strictEqual(repo.getMolecule('XYZ').status, 'loaded');
  });

  it('falls back to remote SDF when local data missing', async () => {
    const repo = new MoleculeRepository([{ code: 'ZZZ', status: 'pending' }]);
    const loader = new MoleculeLoader(repo, cardUI);
    mock.method(ApiService, 'getFragmentLibraryTsv', async () => '');
    mock.method(
      ApiService,
      'getCcdSdf',
      async () => 'name\n\n\n  1  0  0  0  0  0 0  0  0  0  0  0  0  0\n'
    );
    await loader.loadMolecule('ZZZ');
    assert.strictEqual(cardUI.createMoleculeCard.mock.callCount(), 1);
    assert.strictEqual(repo.getMolecule('ZZZ').status, 'loaded');
  });

  it('uses instance SDF when details provided', async () => {
    const repo = new MoleculeRepository([
      { code: 'CCC', status: 'pending', pdbId: '1ABC', authSeqId: '5', labelAsymId: 'A' },
    ]);
    const loader = new MoleculeLoader(repo, cardUI);
    mock.method(ApiService, 'getFragmentLibraryTsv', async () => '');
    mock.method(
      ApiService,
      'getInstanceSdf',
      async () => 'name\n\n\n  1  0  0  0  0  0 0  0  0  0  0  0  0  0\n'
    );
    await loader.loadMolecule(repo.getMolecule('CCC'));
    assert.strictEqual(ApiService.getInstanceSdf.mock.callCount(), 1);
    assert.deepStrictEqual(ApiService.getInstanceSdf.mock.calls[0].arguments, [
      '1ABC',
      '5',
      'A',
      'CCC',
    ]);
    assert.strictEqual(cardUI.createMoleculeCard.mock.callCount(), 1);
    assert.strictEqual(repo.getMolecule('CCC').status, 'loaded');
  });

  it('handles invalid instance SDF responses', async () => {
    const repo = new MoleculeRepository([
      { code: 'BAD', status: 'pending', pdbId: '1ABC', authSeqId: '5', labelAsymId: 'A' },
    ]);
    const loader = new MoleculeLoader(repo, cardUI);
    mock.method(ApiService, 'getFragmentLibraryTsv', async () => '');
    mock.method(ApiService, 'getInstanceSdf', async () => '<model_server_result />');
    await loader.loadMolecule(repo.getMolecule('BAD'));
    assert.strictEqual(cardUI.createNotFoundCard.mock.callCount(), 1);
    assert.strictEqual(repo.getMolecule('BAD').status, 'error');
  });

  it('treats zero atom counts as errors', async () => {
    const repo = new MoleculeRepository([{ code: 'EMP', status: 'pending' }]);
    const loader = new MoleculeLoader(repo, cardUI);
    mock.method(ApiService, 'getFragmentLibraryTsv', async () => '');
    mock.method(
      ApiService,
      'getCcdSdf',
      async () => 'name\n\n\n  0  0  0  0  0  0 0  0  0  0  0  0  0  0\n'
    );
    await loader.loadMolecule('EMP');
    assert.strictEqual(cardUI.createNotFoundCard.mock.callCount(), 1);
    assert.strictEqual(repo.getMolecule('EMP').status, 'error');
  });

  it('handles errors from remote fetch', async () => {
    const repo = new MoleculeRepository([{ code: 'BAD', status: 'pending' }]);
    const loader = new MoleculeLoader(repo, cardUI);
    mock.method(ApiService, 'getFragmentLibraryTsv', async () => '');
    mock.method(ApiService, 'getCcdSdf', async () => '<html>error');
    await loader.loadMolecule('BAD');
    assert.strictEqual(cardUI.createNotFoundCard.mock.callCount(), 1);
    assert.strictEqual(repo.getMolecule('BAD').status, 'error');
  });

  it('findMoleculeInLocalTsv returns SMILES', async () => {
    const repo = new MoleculeRepository();
    const loader = new MoleculeLoader(repo, cardUI);
    mock.method(ApiService, 'getFragmentLibraryTsv', async () => 'a\tb\tc\tSMI\td\te\tf\tg\tFOO');
    const result = await loader.findMoleculeInLocalTsv('FOO');
    assert.strictEqual(result, 'SMI');
  });
});
