import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import SmilesSearchModal from '../src/modal/SmilesSearchModal.js';
import ApiService from '../src/utils/apiService.js';

let dom;
let manager;

function setupDom() {
  dom = new JSDOM();
  const { document } = dom.window;
  document.createElement = (tag) => {
    const el = new Element(tag);
    el.style = {};
    el.addEventListener = () => {};
    return el;
  };
  dom.window.addEventListener = () => {};
  global.document = document;
  global.window = dom.window;
  global.showNotification = () => {};

  const modal = document.createElement('div');
  const input = document.createElement('input');
  const searchBtn = document.createElement('button');
  const results = document.createElement('div');
  const closeBtn = document.createElement('span');

  document.registerElement('smiles-search-modal', modal);
  document.registerElement('smiles-input', input);
  document.registerElement('smiles-submit-btn', searchBtn);
  document.registerElement('smiles-results', results);
  document.registerElement('close-smiles-modal', closeBtn);
}

describe('SmilesSearchModal', () => {
  beforeEach(() => {
    setupDom();
    manager = { addMolecule: mock.fn(() => true) };
  });
  afterEach(() => {
    mock.restoreAll();
    delete global.document;
    delete global.window;
    delete global.showNotification;
  });

  it('searches and adds molecules from SMILES', async () => {
    mock.method(ApiService, 'searchCcdsBySmiles', async () => [
      { id: 'PAR', score: 0.9 }
    ]);
    const modal = new SmilesSearchModal(manager);
    modal.input.value = 'CCO';
    await modal.handleSearch();
    const resEl = global.document.getElementById('smiles-results');
    const ul = resEl.children[0];
    const firstLi = ul && ul.children[0];
    assert.ok(firstLi.textContent.includes('PAR'));
    modal.handleAdd('PAR');
    assert.strictEqual(manager.addMolecule.mock.callCount(), 1);
    assert.deepStrictEqual(manager.addMolecule.mock.calls[0].arguments, ['PAR']);
  });
});
