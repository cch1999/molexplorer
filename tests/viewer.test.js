import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import Viewer from '../src/Viewer.js';

describe('Viewer row controls', () => {
  let container, viewerObj, model, viewer, row, toggleBtn, removeBtn;

  const makeEl = () => ({
    children: [],
    className: '',
    classList: {
      classes: new Set(),
      add(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); }
    },
    style: {},
    appendChild(child) { this.children.push(child); return child; },
    removeChild(child) { const i = this.children.indexOf(child); if (i > -1) this.children.splice(i,1); },
    addEventListener(type, handler) { this['on'+type] = handler; },
    dispatchEvent(evt) { const h = this['on'+evt.type]; if (h) h(evt); },
    textContent: ''
  });

  beforeEach(() => {
    container = makeEl();
    global.document = { createElement: makeEl };
    viewerObj = { removeModel: mock.fn(), zoomTo: mock.fn(), render: mock.fn() };
    model = { setStyle: mock.fn() };
    viewer = new Viewer(viewerObj, container);
    viewer.addModel(model, 'm1');
    row = container.children[0];
    toggleBtn = row.children[1];
    removeBtn = row.children[2];
  });

  it('toggles visibility and updates styling', () => {
    toggleBtn.dispatchEvent({ type: 'click' });
    assert.deepStrictEqual(model.setStyle.mock.calls[0].arguments, [{}, {}]);
    assert.ok(row.classList.contains('model-hidden'));
    toggleBtn.dispatchEvent({ type: 'click' });
    assert.deepStrictEqual(model.setStyle.mock.calls[1].arguments, [{}, { stick: {} }]);
    assert.ok(!row.classList.contains('model-hidden'));
    assert.strictEqual(viewerObj.render.mock.callCount(), 2);
  });

  it('removes model and row then rezooms', () => {
    removeBtn.dispatchEvent({ type: 'click' });
    assert.strictEqual(viewerObj.removeModel.mock.callCount(), 1);
    assert.strictEqual(viewerObj.removeModel.mock.calls[0].arguments[0], model);
    assert.strictEqual(container.children.length, 0);
    assert.strictEqual(viewerObj.zoomTo.mock.callCount(), 1);
    assert.strictEqual(viewerObj.render.mock.callCount(), 1);
  });
});
