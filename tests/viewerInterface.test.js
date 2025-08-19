import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import ViewerInterface from '../src/components/ViewerInterface.js';
import { JSDOM } from './domStub.js';

const makeEl = () => ({
  style: {},
  addEventListener: () => {},
  innerHTML: '',
  textContent: '',
  value: '',
  checked: false,
  getBoundingClientRect: () => ({ top: 0 })
});

describe('ViewerInterface interactions', () => {
  it('shows sidechain sticks for interacting residues', () => {
    const dom = new JSDOM();
    const { document } = dom.window;

    const viewerContainer = makeEl();
    document.registerElement('viewer-container', viewerContainer);
    document.registerElement('viewer-pdb-id', makeEl());
    document.registerElement('viewer-load-btn', makeEl());
    document.registerElement('viewer-cartoon', { ...makeEl(), checked: false });
    document.registerElement('viewer-sticks', { ...makeEl(), checked: false });
    document.registerElement('viewer-surface', makeEl());
    document.registerElement('viewer-surface-opacity', { ...makeEl(), value: 0.5 });
    document.registerElement('viewer-color-scheme', { ...makeEl(), value: 'chain' });
    document.registerElement('viewer-hide-solvent', { ...makeEl(), checked: false });
    document.registerElement('viewer-hide-ions', { ...makeEl(), checked: false });
    document.registerElement('viewer-zoom-ligands', makeEl());
    document.registerElement('viewer-reset-view', makeEl());
    document.registerElement('viewer-spin', makeEl());
    document.registerElement('viewer-show-interactions', makeEl());
    document.registerElement('viewer-interface-content', makeEl());

    global.document = document;
    global.window = { addEventListener: () => {}, removeEventListener: () => {} };

    const vi = new ViewerInterface().init();

    const viewer = {
      setStyle: mock.fn(),
      removeAllSurfaces: mock.fn(),
      render: mock.fn(),
      resize: mock.fn()
    };

    vi.viewer = viewer;

    vi.showInteractingSidechains();

    assert.strictEqual(viewer.setStyle.mock.callCount(), 2);
    const [sel, style] = viewer.setStyle.mock.calls[1].arguments;
    assert.deepStrictEqual(sel.within, { distance: 5, sel: { hetflag: true } });
    assert.strictEqual(sel.byres, true);
    assert.deepStrictEqual(sel.not, { atom: ['N', 'CA', 'C', 'O', 'OXT'] });
    assert.deepStrictEqual(style, { stick: { colorscheme: 'element' } });

    mock.restoreAll();
    delete global.document;
    delete global.window;
  });
});

