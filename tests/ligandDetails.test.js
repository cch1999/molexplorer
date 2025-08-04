import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import LigandDetails from '../src/modal/LigandDetails.js';
import ApiService from '../src/utils/apiService.js';
import { JSDOM, Element } from './domStub.js';

const makeEl = () => ({
  style: {},
  addEventListener: () => {},
  innerHTML: '',
  textContent: ''
});

describe('LigandDetails viewer focus', () => {
  it('focuses on ligand when showing PDB instance', async () => {
    const dom = new JSDOM();
    const { document } = dom.window;

    // Required elements
    const modalEl = makeEl();
    const titleEl = makeEl();
    const codeEl = makeEl();
    const sourceEl = makeEl();
    const typeEl = makeEl();
    const structEl = makeEl();
    const pdbEl = makeEl();
    const chainEl = makeEl();
    const resEl = makeEl();
    const viewerEl = makeEl();
    const jsonEl = makeEl();

    document.registerElement('molecule-details-modal', modalEl);
    document.registerElement('details-title', titleEl);
    document.registerElement('details-code', codeEl);
    document.registerElement('details-source', sourceEl);
    document.registerElement('details-type', typeEl);
    document.registerElement('details-structure', structEl);
    document.registerElement('details-pdb-id', pdbEl);
    document.registerElement('details-chain', chainEl);
    document.registerElement('details-residue', resEl);
    document.registerElement('details-viewer-container', viewerEl);
    document.registerElement('details-json', jsonEl);

    global.document = document;
    global.document.querySelectorAll = (sel) =>
      sel === '.pdb-instance-field' ? [pdbEl, chainEl, resEl] : [];
    global.window = { addEventListener: () => {} };

    const moleculeManager = {
      getMolecule: () => ({
        code: 'ATP',
        pdbId: '1abc',
        labelAsymId: 'B',
        authSeqId: '5'
      })
    };

    mock.method(ApiService, 'getPdbFile', async () => 'PDBDATA');

    const viewer = {
      addModel: mock.fn(),
      setStyle: mock.fn(),
      addSurface: mock.fn(),
      zoomTo: mock.fn(),
      render: mock.fn(),
      clear: () => {},
      destroy: () => {}
    };
    global.$3Dmol = { createViewer: mock.fn(() => viewer), SurfaceType: { MS: 'MS' } };
    mock.method(global, 'setTimeout', (fn) => { fn(); });

    const ld = new LigandDetails(moleculeManager);
    ld.show('ATP');
    await new Promise(setImmediate);

    assert.strictEqual(ApiService.getPdbFile.mock.callCount(), 1);
    assert.deepStrictEqual(ApiService.getPdbFile.mock.calls[0].arguments, ['1abc']);
    assert.strictEqual(viewer.zoomTo.mock.callCount(), 1);
    assert.deepStrictEqual(viewer.zoomTo.mock.calls[0].arguments, [{ chain: 'B', resi: 5 }]);
    assert.strictEqual(viewer.addSurface.mock.callCount(), 1);
    assert.strictEqual(viewer.addSurface.mock.calls[0].arguments[0], 'MS');
    assert.deepStrictEqual(viewer.setStyle.mock.calls[0].arguments, [{}, { cartoon: { color: 'lightgrey' } }]);

    mock.restoreAll();
    delete global.$3Dmol;
    delete global.document;
    delete global.window;
  });
});

describe('LigandDetails interaction filters', () => {
  it('renders and filters interactions by type', async () => {
    const dom = new JSDOM();
    const { document } = dom.window;

    const reg = (id, el = document.createElement('div')) => {
      el.style = {};
      document.registerElement(id, el);
      return el;
    };

    reg('molecule-details-modal');
    reg('details-title');
    reg('details-code');
    reg('details-source');
    reg('details-type');
    reg('details-structure');
    reg('details-viewer-container');
    reg('details-json');
    reg('details-pdb-id');
    reg('details-chain');
    reg('details-residue');

    const filtersEl = reg('interaction-type-filters');
    const countsEl = reg('interaction-counts');
    const tableEl = reg('interaction-summary-table', document.createElement('table'));
    const tbodyEl = document.createElement('tbody');
    document.registerElement('interaction-summary-body', tbodyEl);
    tableEl.appendChild(tbodyEl);
    reg('no-interaction-data');

    global.document = document;
    global.window = { addEventListener: () => {} };
    document.querySelectorAll = () => [];

    const interactions = [
      { type: 'hbond', residue: 'A45', distance: 2.7 },
      { type: 'hydrophobic', residue: 'B12', distance: 3.5 },
      { type: 'hbond', residue: 'A46', distance: 2.8 }
    ];
    mock.method(ApiService, 'getLigandInteractions', async () => interactions);

    const ld = new LigandDetails({ getMolecule: () => ({}) });
    await ld.loadInteractions('AAA', {});

    assert.strictEqual(tbodyEl.children.length, 3);
    assert.ok(countsEl.textContent.includes('2 Hbond'));

    ld.selectedInteractionTypes = new Set(['hydrophobic']);
    ld.renderInteractions();

    assert.strictEqual(tbodyEl.children.length, 1);
    assert.strictEqual(countsEl.textContent, '1 Hydrophobic');

    mock.restoreAll();
    delete global.document;
    delete global.window;
  });
});
