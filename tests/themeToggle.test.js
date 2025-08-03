import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, Element } from './domStub.js';
import { toggleDarkMode } from '../src/utils/themeToggle.js';

describe('toggleDarkMode', () => {
  it('toggles dark-mode class on body and updates button text', () => {
    const dom = new JSDOM();
    const { document } = dom.window;
    document.body = new Element('body');
    document.body.className = '';
    const btn = new Element('button');
    btn.id = 'theme-toggle';
    btn.textContent = 'Dark Mode';
    document.registerElement('theme-toggle', btn);
    document.body.appendChild(btn);

    toggleDarkMode(document);
    assert.equal(document.body.className, 'dark-mode');
    assert.equal(btn.textContent, 'Light Mode');

    toggleDarkMode(document);
    assert.equal(document.body.className, '');
    assert.equal(btn.textContent, 'Dark Mode');
  });
});
