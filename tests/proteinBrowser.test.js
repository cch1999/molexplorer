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
