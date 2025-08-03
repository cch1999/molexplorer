import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import LigandModal from '../src/modal/LigandModal.js';
import LigandDetails from '../src/modal/LigandDetails.js';
import SimilarLigandTable from '../src/modal/SimilarLigandTable.js';
import PdbEntryList from '../src/modal/PdbEntryList.js';

describe('LigandModal orchestrator', () => {
  it('delegates to subcomponents', () => {
    const makeEl = () => ({ style: {}, addEventListener: () => {}, innerHTML: '', textContent: '' });
    global.document = {
      getElementById: makeEl,
      querySelectorAll: () => [makeEl(), makeEl()]
    };
    global.window = { addEventListener: () => {} };

    const showSpy = mock.method(LigandDetails.prototype, 'show', () => {});
    const loadSimilarSpy = mock.method(SimilarLigandTable.prototype, 'load', () => {});
    const load2DSpy = mock.method(SimilarLigandTable.prototype, 'load2DStructure', () => {});
    const loadPdbSpy = mock.method(PdbEntryList.prototype, 'load', () => {});

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

