import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import { toggleDarkMode, MOON_ICON, SUN_ICON } from '../src/utils/themeToggle.js';

describe('toggleDarkMode', () => {
  it('toggles dark-mode class on body, updates button icon, and resets viewer backgrounds', () => {
    const dom = new JSDOM();
    const { document } = dom.window;
    document.body = new Element('body');
    document.body.className = '';
    const btn = new Element('button');
    btn.id = 'theme-toggle';
    btn.innerHTML = MOON_ICON;
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
    assert.equal(btn.innerHTML, SUN_ICON);
    assert.equal(viewer.color, '#bbbbbb');

    toggleDarkMode(document);
    assert.equal(document.body.className, '');
    assert.equal(btn.innerHTML, MOON_ICON);
    assert.equal(viewer.color, 'white');
  });
});
