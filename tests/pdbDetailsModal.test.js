import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import PdbDetailsModal from '../src/modal/PdbDetailsModal.js';
import { JSDOM } from './domStub.js';

describe('PdbDetailsModal', () => {
  it('adds interaction legend', () => {
    const dom = new JSDOM();
    global.document = dom.window.document;
    global.window = { addEventListener: () => {} };

    const modalEl = document.createElement('div');
    document.registerElement('pdb-details-modal', modalEl);
    const closeEl = document.createElement('div');
    closeEl.addEventListener = () => {};
    document.registerElement('close-pdb-details-modal', closeEl);

    const viewerContainer = document.createElement('div');
    viewerContainer.id = 'pdb-viewer-container';
    document.registerElement('pdb-viewer-container', viewerContainer);

    const modal = new PdbDetailsModal();
    modal.addInteractionLegend(viewerContainer);

    assert.strictEqual(viewerContainer.children.length, 1);
    assert.strictEqual(viewerContainer.children[0].className, 'interaction-legend');

    delete global.document;
    delete global.window;
  });
});
