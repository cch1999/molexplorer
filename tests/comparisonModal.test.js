import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import ComparisonModal from '../src/modal/ComparisonModal.js';

describe('ComparisonModal', () => {
  it('renders two molecules and aligns them', () => {
    const makeEl = () => ({
      style: {},
      innerHTML: '',
      textContent: '',
      children: [],
      appendChild(child) { this.children.push(child); },
      addEventListener: () => {}
    });

    const modalEl = makeEl();
    const viewerEl = makeEl();
    const titleEl = makeEl();
    const closeEl = makeEl();

    global.document = {
      getElementById: (id) => {
        if (id === 'comparison-modal') return modalEl;
        if (id === 'comparison-viewer') return viewerEl;
        if (id === 'comparison-title') return titleEl;
        if (id === 'close-comparison-modal') return closeEl;
        return null;
      }
    };
    global.window = { addEventListener: () => {} };

      const model1Atoms = [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }];
      const model2Atoms = [{ x: 1, y: 1, z: 1 }, { x: 2, y: 2, z: 2 }];
      const model1 = { setStyle: mock.fn(), selectedAtoms: () => model1Atoms };
      const model2 = { setStyle: mock.fn(), selectedAtoms: () => model2Atoms };
      let call = 0;
      const viewer = {
        addModel: mock.fn(() => (call++ === 0 ? model1 : model2)),
        zoomTo: mock.fn(),
        render: mock.fn()
      };

      global.$3Dmol = { createViewer: mock.fn(() => viewer) };

      const originalTimeout = global.setTimeout;
      global.setTimeout = (fn) => { fn(); };

      const modal = new ComparisonModal();
      modal.show({ code: 'AAA', sdf: 'sdf1' }, { code: 'BBB', sdf: 'sdf2' });

      global.setTimeout = originalTimeout;

      assert.strictEqual($3Dmol.createViewer.mock.callCount(), 1);
      assert.strictEqual(viewer.addModel.mock.callCount(), 2);
      assert.deepStrictEqual(viewer.addModel.mock.calls[0].arguments, ['sdf1', 'sdf']);
      assert.deepStrictEqual(viewer.addModel.mock.calls[1].arguments, ['sdf2', 'sdf']);
      assert.deepStrictEqual(model2Atoms, [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 1, z: 1 }
      ]);
      assert.strictEqual(viewer.render.mock.callCount(), 1);
      assert.strictEqual(titleEl.textContent, 'AAA vs BBB');
      assert.strictEqual(modalEl.style.display, 'block');

      mock.restoreAll();
      delete global.$3Dmol;
      delete global.document;
      delete global.window;
    });
  });
