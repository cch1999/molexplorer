import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import BoundLigandTable from '../src/components/BoundLigandTable.js';

describe('BoundLigandTable', () => {
  let dom;

  beforeEach(() => {
    dom = new JSDOM();
    global.window = dom.window;
    global.document = dom.window.document;
    const addBtn = document.createElement('button');
    addBtn.id = 'add-all-bound-btn';
    document.body.appendChild(addBtn);
    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-pdb-details-modal';
    document.body.appendChild(closeBtn);
    global.showNotification = mock.fn();
  });

  afterEach(() => {
    mock.restoreAll();
    delete global.window;
    delete global.document;
    delete global.showNotification;
  });

  it('addAllLigands notifies when empty list', () => {
    const addMolecule = mock.fn();
    const table = new BoundLigandTable(addMolecule);
    table.addAllLigands([], 'bound');
    assert.strictEqual(showNotification.mock.callCount(), 1);
    assert.deepStrictEqual(showNotification.mock.calls[0].arguments, ['No bound ligands to add', 'info']);
    assert.strictEqual(addMolecule.mock.callCount(), 0);
  });

  it('addAllLigands adds each ligand and resets button', () => {
    const addMolecule = mock.fn(() => true);
    const table = new BoundLigandTable(addMolecule);
    const btn = document.getElementById('add-all-bound-btn');
    mock.timers.enable();
    table.addAllLigands(['A', 'B'], 'bound');
    assert.strictEqual(btn.disabled, true);
    assert.strictEqual(btn.textContent, 'Adding...');
    mock.timers.tick(200);
    assert.strictEqual(addMolecule.mock.callCount(), 2);
    assert.strictEqual(addMolecule.mock.calls[0].arguments[0], 'A');
    assert.strictEqual(addMolecule.mock.calls[1].arguments[0], 'B');
    assert.strictEqual(btn.disabled, false);
    assert.strictEqual(btn.textContent, 'Add All (2)');
    assert.strictEqual(showNotification.mock.callCount(), 1);
    assert.strictEqual(showNotification.mock.calls[0].arguments[0], 'Added 2 new molecules');
    mock.timers.reset();
  });

  it('createBoundLigandRow builds row with handlers', () => {
    const addMolecule = mock.fn(() => true);
    const showDetails = mock.fn();
    const ligandModal = { load2DStructure: mock.fn() };
    const table = new BoundLigandTable(addMolecule, showDetails, ligandModal);
    const ligand = {
      chem_comp_id: 'ATP',
      chain_id: 'A',
      author_residue_number: '10',
      entity_id: '1',
      chem_comp_name: 'Adenosine triphosphate'
    };
    const row = table.createBoundLigandRow(ligand);
    const cells = row.querySelectorAll('td');
    assert.strictEqual(cells.length, 7);
    assert.strictEqual(row.querySelector('.ccd-code').textContent, 'ATP');
    assert.strictEqual(row.querySelector('.ligand-name').textContent, 'Adenosine triphosphate');
    row.querySelector('.ccd-code').dispatchEvent(new window.Event('click'));
    assert.strictEqual(showDetails.mock.callCount(), 1);
    row.querySelector('.add-ligand-btn').dispatchEvent(new window.Event('click'));
    assert.strictEqual(addMolecule.mock.callCount(), 1);
    assert.strictEqual(showNotification.mock.callCount(), 1);
    assert.strictEqual(showNotification.mock.calls[0].arguments[0], 'Adding molecule ATP...');
    assert.strictEqual(ligandModal.load2DStructure.mock.callCount(), 1);
  });
});
