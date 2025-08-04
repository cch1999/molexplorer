import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from './domStub.js';
import FragmentLibrary from '../src/components/FragmentLibrary.js';

let dom;
let library;

const createDom = () => {
  dom = new JSDOM();
  const { document } = dom.window;
  const grid = document.createElement('div');
  const search = document.createElement('input');
  const source = document.createElement('select');
  const sort = document.createElement('select');
  sort.value = 'name-asc';
  const ccd = document.createElement('input');
  document.registerElement('fragment-grid', grid);
  document.registerElement('fragment-search', search);
  document.registerElement('fragment-filter-source', source);
  document.registerElement('fragment-sort', sort);
  document.registerElement('ccd-toggle', ccd);
  global.window = dom.window;
  global.document = document;
};

describe('FragmentLibrary', () => {
  beforeEach(() => {
    createDom();
    const moleculeManager = {
      getMolecule: () => null,
      addMolecule: () => true,
      showMoleculeDetails: () => {}
    };
    library = new FragmentLibrary(moleculeManager, {
      notify: () => {},
      rdkit: Promise.resolve(null)
    });
    library.init();
    // Stub createFragmentCard to simplify DOM interactions
    library.createFragmentCard = (fragment) => {
      const el = document.createElement('div');
      el.textContent = fragment.name;
      return el;
    };
  });

  it('sanitizeSMILES strips invalid characters', () => {
    const input = 'C1=CC*?C1';
    const sanitized = library.sanitizeSMILES(input);
    assert.strictEqual(sanitized, 'C1=CCC1');
  });

  it('addFragment adds valid data and returns true', () => {
    library.fragments = [];
    library.renderFragments = () => {};
    const result = library.addFragment({ name: 'Frag', query: 'C', description: 'd', source: 'custom' });
    assert.strictEqual(result, true);
    assert.strictEqual(library.fragments.length, 1);
    assert.strictEqual(library.fragments[0].name, 'Frag');
  });

  it('addFragment missing name returns false, notifies, and does not modify list', () => {
    library.fragments = [];
    library.renderFragments = () => {};
    let msg = '';
    library.notify = (m) => { msg = m; };
    const result = library.addFragment({ query: 'C' });
    assert.strictEqual(result, false);
    assert.strictEqual(library.fragments.length, 0);
    assert.match(msg, /name and SMILES\/SMARTS query are required/i);
  });

  it('addFragment missing query returns false, notifies, and does not modify list', () => {
    library.fragments = [];
    library.renderFragments = () => {};
    let msg = '';
    library.notify = (m) => { msg = m; };
    const result = library.addFragment({ name: 'Frag' });
    assert.strictEqual(result, false);
    assert.strictEqual(library.fragments.length, 0);
    assert.match(msg, /name and SMILES\/SMARTS query are required/i);
  });

  it('addFragment duplicate name returns false and notifies', () => {
    library.fragments = [];
    library.renderFragments = () => {};
    let msg = '';
    library.notify = (m) => { msg = m; };
    const first = library.addFragment({ name: 'Frag', query: 'C' });
    assert.strictEqual(first, true);
    const second = library.addFragment({ name: 'Frag', query: 'N' });
    assert.strictEqual(second, false);
    assert.strictEqual(library.fragments.length, 1);
    assert.match(msg, /already exists/i);
  });

  it('renderFragments filters by search text, source filter, and CCD toggle', () => {
    library.fragments = [
      { id: '1', name: 'Alpha', source: 'custom', in_ccd: false, kind: 'OTHER', query: '' },
      { id: '2', name: 'Beta', source: 'pdb', in_ccd: true, ccd: 'BTA', kind: 'OTHER', query: '' },
      { id: '3', name: 'Gamma', source: 'pdb', in_ccd: false, kind: 'OTHER', query: '' }
    ];

    // Search filter
    library.searchInput.value = 'al';
    library.sourceFilter.value = 'all';
    library.ccdToggle.checked = false;
    library.renderFragments();
    assert.strictEqual(library.grid.children.length, 1);
    assert.match(library.grid.textContent, /Alpha/);

    // Source filter
    library.grid.innerHTML = '';
    library.searchInput.value = '';
    library.sourceFilter.value = 'custom';
    library.ccdToggle.checked = false;
    library.renderFragments();
    assert.strictEqual(library.grid.children.length, 1);
    assert.match(library.grid.textContent, /Alpha/);

    // CCD toggle
    library.grid.innerHTML = '';
    library.sourceFilter.value = 'all';
    library.ccdToggle.checked = true;
    library.renderFragments();
    assert.strictEqual(library.grid.children.length, 1);
    assert.match(library.grid.textContent, /Beta/);
  });

  it('renderFragments sorts fragments based on selected option', () => {
    library.fragments = [
      { id: '1', name: 'Beta', source: 'ENAMINE', in_ccd: false, kind: 'OTHER', query: '' },
      { id: '2', name: 'Alpha', source: 'PDBe', in_ccd: false, kind: 'OTHER', query: '' },
      { id: '3', name: 'Gamma', source: 'DSI', in_ccd: false, kind: 'OTHER', query: '' }
    ];

    library.sourceFilter.value = 'all';
    library.ccdToggle.checked = false;

    library.sortSelect.value = 'name-asc';
    library.renderFragments();
    let order = library.grid.children.map(c => c.textContent);
    assert.deepStrictEqual(order, ['Alpha', 'Beta', 'Gamma']);

    library.grid.innerHTML = '';
    library.sortSelect.value = 'name-desc';
    library.renderFragments();
    order = library.grid.children.map(c => c.textContent);
    assert.deepStrictEqual(order, ['Gamma', 'Beta', 'Alpha']);

    library.grid.innerHTML = '';
    library.sortSelect.value = 'source';
    library.renderFragments();
    order = library.grid.children.map(c => c.textContent);
    assert.deepStrictEqual(order, ['Gamma', 'Beta', 'Alpha']);
  });
});
