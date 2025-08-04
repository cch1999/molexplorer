class ComparisonModal {
    constructor() {
        this.modal = document.getElementById('comparison-modal');
        this.viewerContainer = document.getElementById('comparison-viewer');
        this.title = document.getElementById('comparison-title');
        const closeBtn = document.getElementById('close-comparison-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    show(molA, molB) {
        if (!molA || !molB) return;
        if (this.title) {
            this.title.textContent = `${molA.code} vs ${molB.code}`;
        }
        if (this.viewerContainer) {
            this.viewerContainer.innerHTML = '';
        }
        if (this.modal) {
            this.modal.style.display = 'block';
        }
        setTimeout(() => {
            try {
                const bgColor = document.body?.classList?.contains('dark-mode') ? '#e0e0e0' : 'white';
                const viewer = $3Dmol.createViewer(this.viewerContainer, { backgroundColor: bgColor });
                this.viewerContainer.viewer = viewer;
                const model1 = viewer.addModel(molA.sdf, 'sdf');
                const model2 = viewer.addModel(molB.sdf, 'sdf');
                model1.setStyle({}, { stick: { colorscheme: 'cyanCarbon' } });
                model2.setStyle({}, { stick: { colorscheme: 'magentaCarbon' } });
                this._alignModels(model1, model2);
                viewer.zoomTo();
                viewer.render();
            } catch (e) {
                console.error('Error rendering comparison viewer:', e);
                if (this.viewerContainer) {
                    this.viewerContainer.innerHTML = '<p style="text-align:center;padding:20px;">Render Error</p>';
                }
            }
        }, 100);
    }

    _alignModels(model1, model2) {
        if (!model1 || !model2 || !model1.selectedAtoms || !model2.selectedAtoms) return;
        const atoms1 = model1.selectedAtoms({});
        const atoms2 = model2.selectedAtoms({});
        if (!atoms1.length || !atoms2.length) return;
        const center = (atoms) => {
            let cx = 0, cy = 0, cz = 0;
            for (const a of atoms) {
                cx += a.x; cy += a.y; cz += a.z;
            }
            return { x: cx / atoms.length, y: cy / atoms.length, z: cz / atoms.length };
        };
        const c1 = center(atoms1);
        const c2 = center(atoms2);
        const dx = c1.x - c2.x;
        const dy = c1.y - c2.y;
        const dz = c1.z - c2.z;
        for (const atom of atoms2) {
            atom.x += dx;
            atom.y += dy;
            atom.z += dz;
        }
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
}

export default ComparisonModal;
