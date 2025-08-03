import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import TourGuide from '../src/components/TourGuide.js';

describe('TourGuide', () => {
    let dom, document, step1, step2, tour;

    beforeEach(() => {
        dom = new JSDOM();
        document = dom.window.document;
        document.body = new Element('body');
        document.body.removeChild = function(child) {
            const idx = this.children.indexOf(child);
            if (idx > -1) this.children.splice(idx, 1);
            return child;
        };
        global.document = document;
        global.window = { scrollY: 0, scrollX: 0 };
        step1 = new Element('div');
        step1.getBoundingClientRect = () => ({ top: 0, bottom: 10, left: 0 });
        step2 = new Element('div');
        step2.getBoundingClientRect = () => ({ top: 20, bottom: 30, left: 0 });
        document.body.appendChild(step1);
        document.body.appendChild(step2);
        tour = new TourGuide([
            { element: step1, text: 'first' },
            { element: step2, text: 'second' }
        ]);
    });

    it('highlights elements sequentially', () => {
        tour.start();
        assert.ok(step1.className.includes('tour-highlight'));
        assert.strictEqual(step2.className.includes('tour-highlight'), false);
        tour.next();
        assert.strictEqual(step1.className.includes('tour-highlight'), false);
        assert.ok(step2.className.includes('tour-highlight'));
    });

    it('cleans up after completion', () => {
        tour.start();
        tour.next(); // step2
        tour.next(); // finish
        const overlayExists = document.body.children.some(c => c.className === 'tour-overlay');
        assert.strictEqual(overlayExists, false);
        assert.strictEqual(step2.className.includes('tour-highlight'), false);
    });
});
