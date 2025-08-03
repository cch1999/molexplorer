class LigandDetails {
    constructor(moleculeManager) {
        this.moleculeManager = moleculeManager;
        this.modal = document.getElementById('molecule-details-modal');
        this.detailsTitle = document.getElementById('details-title');
        this.detailsCode = document.getElementById('details-code');
        this.detailsSource = document.getElementById('details-source');
        this.detailsType = document.getElementById('details-type');
        this.detailsStructure = document.getElementById('details-structure');
        this.pdbInstanceFields = document.querySelectorAll('.pdb-instance-field');
        this.detailsPdbId = document.getElementById('details-pdb-id');
        this.detailsChain = document.getElementById('details-chain');
        this.detailsResidue = document.getElementById('details-residue');
        this.detailsViewer = document.getElementById('details-viewer-container');
        this.detailsJSON = document.getElementById('details-json');
        this.viewer = null;

        const closeBtn = document.getElementById('close-details-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    show(ccdCode, sdfData) {
        this.cleanupViewer();
        this.detailsTitle.textContent = `Molecule Details: ${ccdCode}`;
        this.detailsCode.textContent = ccdCode;

        const isAminoAcid = ['ALA','ARG','ASN','ASP','CYS','GLN','GLU','GLY','HIS','ILE','LEU','LYS','MET','PHE','PRO','SER','THR','TRP','TYR','VAL'].includes(ccdCode);
        this.detailsSource.textContent = isAminoAcid ? 'building_blocks' : 'reagents';
        this.detailsType.textContent = isAminoAcid ? 'building_block' : 'reagent';

        const molecule = this.moleculeManager.getMolecule ? this.moleculeManager.getMolecule(ccdCode) : null;
        const isInstance = molecule && molecule.pdbId && molecule.authSeqId && molecule.labelAsymId;
        if (this.detailsStructure) {
            this.detailsStructure.textContent = isInstance ? 'PDB instance' : 'Ideal CCD SDF';
        }
        if (this.pdbInstanceFields) {
            this.pdbInstanceFields.forEach(el => {
                el.style.display = isInstance ? 'flex' : 'none';
            });
        }
        if (isInstance) {
            if (this.detailsPdbId) this.detailsPdbId.textContent = molecule.pdbId.toUpperCase();
            if (this.detailsChain) this.detailsChain.textContent = molecule.labelAsymId;
            if (this.detailsResidue) this.detailsResidue.textContent = molecule.authSeqId;
        } else {
            if (this.detailsPdbId) this.detailsPdbId.textContent = '-';
            if (this.detailsChain) this.detailsChain.textContent = '-';
            if (this.detailsResidue) this.detailsResidue.textContent = '-';
        }

        this.detailsViewer.innerHTML = '<p>Loading structure...</p>';
        if (sdfData) {
            setTimeout(() => {
                try {
                    const isDark = document.body.classList
                        ? document.body.classList.contains('dark-mode')
                        : document.body.className.split(' ').includes('dark-mode');
                    const viewer = $3Dmol.createViewer(this.detailsViewer, {
                        backgroundColor: isDark ? '#bbbbbb' : 'white',
                        width: '100%',
                        height: '100%'
                    });
                    this.detailsViewer.viewer = viewer;
                    viewer.addModel(sdfData, 'sdf');
                    viewer.setStyle({}, { stick: { radius: 0.2 }, sphere: { scale: 0.3 } });
                    viewer.setStyle({ elem: 'H' }, {});
                    viewer.zoomTo();
                    viewer.render();
                    this.viewer = viewer;
                } catch (e) {
                    console.error(`Error initializing details viewer for ${ccdCode}:`, e);
                    this.detailsViewer.innerHTML = '<p style="color: #666;">Structure rendering error</p>';
                }
            }, 100);
        } else {
            this.detailsViewer.innerHTML = '<p style="color: #666;">Structure data not available</p>';
        }

        const jsonData = {
            molecule_id: `mol_${ccdCode.toLowerCase()}`,
            ccd_code: ccdCode,
            source: isAminoAcid ? 'building_blocks' : 'reagents',
            type: isAminoAcid ? 'building_block' : 'reagent',
            structure_type: isInstance ? 'pdb_instance' : 'ideal_sdf',
            structure_data: sdfData ? sdfData.substring(0, 100) + '...' : 'N/A',
            properties: {
                molecular_weight: null,
                formula: null,
                status: molecule ? molecule.status : 'unknown'
            }
        };
        if (isInstance) {
            jsonData.pdb_instance = {
                pdb_id: molecule.pdbId,
                auth_seq_id: molecule.authSeqId,
                label_asym_id: molecule.labelAsymId
            };
        }
        this.detailsJSON.textContent = JSON.stringify(jsonData, null, 2);

        this.modal.style.display = 'block';
    }

    close() {
        this.cleanupViewer();
        this.modal.style.display = 'none';
    }

    cleanupViewer() {
        if (this.viewer) {
            try {
                this.viewer.clear();
                if (typeof this.viewer.destroy === 'function') {
                    this.viewer.destroy();
                } else if (this.viewer?.gl && typeof this.viewer.gl.getExtension === 'function') {
                    this.viewer.gl.getExtension('WEBGL_lose_context')?.loseContext();
                }
            } catch (e) {
                console.warn('Error destroying viewer:', e);
            }
            this.viewer = null;
        }
        if (this.detailsViewer) {
            this.detailsViewer.innerHTML = '';
        }
    }
}

export default LigandDetails;

