class Viewer {
    constructor(containerId = 'quick-view-viewer') {
        this.containerId = containerId;
        this.container = null;
        this.viewer = null;
        this.models = new Map();
    }

    init(initial = []) {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.warn(`Viewer container #${this.containerId} not found`);
            return this;
        }
        this.container.innerHTML = '';
        try {
            const bgColor = document.body?.classList?.contains('dark-mode') ? '#e0e0e0' : 'white';
            this.viewer = $3Dmol.createViewer(this.container, { backgroundColor: bgColor });
            this.viewer.render();
        } catch (e) {
            console.error('Error initializing viewer:', e);
        }
        if (Array.isArray(initial) && initial.length > 0) {
            this.restore(initial);
        }
        return this;
    }

    addMolecule({ code, sdf }) {
        if (!this.viewer || !sdf || !code) return;
        if (this.models.has(code)) return;
        try {
            const model = this.viewer.addModel(sdf, 'sdf');
            this.viewer.setStyle({ model }, { stick: {} });
            this.viewer.setStyle({ model, elem: 'H' }, {});
            this.viewer.zoomTo();
            this.viewer.render();
            this.models.set(code, { model, sdf });
        } catch (e) {
            console.error(`Error adding molecule ${code} to viewer:`, e);
        }
    }

    removeMolecule(code) {
        if (!this.viewer || !this.models.has(code)) return;
        try {
            const { model } = this.models.get(code);
            this.viewer.removeModel(model);
            this.models.delete(code);
            this.viewer.render();
        } catch (e) {
            console.error(`Error removing molecule ${code} from viewer:`, e);
        }
    }

    clear() {
        if (this.viewer) {
            this.viewer.removeAllModels();
            this.viewer.render();
        }
        this.models.clear();
    }

    restore(molecules = []) {
        molecules.forEach(m => this.addMolecule(m));
    }

    getState() {
        return Array.from(this.models.entries()).map(([code, { sdf }]) => ({ code, sdf }));
    }
}

export default Viewer;
