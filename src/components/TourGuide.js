class TourGuide {
    constructor(steps = []) {
        this.steps = steps;
        this.current = -1;
        this.overlay = null;
        this.tooltip = null;
        this.textEl = null;
        this.nextBtn = null;
        this.prevBtn = null;
        this.boundKeyHandler = this.handleKeyDown.bind(this);
    }

    start() {
        if (!this.steps.length) return;
        this.createOverlay();
        this.showStep(0);
        if (document.addEventListener) {
            document.addEventListener('keydown', this.boundKeyHandler);
        }
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tour-overlay';
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.next();
            }
        });

        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tour-tooltip';
        this.textEl = document.createElement('p');
        this.tooltip.appendChild(this.textEl);

        const btnContainer = document.createElement('div');
        btnContainer.className = 'tour-controls';

        this.prevBtn = document.createElement('button');
        this.prevBtn.textContent = 'Back';
        this.prevBtn.className = 'tour-prev btn-secondary';
        this.prevBtn.addEventListener('click', () => this.prev());

        this.nextBtn = document.createElement('button');
        this.nextBtn.textContent = 'Next';
        this.nextBtn.className = 'tour-next btn-primary';
        this.nextBtn.addEventListener('click', () => this.next());

        btnContainer.appendChild(this.prevBtn);
        btnContainer.appendChild(this.nextBtn);
        this.tooltip.appendChild(btnContainer);

        this.overlay.appendChild(this.tooltip);
        document.body.appendChild(this.overlay);
    }

    getElement(step) {
        if (!step) return null;
        return typeof step.element === 'string'
            ? document.querySelector(step.element)
            : step.element;
    }

    showStep(index) {
        if (this.current >= 0) {
            const prevEl = this.getElement(this.steps[this.current]);
            if (prevEl) {
                if (prevEl.classList && prevEl.classList.remove) {
                    prevEl.classList.remove('tour-highlight');
                } else {
                    prevEl.className = prevEl.className.replace('tour-highlight', '').trim();
                }
            }
        }

        if (index >= this.steps.length) {
            this.end();
            return;
        }

        this.current = index;
        const step = this.steps[index];
        if (typeof step.onShow === 'function') {
            step.onShow();
        }
        const el = this.getElement(step);
        if (!el) {
            this.next();
            return;
        }
        if (el.classList && el.classList.add) {
            el.classList.add('tour-highlight');
        } else {
            el.className = `${el.className ? el.className + ' ' : ''}tour-highlight`;
        }
        this.textEl.textContent = step.message || '';

        const rect = typeof el.getBoundingClientRect === 'function'
            ? el.getBoundingClientRect()
            : { top: 0, left: 0, height: 0 };
        if (this.tooltip && this.tooltip.style) {
            this.tooltip.style.top = `${rect.top + rect.height + 10}px`;
            this.tooltip.style.left = `${rect.left}px`;
        }

        if (this.prevBtn && this.prevBtn.style) {
            this.prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
        }
        if (this.nextBtn) {
            this.nextBtn.textContent = index === this.steps.length - 1 ? 'Finish' : 'Next';
        }
    }

    next() {
        this.showStep(this.current + 1);
    }

    prev() {
        if (this.current <= 0) return;
        this.showStep(this.current - 1);
    }

    handleKeyDown(e) {
        const key = e.key;
        if (['Enter', ' ', 'ArrowRight'].includes(key)) {
            e.preventDefault && e.preventDefault();
            this.next();
        } else if (['ArrowLeft'].includes(key)) {
            e.preventDefault && e.preventDefault();
            this.prev();
        } else if (key === 'Escape') {
            e.preventDefault && e.preventDefault();
            this.end();
        }
    }

    end() {
        if (this.current >= 0) {
            const el = this.getElement(this.steps[this.current]);
            if (el) {
                if (el.classList && el.classList.remove) {
                    el.classList.remove('tour-highlight');
                } else {
                    el.className = el.className.replace('tour-highlight', '').trim();
                }
            }
        }
        this.current = -1;
        if (document.removeEventListener) {
            document.removeEventListener('keydown', this.boundKeyHandler);
        }
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}

export default TourGuide;
