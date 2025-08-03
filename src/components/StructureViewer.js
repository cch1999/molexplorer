class StructureViewer {
    constructor(container, molLib = window.$3Dmol) {
        this.container = container;
        this.$3Dmol = molLib;
        this.viewer = null;
        this.isSpinning = false;
    }

    init() {
        if (this.viewer || !this.container) return;
        try {
            this.viewer = this.$3Dmol.createViewer(this.container, {
                backgroundColor: 'white',
                width: '100%',
                height: '100%'
            });
        } catch (err) {
            console.error('Failed to initialize viewer', err);
            if (this.container) {
                this.container.innerHTML = '<p style="color:#666;">Viewer error</p>';
            }
        }
    }

    loadModel(data, format) {
        if (!data) {
            if (this.container) {
                this.container.innerHTML = '<p style="color:#666;">Structure data not available</p>';
            }
            return;
        }
        this.init();
        if (!this.viewer) return;
        try {
            this.viewer.clear();
            this.viewer.addModel(data, format);
            if (format === 'pdb') {
                this.viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
            } else {
                this.viewer.setStyle({}, { stick: { radius: 0.2 }, sphere: { scale: 0.3 } });
                this.viewer.setStyle({ elem: 'H' }, {});
            }
            this.viewer.zoomTo();
            this.viewer.render();
        } catch (err) {
            console.error('Error rendering structure', err);
            if (this.container) {
                this.container.innerHTML = '<p style="color:#666;">Structure rendering error</p>';
            }
        }
    }

    loadSDF(data) {
        this.loadModel(data, 'sdf');
    }

    loadPDB(data) {
        this.loadModel(data, 'pdb');
    }

    toggleRotate() {
        if (!this.viewer) return;
        this.isSpinning = !this.isSpinning;
        if (this.isSpinning) {
            this.viewer.spin('y', 1);
        } else {
            this.viewer.stopSpin();
        }
    }

    zoom(factor = 1.2) {
        if (this.viewer) {
            this.viewer.zoom(factor);
        }
    }

    reset() {
        if (this.viewer) {
            this.viewer.stopSpin();
            this.isSpinning = false;
            this.viewer.zoomTo();
            this.viewer.render();
        }
    }
}

export default StructureViewer;
