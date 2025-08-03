import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import AddMoleculeModal from '../src/modal/AddMoleculeModal.js';
import ApiService from '../src/utils/apiService.js';

const makeEl = () => new Element('div');

describe('AddMoleculeModal CCD suggestions', () => {
  it('populates datalist with API results', async () => {
    const dom = new JSDOM();
    const { document } = dom.window;
    document.body = new Element('body');
    global.window = dom.window;
    global.window.addEventListener = () => {};
    global.document = document;

    // Stub required elements
    const modalEl = makeEl();
    const inputEl = new Element('input');
    const errorEl = makeEl();
    const confirmEl = makeEl();
    const cancelEl = makeEl();
    const closeEl = makeEl();
    const luckyEl = makeEl();

    document.registerElement('add-molecule-modal', modalEl);
    document.registerElement('molecule-code', inputEl);
    document.registerElement('ccd-error', errorEl);
    document.registerElement('confirm-add-btn', confirmEl);
    document.registerElement('cancel-btn', cancelEl);
    document.registerElement('close-modal', closeEl);
    document.registerElement('feeling-lucky-btn', luckyEl);

    const amm = new AddMoleculeModal({});

    mock.method(ApiService, 'searchCcdCodes', async () => ['ATP', 'ATN']);

    inputEl.value = 'AT';
    await amm.handleInput();

    assert.strictEqual(amm.suggestionsList.children.length, 2);
    assert.strictEqual(luckyEl.disabled, false);

    mock.restoreAll();
    delete global.document;
    delete global.window;
  });
});
