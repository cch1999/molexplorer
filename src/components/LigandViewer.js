class LigandViewer {
    constructor(moleculeManager) {
        this.moleculeManager = moleculeManager;
        this.container = null;
        this.viewerEl = null;
        this.listEl = null;
        this.searchEl = null;
        this.styleEl = null;
        this.viewer = null;
        this.currentStyle = 'ballstick';
        this.currentCode = null;
    }

    init() {
        this.container = document.getElementById('ligand-viewer-content');
        this.viewerEl = document.getElementById('ligand-viewer-pane');
        this.listEl = document.getElementById('ligand-list');
        this.searchEl = document.getElementById('ligand-search');
        this.styleEl = document.getElementById('ligand-style');

        if (this.searchEl) {
            this.searchEl.addEventListener('input', () => this.renderList());
        }
        if (this.styleEl) {
            this.styleEl.addEventListener('change', () => {
                this.currentStyle = this.styleEl.value;
                // Reapply style to current model if present
                if (this.viewer) {
                    try {
                        this.applyStyle();
                        this.viewer.render();
                    } catch (e) {
                        console.warn('Error applying style:', e);
                    }
                }
            });
        }

        // Initialize 3D viewer box
        this.initViewer();
        this.renderList();
        return this;
    }

    initViewer() {
        if (!this.viewerEl) return;
        // Clean up existing viewer if any
        if (this.viewer && typeof this.viewer.clear === 'function') {
            try { this.viewer.clear(); } catch (_) {}
        }
        const bgColor = document.body?.classList?.contains('dark-mode') ? '#e0e0e0' : 'white';
        try {
            const viewer = $3Dmol.createViewer(this.viewerEl, { backgroundColor: bgColor });
            this.viewerEl.viewer = viewer;
            this.viewer = viewer;
        } catch (e) {
            console.error('Failed to initialize viewer:', e);
            this.viewer = null;
        }
    }

    showLigand(molecule) {
        if (!this.viewer || !molecule) return;
        this.currentCode = molecule.id || molecule.code;
        this.viewer.clear();
        if (molecule.sdf) {
            try {
                this.viewer.addModel(molecule.sdf, 'sdf');
                this.applyStyle();
                this.viewer.zoomTo();
                this.viewer.render();
            } catch (e) {
                console.error('Error rendering SDF:', e);
                this.viewerEl.innerHTML = '<p style="color:#666;padding:10px;">Cannot render SDF</p>';
            }
        } else {
            // Not yet loaded; show message
            this.viewerEl.innerHTML = '<p style="color:#666;padding:10px;">Ligand not loaded yet</p>';
        }
    }

    applyStyle() {
        if (!this.viewer) return;
        // Clear styles then set per currentStyle
        this.viewer.setStyle({}, {});
        const style = this.currentStyle;
        if (style === 'stick') {
            this.viewer.setStyle({}, { stick: { radius: 0.2, colorscheme: 'element' } });
        } else if (style === 'line') {
            this.viewer.setStyle({}, { line: { linewidth: 1.5, colorscheme: 'element' } });
        } else {
            // ballstick default
            this.viewer.setStyle({}, {
                stick: { radius: 0.2, colorscheme: 'element' },
                sphere: { scale: 0.3, colorscheme: 'element' }
            });
        }
        // Hide hydrogens by default
        this.viewer.setStyle({ elem: 'H' }, {});
    }

    renderList() {
        if (!this.listEl) return;
        const filter = (this.searchEl?.value || '').trim().toLowerCase();
        const molecules = this.moleculeManager.getAllMolecules();
        const items = molecules.filter(m => !filter || (m.code || m.id).toLowerCase().includes(filter));

        this.listEl.innerHTML = '';
        if (items.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'ligand-empty';
            empty.textContent = 'No molecules in library';
            this.listEl.appendChild(empty);
            return;
        }

        items.forEach(m => {
            const row = document.createElement('div');
            row.className = 'ligand-row';
            row.title = 'Click to view 3D';

            const title = document.createElement('div');
            title.className = 'ligand-code';
            title.textContent = m.code || m.id;

            const status = document.createElement('div');
            status.className = 'ligand-status';
            status.textContent = m.status || 'unknown';

            row.appendChild(title);
            row.appendChild(status);

            row.addEventListener('click', () => {
                this.highlightSelection(row);
                this.showLigand(m);
            });

            this.listEl.appendChild(row);
        });
    }

    highlightSelection(row) {
        const rows = this.listEl.querySelectorAll('.ligand-row');
        rows.forEach(r => r.classList.remove('active'));
        row.classList.add('active');
    }

    refresh() {
        // Called when tab is shown or on demand
        // Re-init viewer to adopt theme changes if any
        this.initViewer();
        this.renderList();
        // If a current code exists, try to show it
        if (this.currentCode) {
            const mol = this.moleculeManager.getMolecule(this.currentCode);
            if (mol) this.showLigand(mol);
        }
    }
}

export default LigandViewer;

