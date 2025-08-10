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
    const ph4Btn = makeEl();

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
    document.registerElement('download-ph4-btn', ph4Btn);

    global.document = document;
    global.document.querySelectorAll = (sel) =>
      sel === '.pdb-instance-field' ? [pdbEl, chainEl, resEl] : [];
    global.window = { addEventListener: () => {} };

    const moleculeManager = {
        getMolecule: () => ({
          code: 'ATP',
          pdbId: '1abc',
          chainId: 'B',
          authorResidueNumber: '5'
        })
    };

    mock.method(ApiService, 'getPdbFile', async () => 'PDBDATA');

    const viewer = {
      addModel: mock.fn(),
      setStyle: mock.fn(),
      addSurface: mock.fn(),
      zoomTo: mock.fn(),
      render: mock.fn(),
      addSphere: mock.fn(),
      getModel: () => ({ selectedAtoms: () => [] }),
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
    assert.strictEqual(viewer.addSphere.mock.callCount(), 0);
    assert.strictEqual(ph4Btn.style.display, 'none');

    mock.restoreAll();
    delete global.$3Dmol;
    delete global.document;
    delete global.window;
  });

  it('detects pharmacophore features from SDF and enables download', async () => {
    const dom = new JSDOM();
    const { document } = dom.window;

    const modalEl = makeEl();
    const titleEl = makeEl();
    const codeEl = makeEl();
    const sourceEl = makeEl();
    const typeEl = makeEl();
    const structEl = makeEl();
    const viewerEl = makeEl();
    const jsonEl = makeEl();
    const ph4Btn = makeEl();

    document.registerElement('molecule-details-modal', modalEl);
    document.registerElement('details-title', titleEl);
    document.registerElement('details-code', codeEl);
    document.registerElement('details-source', sourceEl);
    document.registerElement('details-type', typeEl);
    document.registerElement('details-structure', structEl);
    document.registerElement('details-viewer-container', viewerEl);
    document.registerElement('details-json', jsonEl);
    document.registerElement('download-ph4-btn', ph4Btn);

    global.document = document;
    global.document.querySelectorAll = () => [];
    global.window = { addEventListener: () => {} };

    const model = {
      atoms: [
        { elem: 'N', bonds: [1], x: 1, y: 2, z: 3, aromatic: false },
        { elem: 'H', bonds: [0], x: 0, y: 0, z: 0 }
      ],
      selectedAtoms: () => [{ elem: 'N', bonds: [1], x: 1, y: 2, z: 3, aromatic: false }]
    };
    const viewer = {
      addModel: mock.fn(),
      setStyle: mock.fn(),
      render: mock.fn(),
      addSphere: mock.fn(),
      getModel: () => model,
      clear: () => {},
      destroy: () => {},
      zoomTo: mock.fn()
    };
    global.$3Dmol = { createViewer: () => viewer };
    mock.method(global, 'setTimeout', (fn) => { fn(); });

    const ld = new LigandDetails({});
    ld.show('AAA', 'SDFDATA');
    await new Promise(setImmediate);

    assert.strictEqual(viewer.addSphere.mock.callCount(), 1);
    assert.strictEqual(ph4Btn.style.display, 'inline-block');
    assert.strictEqual(ld.pharmacophoreFeatures.length, 1);

    mock.restoreAll();
    delete global.$3Dmol;
    delete global.document;
    delete global.window;
  });
});
