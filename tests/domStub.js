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
    this.classList = {
      classes: new Set(),
      add: (...cls) => cls.forEach(c => this.classList.classes.add(c)),
      remove: (...cls) => cls.forEach(c => this.classList.classes.delete(c)),
      contains: (c) => this.classList.classes.has(c)
    };
  }
  appendChild(child) {
    if (child && child.isFragment) {
      this.children.push(...child.children);
    } else {
      this.children.push(child);
    }
    return child;
  }
  addEventListener() {}
  querySelector() { return null; }
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
  constructor() { this.elements = {}; }
  getElementById(id) { return this.elements[id] || null; }
  createElement(tag) { return new Element(tag); }
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
