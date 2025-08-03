import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import ApiService from '../apiService.js';

describe('ApiService', () => {
  afterEach(() => {
    mock.restoreAll();
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
    assert.strictEqual(global.fetch.mock.calls[0].arguments[0], '/rcsb/ligands/view/ATP_ideal.sdf');
    assert.strictEqual(txt, 'sdf');
  });
});
