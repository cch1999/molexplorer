import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import ProteinBrowser from '../src/components/ProteinBrowser.js';
import ApiService from '../src/utils/apiService.js';

describe('fetchMemberDetails', () => {
  it('uses offset and limit to fetch batches of IDs', async () => {
    const pdbIds = Array.from({ length: 50 }, (_, i) => `ID${i}`);
    mock.method(ApiService, 'getRcsbEntry', async id => ({ rcsb_id: id }));
    const browser = new ProteinBrowser({});
    const result = await browser.fetchMemberDetails(pdbIds, 10, 20);
    assert.strictEqual(result.length, 10);
    assert.deepStrictEqual(result.map(r => r.rcsb_id), pdbIds.slice(20, 30));
  });
});

describe('displayResults', () => {
  it('renders citation link when publication data available', async () => {
    const rowStub = {
      innerHTML: '',
      querySelector: () => ({ addEventListener: () => {}, dataset: {} }),
      querySelectorAll: () => []
    };
    const browser = new ProteinBrowser({});
    browser.resultsBody = {
      innerHTML: '',
      insertRow: () => rowStub
    };
    browser.hideAidsToggle = { checked: false };
    browser.resultsContainer = { style: {} };
    browser.noResultsMessage = { style: {}, textContent: '' };
    mock.method(browser, 'fetchBoundLigands', async () => []);

    const details = [{
      rcsb_id: '1ABC',
      struct: { title: 'Structure' },
      rcsb_entry_info: { resolution_combined: [1.5] },
      rcsb_accession_info: { initial_release_date: '2024-01-01' },
      rcsb_primary_citation: { title: 'The Paper', pdbx_database_id_doi: '10.1000/xyz' }
    }];

    await browser.displayResults(details);

    assert.ok(rowStub.innerHTML.includes('The Paper'));
    assert.ok(rowStub.innerHTML.includes('doi.org/10.1000/xyz'));
  });
});

describe('search input Enter key', () => {
  it('triggers fetch on Enter key press', () => {
    const searchInput = {
      value: 'G_123',
      addEventListener(type, handler) { this['on' + type] = handler; },
      blur: mock.fn()
    };
    const searchBtn = { addEventListener: () => {} };
    global.document = {
      getElementById: (id) => {
        if (id === 'protein-group-search') return searchInput;
        if (id === 'protein-group-search-btn') return searchBtn;
        return null;
      }
    };
    const browser = new ProteinBrowser({});
    mock.method(browser, 'fetchProteinEntries', () => {});
    browser.init();
    const preventDefault = mock.fn();
    searchInput.onkeydown({ key: 'Enter', preventDefault });
    assert.strictEqual(browser.fetchProteinEntries.mock.callCount(), 1);
    assert.deepStrictEqual(browser.fetchProteinEntries.mock.calls[0].arguments, ['G_123']);
    assert.strictEqual(preventDefault.mock.callCount(), 1);
    assert.strictEqual(searchInput.blur.mock.callCount(), 1);
    delete global.document;
  });
});
