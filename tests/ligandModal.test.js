import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import LigandDetails from '../src/modal/LigandDetails.js';
import SimilarLigandTable from '../src/modal/SimilarLigandTable.js';
import PdbEntryList from '../src/modal/PdbEntryList.js';
import PropertyCalculator from '../src/utils/propertyCalculator.js';

const makeEl = () => ({ style: {}, addEventListener: () => {}, innerHTML: '', textContent: '' });

describe('LigandModal orchestrator', () => {
  it('delegates to subcomponents and loads viewer', async () => {
    const propsEl = makeEl();
    const viewerEl = makeEl();
    const rotBtn = makeEl();
    const zoomBtn = makeEl();
    const resetBtn = makeEl();

    global.document = {
      getElementById: (id) => {
        switch (id) {
          case 'ligand-properties':
            return propsEl;
          case 'details-viewer-container':
            return viewerEl;
          case 'ligand-rotate-btn':
            return rotBtn;
          case 'ligand-zoom-btn':
            return zoomBtn;
          case 'ligand-reset-btn':
            return resetBtn;
          default:
            return makeEl();
        }
      },
      querySelectorAll: () => [makeEl(), makeEl()]
    };
    global.window = { addEventListener: () => {} };

    const loadSpy = mock.fn();
    class StubViewer {
      loadSDF = loadSpy;
      toggleRotate() {}
      zoom() {}
      reset() {}
    }
    const { default: LigandModal } = await import('../src/modal/LigandModal.js');

    const showSpy = mock.method(LigandDetails.prototype, 'show', () => {});
    const loadSimilarSpy = mock.method(SimilarLigandTable.prototype, 'load', () => {});
    const load2DSpy = mock.method(SimilarLigandTable.prototype, 'load2DStructure', () => {});
    const loadPdbSpy = mock.method(PdbEntryList.prototype, 'load', () => {});
    mock.method(PropertyCalculator, 'getProperties', async () => null);

    const lm = new LigandModal({}, StubViewer);
    lm.show('ATP', 'sdfdata');
    lm.load2DStructure('ATP', 'container');

    assert.strictEqual(loadSpy.mock.callCount(), 1);
    assert.deepStrictEqual(loadSpy.mock.calls[0].arguments, ['sdfdata']);
    assert.strictEqual(showSpy.mock.callCount(), 1);
    assert.deepStrictEqual(showSpy.mock.calls[0].arguments, ['ATP', 'sdfdata']);
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
  it('displays fetched properties', async () => {
    const propsEl = makeEl();
    const viewerEl = makeEl();
    const rotBtn = makeEl();
    const zoomBtn = makeEl();
    const resetBtn = makeEl();

    global.document = {
      getElementById: (id) => {
        switch (id) {
          case 'ligand-properties':
            return propsEl;
          case 'details-viewer-container':
            return viewerEl;
          case 'ligand-rotate-btn':
            return rotBtn;
          case 'ligand-zoom-btn':
            return zoomBtn;
          case 'ligand-reset-btn':
            return resetBtn;
          default:
            return makeEl();
        }
      },
      querySelectorAll: () => [makeEl(), makeEl()]
    };
    global.window = { addEventListener: () => {} };

    class StubViewer2 {
      loadSDF() {}
      toggleRotate() {}
      zoom() {}
      reset() {}
    }
    const { default: LigandModal } = await import('../src/modal/LigandModal.js');

    mock.method(LigandDetails.prototype, 'show', () => {});
    mock.method(SimilarLigandTable.prototype, 'load', () => {});
    mock.method(PdbEntryList.prototype, 'load', () => {});
    mock.method(PropertyCalculator, 'getProperties', async () => ({ molecularWeight: 55, formula: 'C2H6O' }));

    const lm = new LigandModal({}, StubViewer2);
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
    const viewerEl = makeEl();
    const rotBtn = makeEl();
    const zoomBtn = makeEl();
    const resetBtn = makeEl();

    global.document = {
      getElementById: (id) => {
        switch (id) {
          case 'ligand-properties':
            return propsEl;
          case 'details-viewer-container':
            return viewerEl;
          case 'ligand-rotate-btn':
            return rotBtn;
          case 'ligand-zoom-btn':
            return zoomBtn;
          case 'ligand-reset-btn':
            return resetBtn;
          default:
            return makeEl();
        }
      },
      querySelectorAll: () => [makeEl(), makeEl()]
    };
    global.window = { addEventListener: () => {} };

    class StubViewer3 {
      loadSDF() {}
      toggleRotate() {}
      zoom() {}
      reset() {}
    }
    const { default: LigandModal } = await import('../src/modal/LigandModal.js');

    mock.method(LigandDetails.prototype, 'show', () => {});
    mock.method(SimilarLigandTable.prototype, 'load', () => {});
    mock.method(PdbEntryList.prototype, 'load', () => {});
    mock.method(PropertyCalculator, 'getProperties', async () => { throw new Error('fail'); });

    const lm = new LigandModal({}, StubViewer3);
    lm.show('BAD', 'sdf');

    await Promise.resolve();
    await Promise.resolve();
    assert.strictEqual(propsEl.textContent, 'Properties unavailable');

    mock.restoreAll();
    delete global.document;
    delete global.window;
  });
});
