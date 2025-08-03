import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import { toggleDarkMode } from '../src/utils/themeToggle.js';

describe('toggleDarkMode', () => {
  it('toggles dark-mode class on body, updates button text, and resets viewer backgrounds', () => {
    const dom = new JSDOM();
    const { document } = dom.window;
    document.body = new Element('body');
    document.body.className = '';
    const btn = new Element('button');
    btn.id = 'theme-toggle';
    btn.textContent = 'Dark Mode';
    document.registerElement('theme-toggle', btn);
    document.body.appendChild(btn);

    const vc = new Element('div');
    vc.className = 'viewer-container';
    const viewer = {
      color: 'white',
      setBackgroundColor(c) { this.color = c; },
      render() { this.rendered = true; }
    };
    vc.viewer = viewer;
    document.registerElement('vc', vc);
    document.body.appendChild(vc);

    toggleDarkMode(document);
    assert.equal(document.body.className, 'dark-mode');
    assert.equal(btn.textContent, 'Light Mode');
    assert.equal(viewer.color, '#1e1e1e');

    toggleDarkMode(document);
    assert.equal(document.body.className, '');
    assert.equal(btn.textContent, 'Dark Mode');
    assert.equal(viewer.color, 'white');
  });
});
