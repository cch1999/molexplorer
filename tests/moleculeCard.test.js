import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import MoleculeCard from '../src/components/MoleculeCard.js';
import rcsbService from '../src/utils/api/rcsbService.js';

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
    mock.method(rcsbService, 'getCcdSdf', async () => 'sdfdata');

    await card.downloadSdf('AAA');

    assert.strictEqual(rcsbService.getCcdSdf.mock.callCount(), 1);
    assert.strictEqual(createdAnchor.download, 'AAA.sdf');
    assert.strictEqual(createdAnchor.click.mock.callCount(), 1);
    assert.strictEqual(global.document.body.children.length, 0);
    assert.strictEqual(URL.revokeObjectURL.mock.callCount(), 1);
  });
});
