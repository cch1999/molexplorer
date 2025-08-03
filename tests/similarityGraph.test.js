import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from './domStub.js';
import SimilarityGraph from '../src/components/SimilarityGraph.js';
import ApiService from '../src/utils/apiService.js';

let dom;

beforeEach(() => {
  dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;
});

afterEach(() => {
  mock.restoreAll();
  delete global.window;
  delete global.document;
});

describe('SimilarityGraph rendering', () => {
  it('renders nodes and links from API data', async () => {
    mock.method(ApiService, 'getSimilarCcds', async () => ({
      AAA: [{ ccd_id: 'BBB' }, { ccd_id: 'CCC' }]
    }));
    const mm = { showMoleculeDetails: () => {}, addMolecule: () => {} };
    const graph = new SimilarityGraph(mm);
    await graph.open('AAA');
    const svg = graph.svg;
    const linkGroup = svg.children[0];
    const nodeGroup = svg.children[1];
    assert.strictEqual(linkGroup.children.length, 2);
    assert.strictEqual(nodeGroup.children.length, 3);
  });
});

describe('SimilarityGraph interactivity', () => {
  it('triggers molecule manager methods on node events', async () => {
    mock.method(ApiService, 'getSimilarCcds', async () => ({
      AAA: [{ ccd_id: 'BBB' }]
    }));
    const mm = {
      showMoleculeDetails: mock.fn(),
      addMolecule: mock.fn()
    };
    const graph = new SimilarityGraph(mm);
    await graph.open('AAA');
    const nodeGroup = graph.svg.children[1];
    const node = nodeGroup.children.find(n => n.getAttribute('data-id') === 'BBB');
    node.listeners['click'][0].call(node, {});
    node.listeners['dblclick'][0].call(node, {});
    assert.strictEqual(mm.showMoleculeDetails.mock.callCount(), 1);
    assert.deepStrictEqual(mm.showMoleculeDetails.mock.calls[0].arguments, ['BBB']);
    assert.strictEqual(mm.addMolecule.mock.callCount(), 1);
    assert.deepStrictEqual(mm.addMolecule.mock.calls[0].arguments, [{ code: 'BBB' }]);
  });
});
