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
                const viewer = $3Dmol.createViewer(this.viewerContainer, { backgroundColor: 'white' });
                const model1 = viewer.addModel(molA.sdf, 'sdf');
                const model2 = viewer.addModel(molB.sdf, 'sdf');
                model1.setStyle({}, { stick: { colorscheme: 'cyanCarbon' } });
                model2.setStyle({}, { stick: { colorscheme: 'magentaCarbon' } });
                model2.align(model1);
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

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
}

export default ComparisonModal;
