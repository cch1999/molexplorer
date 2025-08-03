import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import addAllLigands from '../src/utils/addAllLigands.js';

describe('addAllLigands utility', () => {
  it('adds ligands and reports counts', async () => {
    const ligands = [{}, {}, {}];
    let call = 0;
    const addFn = mock.fn(() => call++ === 0);
    const notifyFn = mock.fn();
    mock.method(global, 'setTimeout', (fn) => { fn(); });

    const result = await addAllLigands(ligands, addFn, notifyFn, 50);

    assert.strictEqual(addFn.mock.callCount(), 3);
    assert.deepStrictEqual(result, { added: 1, skipped: 2 });
    assert.strictEqual(notifyFn.mock.callCount(), 1);
    assert.strictEqual(notifyFn.mock.calls[0].arguments[0], 'Added 1 new molecules, 2 already existed');
    assert.strictEqual(notifyFn.mock.calls[0].arguments[1], 'success');

    mock.restoreAll();
  });
});
