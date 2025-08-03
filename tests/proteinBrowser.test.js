import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import ProteinBrowser from '../src/components/ProteinBrowser.js';
import ApiService from '../src/utils/apiService.js';

let browser;
let dom;

const setupDom = () => {
  dom = new JSDOM();
  const { document } = dom.window;
  document.createElement = (tag) => {
    const el = new Element(tag);
    el.style = {};
    el.listeners = {};
    el.addEventListener = (evt, handler) => { el.listeners[evt] = handler; };
    el.click = () => {
      if (el.listeners['click']) el.listeners['click']();
    };
    return el;
  };
  global.window = dom.window;
  global.document = document;

  // required DOM elements
  const searchBtn = document.createElement('button');
  const searchInput = document.createElement('input');
  const suggestedDropdown = document.createElement('select');
  const suggestions = document.createElement('ul');
  const resultsContainer = document.createElement('div');
  const resultsBody = document.createElement('tbody');
  const loadingIndicator = document.createElement('div');
  const noResultsMessage = document.createElement('div');
  const hideAidsToggle = document.createElement('input');

  document.registerElement('protein-group-search-btn', searchBtn);
  document.registerElement('protein-group-search', searchInput);
  document.registerElement('suggested-groups-dropdown', suggestedDropdown);
  document.registerElement('protein-group-suggestions', suggestions);
  document.registerElement('protein-results-table-container', resultsContainer);
  document.registerElement('protein-results-tbody', resultsBody);
  document.registerElement('protein-loading-indicator', loadingIndicator);
  document.registerElement('no-protein-results-message', noResultsMessage);
  document.registerElement('hide-aids-toggle', hideAidsToggle);

  return document;
};

beforeEach(() => {
  const document = setupDom();
  // immediate timers for debounce
  mock.method(global, 'setTimeout', (fn) => { fn(); });
  browser = new ProteinBrowser({});
  browser.init();
});

afterEach(() => {
  mock.restoreAll();
  delete global.window;
  delete global.document;
});

describe('ProteinBrowser suggestions', () => {
  it('shows suggestions and loads group on selection', async () => {
    const suggestionsData = { result_set: [ { identifier: 'G_1002155' }, { identifier: 'G_1002003' } ] };
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => suggestionsData }));
    mock.method(ApiService, 'getProteinGroup', async () => ({
      rcsb_group_container_identifiers: { group_member_ids: ['1ABC'] }
    }));
    mock.method(browser, 'fetchMemberDetails', async () => [{ rcsb_id: '1ABC' }]);
    const displaySpy = mock.method(browser, 'displayResults', () => {});

    const input = document.getElementById('protein-group-search');
    input.value = 'G_1002';
    input.listeners['input']();
    await new Promise(r => setImmediate(r));

    const suggestionList = document.getElementById('protein-group-suggestions');
    assert.strictEqual(suggestionList.children.length, 2);

    suggestionList.children[0].click();
    await new Promise(r => setImmediate(r));

    assert.strictEqual(ApiService.getProteinGroup.mock.callCount(), 1);
    assert.strictEqual(ApiService.getProteinGroup.mock.calls[0].arguments[0], 'G_1002155');
    assert.strictEqual(displaySpy.mock.callCount(), 1);
  });
});

