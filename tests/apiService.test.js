import { describe, it, expect, vi, afterEach } from 'vitest';
import ApiService from '../apiService.js';

describe('ApiService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchText returns text on success', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('hello') });
    const result = await ApiService.fetchText('/file.txt');
    expect(result).toBe('hello');
    expect(fetch).toHaveBeenCalledWith('/file.txt');
  });

  it('fetchText throws on http error', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(ApiService.fetchText('/bad')).rejects.toThrow('HTTP error');
  });

  it('fetchJson returns parsed data', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 1 }) });
    const data = await ApiService.fetchJson('/data.json');
    expect(data).toEqual({ id: 1 });
  });

  it('getCcdSdf uppercases code and fetches', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('sdf') });
    const txt = await ApiService.getCcdSdf('atp');
    expect(fetch).toHaveBeenCalledWith('/rcsb/ligands/view/ATP_ideal.sdf');
    expect(txt).toBe('sdf');
  });
});
