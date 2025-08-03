import { describe, it, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import ProteinBrowser from '../src/components/ProteinBrowser.js';
import ApiService from '../src/utils/apiService.js';

describe('ProteinBrowser.fetchMemberDetails', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  it('fetches member details concurrently', async () => {
    const ids = ['1ABC', '2DEF', '3GHI'];
    let inFlight = 0;
    let maxInFlight = 0;
    mock.method(ApiService, 'getRcsbEntry', (pdbId) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      return new Promise((resolve) => {
        setImmediate(() => {
          inFlight--;
          resolve({ rcsb_id: pdbId });
        });
      });
    });

    const browser = new ProteinBrowser(null);
    const results = await browser.fetchMemberDetails(ids);

    assert.strictEqual(maxInFlight, ids.length);
    assert.deepStrictEqual(results.map(r => r.rcsb_id), ids);
  });

  it('returns error objects for failed fetches', async () => {
    const ids = ['1ABC', '2DEF', '3GHI'];
    mock.method(ApiService, 'getRcsbEntry', (pdbId) => {
      if (pdbId === '2DEF') {
        return Promise.reject(new Error('fail'));
      }
      return Promise.resolve({ rcsb_id: pdbId });
    });

    const browser = new ProteinBrowser(null);
    const results = await browser.fetchMemberDetails(ids);

    assert.deepStrictEqual(results, [
      { rcsb_id: '1ABC' },
      { rcsb_id: '2DEF', error: 'Failed to fetch details' },
      { rcsb_id: '3GHI' }
    ]);
  });
});
