class TagModal {
    constructor(tagManager) {
        this.tagManager = tagManager;
        this.modal = document.getElementById('tag-modal');
        this.input = document.getElementById('tag-input');
        this.saveBtn = document.getElementById('tag-save-btn');
        this.cancelBtn = document.getElementById('tag-cancel-btn');
        this.closeBtn = document.getElementById('tag-close-modal');
        this.currentCode = null;
        this.onSave = null;

        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.handleSave());
        }
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.close());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        window.addEventListener('click', e => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    open(code, onSave) {
        this.currentCode = code;
        this.onSave = onSave;
        if (this.input) this.input.value = '';
        if (this.modal) {
            this.modal.style.display = 'block';
            this.input && this.input.focus();
        }
    }

    handleSave() {
        const value = this.input ? this.input.value.trim() : '';
        if (value && this.currentCode) {
            this.tagManager.addTag(this.currentCode, value);
            if (this.onSave) this.onSave(value);
        }
        this.close();
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        this.currentCode = null;
        this.onSave = null;
    }
}

export default TagModal;
