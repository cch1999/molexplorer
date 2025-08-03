export default class TourGuide {
    constructor(steps = []) {
        this.steps = steps;
        this.currentIndex = -1;
        this.overlay = null;
        this.tooltip = null;
        this.currentElement = null;
    }

    start() {
        this.currentIndex = -1;
        this.next();
    }

    next() {
        this.cleanup();
        this.currentIndex++;
        if (this.currentIndex >= this.steps.length) {
            this.end();
            return;
        }
        const step = this.steps[this.currentIndex];
        const el = step.element || (step.selector ? document.querySelector(step.selector) : null);
        if (!el) {
            this.next();
            return;
        }
        this.currentElement = el;
        if (el.classList && el.classList.add) {
            el.classList.add('tour-highlight');
        } else {
            el.className = (el.className ? el.className + ' ' : '') + 'tour-highlight';
        }

        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        document.body.appendChild(this.overlay);

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tour-tooltip';
        const text = document.createElement('div');
        text.textContent = step.text || '';
        this.tooltip.appendChild(text);
        const btn = document.createElement('button');
        btn.textContent = this.currentIndex === this.steps.length - 1 ? 'Finish' : 'Next';
        btn.addEventListener('click', () => this.next());
        this.tooltip.appendChild(btn);

        const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: 0, bottom: 0 };
        const top = (rect.bottom || rect.top || 0) + (window.scrollY || 0) + 10;
        const left = (rect.left || 0) + (window.scrollX || 0);
        this.tooltip.style = this.tooltip.style || {};
        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
        document.body.appendChild(this.tooltip);
    }

    cleanup() {
        if (this.overlay) {
            this.removeElement(this.overlay);
            this.overlay = null;
        }
        if (this.tooltip) {
            this.removeElement(this.tooltip);
            this.tooltip = null;
        }
        if (this.currentElement) {
            if (this.currentElement.classList && this.currentElement.classList.remove) {
                this.currentElement.classList.remove('tour-highlight');
            } else {
                this.currentElement.className = this.currentElement.className.replace(/\btour-highlight\b/, '').trim();
            }
            this.currentElement = null;
        }
    }

    removeElement(el) {
        if (!el) return;
        if (typeof el.remove === 'function') {
            el.remove();
            return;
        }
        const parent = el.parentNode;
        if (parent && typeof parent.removeChild === 'function') {
            parent.removeChild(el);
            return;
        }
        if (document && document.body && document.body.children) {
            const idx = document.body.children.indexOf(el);
            if (idx > -1) {
                document.body.children.splice(idx, 1);
            }
        }
    }

    end() {
        this.cleanup();
        this.currentIndex = -1;
    }
}
