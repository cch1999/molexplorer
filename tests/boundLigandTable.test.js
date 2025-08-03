import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import BoundLigandTable from '../src/components/BoundLigandTable.js';
import pdbeService from '../src/utils/api/pdbeService.js';

let dom;
let table;
let addMoleculeStub;

const setupDom = () => {
  dom = new JSDOM();
  const { document } = dom.window;
  document.createElement = (tag) => {
    const el = new Element(tag);
    el.style = {};
    el.listeners = {};
    el.addEventListener = (event, handler) => { el.listeners[event] = handler; };
    el.click = () => {
      if (typeof el.onclick === 'function') el.onclick();
      if (el.listeners['click']) el.listeners['click']();
    };
    return el;
  };
  global.window = dom.window;
  global.document = document;
  global.showNotification = mock.fn();

  const section = document.createElement('div');
  const tableEl = document.createElement('table');
  const tbody = document.createElement('tbody');
  const message = document.createElement('div');
  const addAllBtn = document.createElement('button');
  document.registerElement('bound-ligands-section', section);
  document.registerElement('bound-ligands-table', tableEl);
  document.registerElement('bound-ligands-tbody', tbody);
  document.registerElement('no-bound-ligands-message', message);
  document.registerElement('add-all-bound-btn', addAllBtn);
};

beforeEach(() => {
  setupDom();
  addMoleculeStub = mock.fn(() => true);
  table = new BoundLigandTable(addMoleculeStub, () => {}, null);
});

afterEach(() => {
  mock.restoreAll();
  delete global.showNotification;
});

describe('populateBoundLigands', () => {
  it('renders rows and binds buttons when data found', async () => {
    const ligands = [
      { chem_comp_id: 'AAA', chain_id: 'A', author_residue_number: '1', entity_id: '1', chem_comp_name: 'LigA' },
      { chem_comp_id: 'HOH', chain_id: 'B', author_residue_number: '2', entity_id: '2', chem_comp_name: 'Water' }
    ];
    mock.method(pdbeService, 'getLigandMonomers', async () => ({ '1abc': ligands }));
    const addAllSpy = mock.method(table, 'addAllLigands', () => {});

    table.populateBoundLigands('1ABC');
    await new Promise(r => setImmediate(r));

    const tbody = document.getElementById('bound-ligands-tbody');
    const addAllBtn = document.getElementById('add-all-bound-btn');

    assert.strictEqual(tbody.children.length, 1);
    assert.strictEqual(addAllBtn.style.display, 'inline-block');
    assert.strictEqual(addAllBtn.textContent, 'Add All (1)');

    const addBtn = tbody.children[0].children[6].children[0];
    addBtn.click();
    assert.strictEqual(addMoleculeStub.mock.callCount(), 1);
    assert.deepStrictEqual(showNotification.mock.calls[0].arguments, ['Adding molecule AAA...', 'success']);

    addAllBtn.onclick();
    assert.strictEqual(addAllSpy.mock.callCount(), 1);
    assert.strictEqual(addAllSpy.mock.calls[0].arguments[0].length, 1);
  });

  it('shows message when no ligands found', async () => {
    mock.method(pdbeService, 'getLigandMonomers', async () => ({ '1abc': [] }));

    table.populateBoundLigands('1ABC');
    await new Promise(r => setImmediate(r));

    const section = document.getElementById('bound-ligands-section');
    const tableEl = document.getElementById('bound-ligands-table');
    const message = document.getElementById('no-bound-ligands-message');
    const addAllBtn = document.getElementById('add-all-bound-btn');

    assert.strictEqual(section.style.display, 'block');
    assert.strictEqual(tableEl.style.display, 'none');
    assert.strictEqual(message.style.display, 'block');
    assert.strictEqual(addAllBtn.style.display, 'none');
  });

  it('handles API errors gracefully', async () => {
    mock.method(pdbeService, 'getLigandMonomers', async () => { throw new Error('fail'); });

    table.populateBoundLigands('1ABC');
    await new Promise(r => setImmediate(r));

    const message = document.getElementById('no-bound-ligands-message');
    const addAllBtn = document.getElementById('add-all-bound-btn');

    assert.strictEqual(message.textContent, 'Could not load bound ligand data.');
    assert.strictEqual(addAllBtn.style.display, 'none');
  });
});

describe('addAllLigands', () => {
  it('shows info when list empty', () => {
    table.addAllLigands([], 'bound', '1ABC');
    assert.strictEqual(showNotification.mock.callCount(), 1);
    assert.deepStrictEqual(showNotification.mock.calls[0].arguments, ['No bound ligands to add', 'info']);
  });

  it('adds ligands and reports summary', () => {
    const ligands = [
      { chem_comp_id: 'AAA', chain_id: 'A', author_residue_number: '1' },
      { chem_comp_id: 'BBB', chain_id: 'B', author_residue_number: '2' }
    ];
    let call = 0;
    addMoleculeStub.mock.mockImplementation(() => call++ === 0);
    mock.method(global, 'setTimeout', (fn) => { fn(); });

    const addAllBtn = document.getElementById('add-all-bound-btn');
    addAllBtn.textContent = 'Add All (2)';

    table.addAllLigands(ligands, 'bound', '1ABC');

    assert.strictEqual(addMoleculeStub.mock.callCount(), 2);
    assert.strictEqual(showNotification.mock.callCount(), 1);
    assert.strictEqual(showNotification.mock.calls[0].arguments[0], 'Added 1 new molecules, 1 already existed');
    assert.strictEqual(showNotification.mock.calls[0].arguments[1], 'success');
    assert.strictEqual(addAllBtn.disabled, false);
    assert.strictEqual(addAllBtn.textContent, 'Add All (2)');
  });
});
