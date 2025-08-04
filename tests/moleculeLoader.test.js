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
      async () =>
        `mol\n  mock\n\n  1  0  0  0  0  0            999 V2000\n    0.0  0.0  0.0 H   0  0  0  0  0  0  0  0  0  0  0  0\nM  END\n$$$$`
    );
    await loader.loadMolecule('ZZZ');
    assert.strictEqual(cardUI.createMoleculeCard.mock.callCount(), 1);
    assert.strictEqual(repo.getMolecule('ZZZ').status, 'loaded');
  });

  it('uses instance SDF even when local SMILES exists', async () => {
    const repo = new MoleculeRepository([
      { code: 'CCC', status: 'pending', pdbId: '1ABC', authSeqId: '5', labelAsymId: 'A' },
    ]);
    const loader = new MoleculeLoader(repo, cardUI);
    // Local TSV has matching code but should be ignored for instances
    mock.method(
      ApiService,
      'getFragmentLibraryTsv',
      async () => '0\t1\t2\tSMI\t4\t5\t6\t7\tCCC'
    );
    mock.method(
      ApiService,
      'getInstanceSdf',
      async () =>
        `inst\n  mock\n\n  1  0  0  0  0  0            999 V2000\n    0.0  0.0  0.0 H   0  0  0  0  0  0  0  0  0  0  0  0\nM  END\n$$$$`
    );
    await loader.loadMolecule(repo.getMolecule('CCC'));
    assert.strictEqual(ApiService.getInstanceSdf.mock.callCount(), 1);
    assert.strictEqual(cardUI.createMoleculeCard.mock.callCount(), 1);
    assert.strictEqual(cardUI.createMoleculeCardFromSmiles.mock.callCount(), 0);
    assert.strictEqual(repo.getMolecule('CCC').status, 'loaded');
  });

  it('rejects instance SDF lacking structure data', async () => {
    const repo = new MoleculeRepository([
      { code: 'DDD', status: 'pending', pdbId: '9XYZ', authSeqId: '1', labelAsymId: 'B' },
    ]);
    const loader = new MoleculeLoader(repo, cardUI);
    mock.method(ApiService, 'getInstanceSdf', async () => '> <model_server_result.job_id>\nabc123\n');
    await loader.loadMolecule(repo.getMolecule('DDD'));
    assert.strictEqual(cardUI.createNotFoundCard.mock.callCount(), 1);
    assert.strictEqual(repo.getMolecule('DDD').status, 'error');
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
