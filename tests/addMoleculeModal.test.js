import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import AddMoleculeModal from '../src/modal/AddMoleculeModal.js';

let dom;
let manager;
let luckyBtn;

const setupDom = () => {
  dom = new JSDOM();
  const { document } = dom.window;
  document.createElement = (tag) => {
    const el = new Element(tag);
    el.style = {};
    el.addEventListener = () => {};
    el.focus = () => {};
    return el;
  };
  dom.window.addEventListener = () => {};
  global.window = dom.window;
  global.document = document;
  global.showNotification = mock.fn();
  dom.window.showNotification = global.showNotification;

  const modal = document.createElement('div');
  const codeInput = document.createElement('input');
  const errorText = document.createElement('p');
  const confirmBtn = document.createElement('button');
  const cancelBtn = document.createElement('button');
  const closeBtn = document.createElement('button');
  luckyBtn = document.createElement('button');
  const pdbIdInput = document.createElement('input');
  const authSeqIdInput = document.createElement('input');
  const labelAsymIdInput = document.createElement('input');
  const instanceError = document.createElement('p');

  document.registerElement('add-molecule-modal', modal);
  document.registerElement('molecule-code', codeInput);
  document.registerElement('ccd-error', errorText);
  document.registerElement('confirm-add-btn', confirmBtn);
  document.registerElement('cancel-btn', cancelBtn);
  document.registerElement('close-modal', closeBtn);
  document.registerElement('feeling-lucky-btn', luckyBtn);
  document.registerElement('pdb-id', pdbIdInput);
  document.registerElement('auth-seq-id', authSeqIdInput);
  document.registerElement('label-asym-id', labelAsymIdInput);
  document.registerElement('instance-error', instanceError);
};

describe('AddMoleculeModal lucky button', () => {
  beforeEach(() => {
    setupDom();
    manager = {
      addMolecule: mock.fn(() => true),
      getMolecule: () => null
    };
  });

  afterEach(() => {
    mock.restoreAll();
    delete global.showNotification;
  });

  it('enables lucky button and adds random molecule', async () => {
    const tsv = '\tname\tkind\tquery\tdescription\tcomment\turl\tsource\tccd\tin_ccd\n' +
      '0\tFoo\tSMILES\t\t\t\thttp://x\tPDBe\tAAA\tTrue\n' +
      '1\tBar\tSMILES\t\t\t\thttp://x\tPDBe\tBBB\tFalse\n' +
      '2\tBaz\tSMILES\t\t\t\thttp://x\tPDBe\tCCC\tTrue';
    mock.method(global, 'fetch', async () => ({ text: async () => tsv }));

    const modal = new AddMoleculeModal(manager);
    await new Promise(r => setImmediate(r));

    assert.strictEqual(luckyBtn.disabled, false);
    modal.handleLucky();

    assert.strictEqual(manager.addMolecule.mock.callCount(), 1);
    const code = manager.addMolecule.mock.calls[0].arguments[0];
    assert.ok(['AAA', 'CCC'].includes(code));
    assert.deepStrictEqual(showNotification.mock.calls[0].arguments, [`Adding molecule ${code}...`, 'success']);
  });
});

