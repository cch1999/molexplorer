import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import ApiService from '../src/utils/apiService.js';
import SimilarityGraph from '../src/components/SimilarityGraph.js';

function createFakeD3() {
  const fakeD3 = {};
  const selection = {
    handlers: {},
    append: () => selection,
    attr: () => selection,
    select: () => selection,
    selectAll: () => selection,
    data: () => selection,
    join: () => selection,
    text: () => selection,
    remove: () => selection,
    call: (fn) => { if (typeof fn === 'function') fn(selection); return selection; },
    on: function(event, handler) { this.handlers[event] = handler; if (event === 'click') fakeD3.nodeSelection = this; return this; }
  };
  const sim = {
    force: () => sim,
    on: () => sim,
    alphaTarget: () => sim,
    restart: () => sim
  };
  fakeD3.select = () => selection;
  fakeD3.forceSimulation = mock.fn(nodes => { fakeD3.simNodes = nodes; return sim; });
  fakeD3.forceLink = () => {
    const obj = { id: () => obj, distance: () => obj };
    return obj;
  };
  fakeD3.forceManyBody = () => ({ strength: () => {} });
  fakeD3.forceCenter = () => {};
  fakeD3.drag = () => {
    const beh = () => {};
    beh.on = () => beh;
    return beh;
  };
  return fakeD3;
}

describe('SimilarityGraph', () => {
  it('renders graph and handles node interactions', async () => {
    const dom = new JSDOM();
    const { document } = dom.window;
    document.body = new Element('body');
    document.createElementNS = () => ({ setAttribute: () => {} });
    global.document = document;
    global.window = dom.window;
    global.showNotification = () => {};

    const fakeD3 = createFakeD3();
    mock.method(ApiService, 'getSimilarCcds', async () => ({
      AAA: [{
        stereoisomers: [{ chem_comp_id: 'BBB' }],
        same_scaffold: [{ chem_comp_id: 'CCC' }],
        similar_ligands: [{ chem_comp_id: 'DDD' }]
      }]
    }));

    const mgr = {
      showMoleculeDetails: mock.fn(),
      addMolecule: mock.fn(() => true)
    };

    const graph = new SimilarityGraph(mgr, fakeD3);
    await graph.open('AAA');

    assert.strictEqual(ApiService.getSimilarCcds.mock.callCount(), 1);
    assert.strictEqual(fakeD3.forceSimulation.mock.callCount(), 1);
    assert.strictEqual(fakeD3.simNodes.length, 4);

    const handlers = fakeD3.nodeSelection.handlers;
    handlers.click({ preventDefault: () => {} }, { id: 'BBB' });
    assert.strictEqual(mgr.showMoleculeDetails.mock.callCount(), 1);
    assert.deepStrictEqual(mgr.showMoleculeDetails.mock.calls[0].arguments, ['BBB']);

    handlers.contextmenu({ preventDefault: () => {} }, { id: 'CCC' });
    assert.strictEqual(mgr.addMolecule.mock.callCount(), 1);
    assert.deepStrictEqual(mgr.addMolecule.mock.calls[0].arguments, ['CCC']);

    mock.restoreAll();
    delete global.document;
    delete global.window;
    delete global.showNotification;
  });
});
