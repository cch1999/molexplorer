import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from './domStub.js';
import TourGuide from '../src/components/TourGuide.js';

let dom;
let tour;
let elements;

describe('TourGuide', () => {
  beforeEach(() => {
    dom = new JSDOM();
    const { document } = dom.window;
    global.document = document;
    global.window = dom.window;
    document.body = document.createElement('body');

    elements = {
      mol: document.createElement('button'),
      frag: document.createElement('input'),
      protein: document.createElement('input')
    };
    elements.mol.id = 'add-molecule-btn';
    elements.frag.id = 'fragment-search';
    elements.protein.id = 'protein-group-search';
    document.registerElement('add-molecule-btn', elements.mol);
    document.registerElement('fragment-search', elements.frag);
    document.registerElement('protein-group-search', elements.protein);

    const steps = [
      { element: elements.mol, message: 'molecule' },
      { element: elements.frag, message: 'fragment' },
      { element: elements.protein, message: 'protein' }
    ];
    tour = new TourGuide(steps);
  });

  it('advances through tutorial steps', () => {
    tour.start();
    assert.ok(elements.mol.className.includes('tour-highlight'));

    tour.handleKeyDown({ key: 'Enter', preventDefault: () => {} });
    assert.ok(elements.frag.className.includes('tour-highlight'));

    tour.next();
    assert.ok(elements.protein.className.includes('tour-highlight'));

    tour.next();
    assert.strictEqual(elements.mol.className.includes('tour-highlight'), false);
    assert.strictEqual(elements.frag.className.includes('tour-highlight'), false);
    assert.strictEqual(elements.protein.className.includes('tour-highlight'), false);
  });
});
