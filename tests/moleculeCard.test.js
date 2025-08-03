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
});

describe('MoleculeCard filterMolecules', () => {
  it('shows matching cards and hides others', () => {
    const grid = new Element('div');
    const cardA = new Element('div');
    cardA.className = 'molecule-card';
    cardA.dataset.moleculeCode = 'ATP';
    cardA.dataset.moleculeName = 'Adenosine';
    cardA.style = {};
    const cardB = new Element('div');
    cardB.className = 'molecule-card';
    cardB.dataset.moleculeCode = 'GTP';
    cardB.dataset.moleculeName = 'Guanosine';
    cardB.style = {};
    grid.appendChild(cardA);
    grid.appendChild(cardB);

    const ui = new MoleculeCard(grid, {});

    ui.filterMolecules('atp');
    assert.strictEqual(cardA.style.display, '');
    assert.strictEqual(cardB.style.display, 'none');

    ui.filterMolecules('');
    assert.strictEqual(cardA.style.display, '');
    assert.strictEqual(cardB.style.display, '');
  });
});
