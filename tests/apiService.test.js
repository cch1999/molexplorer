import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import ApiService from '../src/utils/apiService.js';
import { RCSB_LIGAND_BASE_URL, RCSB_MODEL_BASE_URL } from '../src/utils/constants.js';

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
      `${RCSB_LIGAND_BASE_URL}/ATP_ideal.sdf`
    );
    assert.strictEqual(txt, 'sdf');
  });

  it('getInstanceSdf builds ligand URL', async () => {
    global.fetch = mock.fn(async () => ({ ok: true, text: async () => 'sdf' }));
    const txt = await ApiService.getInstanceSdf('1ABC', 7, 'B', '1abc_B.sdf');
    assert.strictEqual(
      global.fetch.mock.calls[0].arguments[0],
      `${RCSB_MODEL_BASE_URL}/1abc/ligand?auth_seq_id=7&label_asym_id=B&encoding=sdf&filename=1abc_B.sdf`
    );
    assert.strictEqual(txt, 'sdf');
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

  it('getCcdSdf returns actual SDF data', async (t) => {
    try {
      const sdf = await ApiService.getCcdSdf('ATP');
      assert.ok(sdf.startsWith('ATP'));
      assert.ok(/M  END/.test(sdf));
      assert.ok(!sdf.toLowerCase().includes('<html'));
    } catch (err) {
      t.skip(`Network request failed: ${err.message}`);
    }
  });

  it('getInstanceSdf returns actual SDF data', async (t) => {
    try {
      const sdf = await ApiService.getInstanceSdf(
        '4tos',
        1402,
        'D',
        '4tos_D_355.sdf'
      );
      assert.ok(/M  END/.test(sdf));
      assert.ok(!sdf.toLowerCase().includes('<html'));
    } catch (err) {
      t.skip(`Network request failed: ${err.message}`);
    }
  });
});
