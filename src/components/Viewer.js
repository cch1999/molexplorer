class Viewer {
    constructor() {
        this.viewer = null;
        this.listEl = null;
        this.molecules = [];
    }

    init() {
        const container = document.getElementById('viewer-content');
        if (!container) return this;

        container.innerHTML = '';
        container.classList.add('viewer-panel');

        const viewerDiv = document.createElement('div');
        viewerDiv.className = 'viewer-canvas';
        container.appendChild(viewerDiv);

        this.listEl = document.createElement('ul');
        this.listEl.className = 'viewer-list';
        container.appendChild(this.listEl);

        this.viewer = $3Dmol.createViewer(viewerDiv, { backgroundColor: 'white' });
        this.viewer.render();

        return this;
    }

    resize() {
        if (this.viewer) {
            this.viewer.resize();
            this.viewer.render();
        }
    }

    renderList() {
        if (!this.listEl) return;
        this.listEl.innerHTML = '';
        this.molecules.forEach(({ code, visible }) => {
            const row = document.createElement('li');
            row.className = 'viewer-row';

            const codeSpan = document.createElement('span');
            codeSpan.textContent = code;
            row.appendChild(codeSpan);

            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'viewer-hide-btn';
            toggleBtn.innerHTML = visible ? '&#128065;' : '&#128068;';
            toggleBtn.addEventListener('click', () => this.toggleVisibility(code));
            row.appendChild(toggleBtn);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'viewer-remove-btn';
            removeBtn.innerHTML = '&#10006;';
            removeBtn.addEventListener('click', () => this.removeMolecule(code));
            row.appendChild(removeBtn);

            this.listEl.appendChild(row);
        });

        if (this.molecules.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'viewer-empty';
            empty.textContent = 'No molecules loaded';
            this.listEl.appendChild(empty);
        }
    }

    addMolecule({ code, sdf }) {
        if (!this.viewer || this.molecules.some(m => m.code === code)) {
            return false;
        }
        const model = this.viewer.addModel(sdf, 'sdf');
        model.setStyle({}, { stick: {} });
        this.viewer.zoomTo();
        this.viewer.render();
        this.molecules.push({ code, model, visible: true });
        this.renderList();
        return true;
    }

    toggleVisibility(code) {
        const entry = this.molecules.find(m => m.code === code);
        if (!entry) return;
        entry.visible = !entry.visible;
        entry.model.setStyle({}, entry.visible ? { stick: {} } : {});
        this.viewer.render();
        this.renderList();
    }

    removeMolecule(code) {
        const index = this.molecules.findIndex(m => m.code === code);
        if (index === -1) return;
        const { model } = this.molecules[index];
        if (model) {
            this.viewer.removeModel(model);
            this.viewer.render();
        }
        this.molecules.splice(index, 1);
        this.renderList();
    }
}

export default Viewer;

