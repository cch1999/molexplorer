import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import DftDataViewer from '../src/components/DftDataViewer.js';
import ApiService from '../src/utils/apiService.js';

let dom;

const setupDom = () => {
  dom = new JSDOM();
  const { document } = dom.window;
  document.createElement = (tag) => {
    const el = new Element(tag);
    el.style = {};
    return el;
  };
  global.window = dom.window;
  global.document = document;
  const section = document.createElement('div');
  const tbody = document.createElement('tbody');
  document.registerElement('dft-data-section', section);
  document.registerElement('dft-data-tbody', tbody);
};

describe('DftDataViewer', () => {
  beforeEach(() => {
    setupDom();
  });

  afterEach(() => {
    mock.restoreAll();
    delete global.document;
    delete global.window;
  });

  it('renders rows for DFT properties', async () => {
    const data = { energy: -10.5, gap: 2.1 };
    mock.method(ApiService, 'getDftData', async () => data);
    const viewer = new DftDataViewer();
    await viewer.show('AAA');
    const section = document.getElementById('dft-data-section');
    const tbody = document.getElementById('dft-data-tbody');
    assert.strictEqual(section.style.display, 'block');
    assert.strictEqual(tbody.children.length, 2);
    assert.strictEqual(tbody.children[0].children[0].textContent, 'energy');
    assert.strictEqual(tbody.children[0].children[1].textContent, '-10.5');
  });

  it('hides section when fetch fails', async () => {
    mock.method(ApiService, 'getDftData', async () => { throw new Error('oops'); });
    const viewer = new DftDataViewer();
    await viewer.show('AAA');
    const section = document.getElementById('dft-data-section');
    assert.strictEqual(section.style.display, 'none');
  });
});
