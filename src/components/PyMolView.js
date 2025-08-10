class PyMolView {
    constructor(moleculeManager) {
        this.moleculeManager = moleculeManager;
        this.container = null;
        this.viewerEl = null;
        this.listEl = null;
        this.viewer = null;
        this.models = new Map(); // id -> model
        this.initialized = false;
    }

    init() {
        this.container = document.getElementById('pymol-view-content');
        this.viewerEl = document.getElementById('pymol-viewer');
        this.listEl = document.getElementById('pymol-molecule-list');

        if (!this.viewerEl || !this.listEl) return this;

        // Initialize 3Dmol viewer lazily after a tick for layout
        setTimeout(() => this._ensureViewer(), 50);
        this.renderList();

        const refreshBtn = document.getElementById('pymol-refresh');
        const clearBtn = document.getElementById('pymol-clear');
        const zoomAllBtn = document.getElementById('pymol-zoom-all');
        if (refreshBtn) refreshBtn.addEventListener('click', () => this.renderList());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearViewer());
        if (zoomAllBtn) zoomAllBtn.addEventListener('click', () => this.zoomAll());

        // Try to keep list in sync periodically for a short while after load
        // to reflect async molecule loading; then rely on manual refresh
        let syncCount = 0;
        const syncInterval = setInterval(() => {
            this.renderList(true);
            syncCount += 1;
            if (syncCount > 40) clearInterval(syncInterval); // ~20s
        }, 500);

        return this;
    }

    _ensureViewer() {
        if (this.viewer) return;
        const bgColor = document.body?.classList?.contains('dark-mode') ? '#e0e0e0' : 'white';
        try {
            this.viewer = $3Dmol.createViewer(this.viewerEl, { backgroundColor: bgColor });
            this.viewerEl.viewer = this.viewer;
            this.initialized = true;
        } catch (e) {
            console.error('Failed to init PyMol viewer', e);
            this.viewerEl.innerHTML = '<p class="render-error">Viewer initialization failed</p>';
        }
    }

    resize() {
        if (this.viewer) {
            this.viewer.resize();
            this.viewer.render();
        }
    }

    clearViewer() {
        if (!this.viewer) return;
        this.viewer.clear();
        this.viewer.removeAllModels();
        this.viewer.render();
        this.models.clear();
        // Uncheck checkboxes
        this.listEl.querySelectorAll('input[type="checkbox"]').forEach(cb => (cb.checked = false));
    }

    zoomAll() {
        if (!this.viewer) return;
        this.viewer.zoomTo();
        this.viewer.render();
    }

    renderList(isSync = false) {
        if (!this.listEl) return;
        const molecules = this.moleculeManager.getAllMolecules();

        // When syncing, update existing items' enabled state and skip full rebuild
        if (isSync && this.listEl.childElementCount > 0) {
            molecules.forEach(m => {
                const row = this.listEl.querySelector(`[data-mol-id="${m.id}"]`);
                if (row) {
                    const cb = row.querySelector('input[type="checkbox"]');
                    cb.disabled = !m.sdf;
                    const statusEl = row.querySelector('.pymol-item-status');
                    statusEl.textContent = m.sdf ? '' : (m.status === 'loading' ? 'loading…' : '');
                }
            });
            return;
        }

        this.listEl.innerHTML = '';
        molecules.forEach(m => {
            const item = document.createElement('div');
            item.className = 'pymol-list-item';
            item.setAttribute('data-mol-id', m.id);

            const left = document.createElement('div');
            left.className = 'pymol-item-left';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.disabled = !m.sdf;
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    this.addMoleculeToViewer(m);
                } else {
                    this.removeMoleculeFromViewer(m);
                }
            });

            const code = document.createElement('span');
            code.className = 'pymol-item-code';
            code.textContent = m.code;
            code.title = m.id;

            const status = document.createElement('span');
            status.className = 'pymol-item-status';
            status.textContent = m.sdf ? '' : (m.status === 'loading' ? 'loading…' : '');

            left.appendChild(cb);
            left.appendChild(code);
            left.appendChild(status);

            const actions = document.createElement('div');
            actions.className = 'pymol-item-actions';

            const focusBtn = document.createElement('button');
            focusBtn.className = 'action-btn small';
            focusBtn.textContent = 'Focus';
            focusBtn.disabled = !m.sdf;
            focusBtn.addEventListener('click', () => this.focusMolecule(m));

            actions.appendChild(focusBtn);

            item.appendChild(left);
            item.appendChild(actions);
            this.listEl.appendChild(item);
        });
    }

    addMoleculeToViewer(m) {
        this._ensureViewer();
        if (!this.viewer) return;
        if (!m.sdf) {
            if (typeof showNotification === 'function') {
                showNotification(`Molecule ${m.code} not loaded yet`, 'info');
            }
            return;
        }
        if (this.models.has(m.id)) return; // already added
        try {
            const model = this.viewer.addModel(m.sdf, 'sdf');
            model.setStyle({}, {
                stick: { radius: 0.2, colorscheme: 'element' },
                sphere: { scale: 0.25, colorscheme: 'element' }
            });
            this.viewer.setStyle({ elem: 'H', model: model }, {});
            this.viewer.render();
            this.models.set(m.id, model);
        } catch (e) {
            console.error('Failed to add model', m.id, e);
        }
    }

    removeMoleculeFromViewer(m) {
        if (!this.viewer) return;
        const model = this.models.get(m.id);
        if (!model) return;
        try {
            this.viewer.removeModel(model);
            this.models.delete(m.id);
            this.viewer.render();
        } catch (e) {
            console.error('Failed to remove model', m.id, e);
        }
    }

    focusMolecule(m) {
        if (!this.viewer) return;
        const model = this.models.get(m.id);
        if (!model) {
            this.addMoleculeToViewer(m);
        }
        const mdl = this.models.get(m.id);
        if (mdl) {
            this.viewer.zoomTo({ model: mdl });
            this.viewer.render();
        }
    }
}

export default PyMolView;

