import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import LigandModal from '../src/modal/LigandModal.js';
import LigandDetails from '../src/modal/LigandDetails.js';
import SimilarLigandTable from '../src/modal/SimilarLigandTable.js';
import PdbEntryList from '../src/modal/PdbEntryList.js';
import PropertyCalculator from '../src/utils/propertyCalculator.js';

describe('LigandModal orchestrator', () => {
  it('delegates to subcomponents', () => {
    const makeEl = () => ({ style: {}, addEventListener: () => {}, innerHTML: '', textContent: '' });
    const propsEl = makeEl();
    global.document = {
      getElementById: (id) => (id === 'ligand-properties' ? propsEl : makeEl()),
      querySelectorAll: () => [makeEl(), makeEl()]
    };
    global.window = { addEventListener: () => {} };

    const showSpy = mock.method(LigandDetails.prototype, 'show', () => {});
    const loadSimilarSpy = mock.method(SimilarLigandTable.prototype, 'load', () => {});
    const load2DSpy = mock.method(SimilarLigandTable.prototype, 'load2DStructure', () => {});
    const loadPdbSpy = mock.method(PdbEntryList.prototype, 'load', () => {});
    mock.method(PropertyCalculator, 'getProperties', async () => null);

    const lm = new LigandModal({});
    lm.show('ATP', 'sdf');
    lm.load2DStructure('ATP', 'container');

    assert.strictEqual(showSpy.mock.callCount(), 1);
    assert.deepStrictEqual(showSpy.mock.calls[0].arguments, ['ATP', 'sdf']);
    assert.strictEqual(loadSimilarSpy.mock.callCount(), 1);
    assert.deepStrictEqual(loadSimilarSpy.mock.calls[0].arguments, ['ATP']);
    assert.strictEqual(loadPdbSpy.mock.callCount(), 1);
    assert.deepStrictEqual(loadPdbSpy.mock.calls[0].arguments, ['ATP']);
    assert.strictEqual(load2DSpy.mock.callCount(), 1);
    assert.deepStrictEqual(load2DSpy.mock.calls[0].arguments, ['ATP', 'container']);

    mock.restoreAll();
    delete global.document;
    delete global.window;
  });
});

describe('LigandModal properties panel', () => {
  const makeEl = () => ({ style: {}, addEventListener: () => {}, innerHTML: '', textContent: '' });

  it('displays fetched properties', async () => {
    const propsEl = makeEl();
    global.document = {
      getElementById: (id) => (id === 'ligand-properties' ? propsEl : makeEl()),
      querySelectorAll: () => [makeEl(), makeEl()]
    };
    global.window = { addEventListener: () => {} };

    mock.method(LigandDetails.prototype, 'show', () => {});
    mock.method(SimilarLigandTable.prototype, 'load', () => {});
    mock.method(PdbEntryList.prototype, 'load', () => {});
    mock.method(PropertyCalculator, 'getProperties', async () => ({ molecularWeight: 55, formula: 'C2H6O' }));

    const lm = new LigandModal({});
    lm.show('ETH', 'sdf');

    await Promise.resolve();
    await Promise.resolve();
    assert.ok(propsEl.innerHTML.includes('55'));
    assert.ok(propsEl.innerHTML.includes('C2H6O'));

    mock.restoreAll();
    delete global.document;
    delete global.window;
  });

  it('shows fallback when properties unavailable', async () => {
    const propsEl = makeEl();
    global.document = {
      getElementById: (id) => (id === 'ligand-properties' ? propsEl : makeEl()),
      querySelectorAll: () => [makeEl(), makeEl()]
    };
    global.window = { addEventListener: () => {} };

    mock.method(LigandDetails.prototype, 'show', () => {});
    mock.method(SimilarLigandTable.prototype, 'load', () => {});
    mock.method(PdbEntryList.prototype, 'load', () => {});
    mock.method(PropertyCalculator, 'getProperties', async () => { throw new Error('fail'); });

    const lm = new LigandModal({});
    lm.show('BAD', 'sdf');

    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(propsEl.textContent, 'Properties unavailable');

    mock.restoreAll();
    delete global.document;
    delete global.window;
  });
});

