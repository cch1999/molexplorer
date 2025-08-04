import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import ApiService from '../src/utils/apiService.js';
import {
  RCSB_LIGAND_BASE_URL,
  RCSB_MODEL_BASE_URL,
  UNIPROT_ENTRY_BASE_URL
} from '../src/utils/constants.js';

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

  it('fetchText throws error with status and url', async () => {
    global.fetch = mock.fn(async () => ({ ok: false, status: 500 }));
    await assert.rejects(
      () => ApiService.fetchText('/bad'),
      (err) => {
        assert.strictEqual(err.status, 500);
        assert.strictEqual(err.url, '/bad');
        assert.match(err.message, /HTTP error/);
        return true;
      }
    );
  });

  it('fetchJson returns parsed data', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => ({ id: 1 }) }));
    const data = await ApiService.fetchJson('/data.json');
    assert.deepStrictEqual(data, { id: 1 });
  });

  it('fetchJson propagates errors with status and url', async () => {
    global.fetch = mock.fn(async () => ({ ok: false, status: 404 }));
    await assert.rejects(
      () => ApiService.fetchJson('/missing.json'),
      (err) => {
        assert.strictEqual(err.status, 404);
        assert.strictEqual(err.url, '/missing.json');
        assert.match(err.message, /HTTP error/);
        return true;
      }
    );
  });

  it('getCcdSdf uppercases code and fetches', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, text: async () => 'sdf' }));
    const txt = await ApiService.getCcdSdf('atp');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      `${RCSB_LIGAND_BASE_URL}/ATP_ideal.sdf`
    );
    assert.strictEqual(txt, 'sdf');
  });

  it('getInstanceSdf builds ligand URL', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, text: async () => 'sdf' }));
    const txt = await ApiService.getInstanceSdf('1abc', 7, 'B');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      `${RCSB_MODEL_BASE_URL}/1ABC/ligand?auth_seq_id=7&label_asym_id=B&encoding=sdf`
    );
    assert.strictEqual(txt, 'sdf');
  });

  it('getPdbEntriesForUniprot parses PDB ids', async () => {
    const mockData = {
      uniProtKBCrossReferences: [
        { database: 'PDB', id: '1ABC' },
        { database: 'Other', id: 'XYZ' }
      ]
    };
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => mockData }));
    const ids = await ApiService.getPdbEntriesForUniprot('P12345');
    assert.deepStrictEqual(ids, ['1ABC']);
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      `${UNIPROT_ENTRY_BASE_URL}/P12345.json`
    );
  });

  it('getPdbEntriesForUniprot uppercases accessions', async () => {
    const mockData = { uniProtKBCrossReferences: [] };
    global.fetch = mock.fn(async () => ({ ok: true, json: async () => mockData }));
    await ApiService.getPdbEntriesForUniprot('p12345');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      `${UNIPROT_ENTRY_BASE_URL}/P12345.json`
    );
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
