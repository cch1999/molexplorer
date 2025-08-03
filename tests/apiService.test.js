import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import ApiService from '../src/utils/apiService.js';

describe('ApiService', () => {
  afterEach(() => {
    mock.restoreAll();
    ApiService.clearCache();
  });

  it('fetchText returns text on success', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, text: async () => 'hello' }));
    const result = await ApiService.fetchText('/file.txt');
    assert.strictEqual(result, 'hello');
    assert.strictEqual(global.fetch.mock.calls[0].arguments[0], '/file.txt');
  });

  it('fetchText throws on http error', async () => {
    global.fetch = mock.fn(async () => ({ ok: false, status: 500 }));
    await assert.rejects(() => ApiService.fetchText('/bad'), /HTTP error/);
  });

  it('fetchJson returns parsed data', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => ({ id: 1 }) }));
    const data = await ApiService.fetchJson('/data.json');
    assert.deepStrictEqual(data, { id: 1 });
  });

  it('getCcdSdf uppercases code and fetches', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, text: async () => 'sdf' }));
    const txt = await ApiService.getCcdSdf('atp');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      'https://files.rcsb.org/ligands/view/ATP_ideal.sdf'
    );
    assert.strictEqual(txt, 'sdf');
  });

  it('getFragmentLibraryTsv fetches expected URL and returns text', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, text: async () => 'tsv' }));
    const txt = await ApiService.getFragmentLibraryTsv();
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      'https://raw.githubusercontent.com/cch1999/cch1999.github.io/refs/heads/new_website/assets/files/fragment_library_ccd.tsv'
    );
    assert.strictEqual(txt, 'tsv');
  });

  it('getSimilarCcds calls expected URL and returns JSON', async () => {
    const mockResponse = { ATP: [] };
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => mockResponse }));
    const data = await ApiService.getSimilarCcds('ATP');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      'https://www.ebi.ac.uk/pdbe/graph-api/compound/similarity/ATP'
    );
    assert.deepStrictEqual(data, mockResponse);
  });

  it('getPdbEntriesForCcd calls expected URL and returns JSON', async () => {
    const mockResponse = { ATP: ['1ABC'] };
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => mockResponse }));
    const data = await ApiService.getPdbEntriesForCcd('ATP');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      'https://www.ebi.ac.uk/pdbe/graph-api/compound/in_pdb/ATP'
    );
    assert.deepStrictEqual(data, mockResponse);
  });

  it('getRcsbEntry lowercases code and returns JSON', async () => {
    const mockResponse = { rcsb_id: '1abc' };
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => mockResponse }));
    const data = await ApiService.getRcsbEntry('1ABC');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      'https://data.rcsb.org/rest/v1/core/entry/1abc'
    );
    assert.deepStrictEqual(data, mockResponse);
  });

  it('getPdbSummary calls expected URL and returns JSON', async () => {
    const mockResponse = { '1abc': [] };
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => mockResponse }));
    const data = await ApiService.getPdbSummary('1abc');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      'https://www.ebi.ac.uk/pdbe/graph-api/pdb/summary/1abc'
    );
    assert.deepStrictEqual(data, mockResponse);
  });

  it('getPdbFile fetches expected URL and returns text', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, text: async () => 'pdb' }));
    const txt = await ApiService.getPdbFile('1ABC');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      'https://files.rcsb.org/download/1ABC.pdb'
    );
    assert.strictEqual(txt, 'pdb');
  });

  it('getLigandMonomers calls expected URL and returns JSON', async () => {
    const mockResponse = { '1abc': [] };
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => mockResponse }));
    const data = await ApiService.getLigandMonomers('1abc');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      'https://www.ebi.ac.uk/pdbe/api/pdb/entry/ligand_monomers/1abc'
    );
    assert.deepStrictEqual(data, mockResponse);
  });

  it('getProteinGroup calls expected URL and returns JSON', async () => {
    const mockResponse = { group_id: 'G_1' };
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => mockResponse }));
    const data = await ApiService.getProteinGroup('G_1');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      'https://data.rcsb.org/rest/v1/core/entry_groups/G_1'
    );
    assert.deepStrictEqual(data, mockResponse);
  });

  it('getPdbSummary throws on non-ok response', async () => {
    global.fetch = mock.fn(async () => ({ ok: false, status: 404 }));
    await assert.rejects(() => ApiService.getPdbSummary('1abc'), /HTTP error/);
  });

  it('fetchText caches responses', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, text: async () => 'cached' }));
    const first = await ApiService.fetchText('/file.txt');
    const second = await ApiService.fetchText('/file.txt');
    assert.strictEqual(first, 'cached');
    assert.strictEqual(second, 'cached');
    assert.strictEqual(global.fetch.mock.callCount(), 1);
  });

  it('clearCache forces refetch', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, text: async () => 'again' }));
    await ApiService.fetchText('/file.txt');
    ApiService.clearCache();
    await ApiService.fetchText('/file.txt');
    assert.strictEqual(global.fetch.mock.callCount(), 2);
  });
});
