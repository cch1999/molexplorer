class Element {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this._innerHTML = '';
    this._textContent = '';
    this.className = '';
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.dataset = {};
    this.attributes = {};
    this.listeners = {};
  }
  appendChild(child) {
    if (child && child.isFragment) {
      this.children.push(...child.children);
    } else {
      this.children.push(child);
    }
    return child;
  }
  insertBefore(child, ref) {
    const idx = this.children.indexOf(ref);
    if (idx === -1) {
      this.children.push(child);
    } else {
      this.children.splice(idx, 0, child);
    }
    return child;
  }
  addEventListener(type, handler) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(handler);
  }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] || null; }
  set innerHTML(val) {
    this._innerHTML = val;
    if (val === '') this.children = [];
  }
  get innerHTML() { return this._innerHTML; }
  set textContent(val) { this._textContent = val; }
  get textContent() {
    return this._textContent + this.children.map(c => c.textContent || '').join('');
  }
}

class DocumentFragment {
  constructor() {
    this.children = [];
    this.isFragment = true;
  }
  appendChild(child) { this.children.push(child); }
}

class Document {
  constructor() {
    this.elements = {};
    this.body = new Element('body');
  }
  getElementById(id) { return this.elements[id] || null; }
  createElement(tag) {
    const el = new Element(tag);
    el.ownerDocument = this;
    el.style = {};
    return el;
  }
  createElementNS(ns, tag) {
    const el = new Element(tag);
    el.ownerDocument = this;
    el.style = {};
    return el;
  }
  createDocumentFragment() { return new DocumentFragment(); }
  registerElement(id, el) { this.elements[id] = el; }
}

export class JSDOM {
  constructor() {
    const document = new Document();
    this.window = { document };
  }
}

export { Element };
