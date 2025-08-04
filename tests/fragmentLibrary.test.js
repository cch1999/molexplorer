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
  const ccd = document.createElement('input');
  document.registerElement('fragment-grid', grid);
  document.registerElement('fragment-search', search);
  document.registerElement('fragment-filter-source', source);
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

  it('addFragment missing name returns false and does not modify list', () => {
    library.fragments = [];
    library.renderFragments = () => {};
    const result = library.addFragment({ query: 'C' });
    assert.strictEqual(result, false);
    assert.strictEqual(library.fragments.length, 0);
  });

  it('addFragment missing query returns false and does not modify list', () => {
    library.fragments = [];
    library.renderFragments = () => {};
    const result = library.addFragment({ name: 'Frag' });
    assert.strictEqual(result, false);
    assert.strictEqual(library.fragments.length, 0);
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
});
