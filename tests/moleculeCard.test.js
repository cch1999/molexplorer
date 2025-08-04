import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import MoleculeCard from '../src/components/MoleculeCard.js';
import ApiService from '../src/utils/apiService.js';

describe('MoleculeCard downloadSdf', () => {
  let dom, card, createdAnchor;

  beforeEach(() => {
    dom = new JSDOM();
    const { document } = dom.window;
    document.body = new Element('body');
    document.body.removeChild = function(child) {
      const idx = this.children.indexOf(child);
      if (idx > -1) this.children.splice(idx, 1);
      return child;
    };
    global.window = dom.window;
    global.document = document;

    const originalCreate = document.createElement.bind(document);
    document.createElement = (tag) => {
      const el = originalCreate(tag);
      if (tag === 'a') {
        el.click = mock.fn();
        createdAnchor = el;
      }
      return el;
    };

    mock.method(global.URL, 'createObjectURL', () => 'blob:url');
    mock.method(global.URL, 'revokeObjectURL', () => {});

    card = new MoleculeCard(new Element('div'), {});
  });

  afterEach(() => {
    mock.restoreAll();
  });

  it('fetches SDF and triggers file download', async () => {
    mock.method(ApiService, 'getCcdSdf', async () => 'sdfdata');

    await card.downloadSdf('AAA');

    assert.strictEqual(ApiService.getCcdSdf.mock.callCount(), 1);
    assert.strictEqual(createdAnchor.download, 'AAA.sdf');
    assert.strictEqual(createdAnchor.click.mock.callCount(), 1);
    assert.strictEqual(global.document.body.children.length, 0);
    assert.strictEqual(URL.revokeObjectURL.mock.callCount(), 1);
  });

  it('downloads instance SDF with proper filename via blob', async () => {
    mock.method(ApiService, 'getInstanceSdf', () => 'http://inst.sdf');
    mock.method(ApiService, 'fetchText', async () => 'instdata');
    const info = { pdbId: '1ABC', authSeqId: 7, labelAsymId: 'B' };
    await card.downloadSdf('LIG', undefined, info);
    assert.strictEqual(ApiService.getInstanceSdf.mock.callCount(), 1);
    assert.strictEqual(ApiService.fetchText.mock.callCount(), 1);
    assert.strictEqual(createdAnchor.href, 'blob:url');
    assert.strictEqual(createdAnchor.download, '1abc_b_lig.sdf');
    assert.strictEqual(createdAnchor.click.mock.callCount(), 1);
  });
});

describe('MoleculeCard compare button', () => {
  it('adds a compare button and triggers callback on click', () => {
    const makeEl = () => ({
      style: {},
      children: [],
      appendChild(child) { this.children.push(child); return child; },
      setAttribute: () => {},
      addEventListener(type, handler) { this['on' + type] = handler; },
      dispatchEvent(evt) { const h = this['on' + evt.type]; if (h) h(evt); },
      innerHTML: '',
      textContent: '',
      className: ''
    });

    global.document = { createElement: makeEl };
    global.window = {};
    global.$3Dmol = { createViewer: () => ({ addModel: () => {}, setStyle: () => {}, render: () => {}, zoomTo: () => {} }) };
    const originalTimeout = global.setTimeout;
    global.setTimeout = (fn) => { fn(); };

    const grid = makeEl();
    const onCompare = mock.fn();
    const cardUI = new MoleculeCard(grid, {}, { onCompare });
    cardUI.createMoleculeCard('sdf', 'AAA');
    const card = grid.children[0];
    const compareBtn = card.children.find(c => c.className === 'compare-btn');
    assert.ok(compareBtn);
    compareBtn.dispatchEvent({ type: 'click', stopPropagation: () => {} });
    assert.strictEqual(onCompare.mock.callCount(), 1);
    assert.strictEqual(onCompare.mock.calls[0].arguments[0], 'AAA');

    global.setTimeout = originalTimeout;
    delete global.$3Dmol;
    delete global.document;
    delete global.window;
  });
});
