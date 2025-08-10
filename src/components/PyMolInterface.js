import ApiService from '../utils/apiService.js';

class PyMolInterface {
  constructor() {
    this.viewerContainer = null;
    this.viewer = null;
    this.currentPdbId = null;

    // Controls
    this.pdbInput = null;
    this.loadBtn = null;
    this.showCartoon = null;
    this.showSticks = null;
    this.showSurface = null;
    this.surfaceOpacity = null;
    this.colorScheme = null;
    this.hideSolvent = null;
    this.hideIons = null;
    this.zoomLigandsBtn = null;
    this.resetViewBtn = null;
    this.spinToggle = null;
  }

  init() {
    // Hook up DOM
    this.viewerContainer = document.getElementById('pymol-viewer');
    this.pdbInput = document.getElementById('pymol-pdb-id');
    this.loadBtn = document.getElementById('pymol-load-btn');
    this.showCartoon = document.getElementById('pymol-cartoon');
    this.showSticks = document.getElementById('pymol-sticks');
    this.showSurface = document.getElementById('pymol-surface');
    this.surfaceOpacity = document.getElementById('pymol-surface-opacity');
    this.colorScheme = document.getElementById('pymol-color-scheme');
    this.hideSolvent = document.getElementById('pymol-hide-solvent');
    this.hideIons = document.getElementById('pymol-hide-ions');
    this.zoomLigandsBtn = document.getElementById('pymol-zoom-ligands');
    this.resetViewBtn = document.getElementById('pymol-reset-view');
    this.spinToggle = document.getElementById('pymol-spin');

    if (this.loadBtn) this.loadBtn.addEventListener('click', () => this.handleLoad());
    if (this.pdbInput) {
      this.pdbInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleLoad();
          this.pdbInput.blur();
        }
      });
    }

    const changeHandlers = [
      this.showCartoon, this.showSticks, this.showSurface,
      this.surfaceOpacity, this.colorScheme, this.hideSolvent, this.hideIons
    ];
    changeHandlers.forEach(ctrl => ctrl && ctrl.addEventListener('change', () => this.applyStyles()));

    if (this.zoomLigandsBtn) this.zoomLigandsBtn.addEventListener('click', () => this.zoomLigands());
    if (this.resetViewBtn) this.resetViewBtn.addEventListener('click', () => this.resetView());
    if (this.spinToggle) this.spinToggle.addEventListener('change', () => this.updateSpin());

    return this;
  }

  ensureViewer() {
    if (!this.viewer && this.viewerContainer) {
      const bgColor = document.body?.classList?.contains('dark-mode') ? '#e0e0e0' : 'white';
      this.viewer = $3Dmol.createViewer(this.viewerContainer, {
        backgroundColor: bgColor,
        width: '100%',
        height: '100%'
      });
      this.viewerContainer.viewer = this.viewer;
    }
  }

  async handleLoad() {
    const id = (this.pdbInput?.value || '').trim();
    if (!id) {
      if (typeof showNotification === 'function') showNotification('Enter a PDB ID to load', 'info');
      return;
    }
    await this.loadPdb(id);
  }

  async loadPdb(pdbId) {
    try {
      this.ensureViewer();
      if (!this.viewer) return;
      const pdb = await ApiService.getPdbFile(pdbId.toUpperCase());
      this.viewer.clear();
      this.viewer.addModel(pdb, 'pdb');
      this.currentPdbId = pdbId.toUpperCase();
      this.applyStyles();
      this.viewer.zoomTo();
      this.viewer.render();
      if (typeof showNotification === 'function') showNotification(`Loaded ${this.currentPdbId}`, 'success');
    } catch (e) {
      console.error('Failed to load PDB:', e);
      if (typeof showNotification === 'function') showNotification('Failed to load PDB', 'error');
    }
  }

  getIonResidues() {
    return ['NA','CL','MG','K','CA','ZN','MN','FE','CU','NI','CO','CD','SR','CS'];
  }

  getSolventResidues() {
    return ['HOH','WAT','DOD'];
  }

  applyStyles() {
    if (!this.viewer) return;
    const showCartoon = !!this.showCartoon?.checked;
    const showSticks = !!this.showSticks?.checked;
    const showSurface = !!this.showSurface?.checked;
    const hideSolvent = !!this.hideSolvent?.checked;
    const hideIons = !!this.hideIons?.checked;
    const scheme = this.colorScheme?.value || 'chain';
    const opacity = Number(this.surfaceOpacity?.value || 0.5);

    // Clear styles and surfaces
    this.viewer.setStyle({}, {});
    this.viewer.removeAllSurfaces();

    // Build selections
    const polymerSel = { hetflag: false };
    const hetSel = { hetflag: true };
    const notList = [];
    if (hideSolvent) notList.push(...this.getSolventResidues());
    if (hideIons) notList.push(...this.getIonResidues());
    const hetSelection = notList.length ? { ...hetSel, not: { resn: notList } } : hetSel;

    // Cartoon for polymer
    if (showCartoon) {
      const cartoonScheme = scheme === 'spectrum' ? 'spectrum' : 'chain';
      this.viewer.setStyle(polymerSel, { cartoon: { colorscheme: cartoonScheme } });
    }

    // Sticks for hetero
    if (showSticks) {
      // Always color ligands (hetero) by element; slightly thicker sticks
      this.viewer.setStyle(hetSelection, { stick: { radius: 0.25, colorscheme: 'element' } });
    }

    // Surface for polymer
    if (showSurface) {
      this.viewer.addSurface($3Dmol.SurfaceType.MS, { opacity, color: 'white' }, polymerSel);
    }

    this.viewer.render();
  }

  zoomLigands() {
    if (!this.viewer) return;
    this.viewer.zoomTo({ hetflag: true });
    this.viewer.render();
  }

  resetView() {
    if (!this.viewer) return;
    this.viewer.zoomTo();
    this.viewer.render();
  }

  updateSpin() {
    if (!this.viewer) return;
    if (this.spinToggle?.checked) {
      this.viewer.spin('y');
    } else {
      this.viewer.spin(false);
    }
  }
}

export default PyMolInterface;
