import ApiService from '../utils/apiService.js';

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
        this.interactionTable = document.getElementById('interaction-summary-table');
        this.interactionTbody = document.getElementById('interaction-summary-body');
        this.interactionCounts = document.getElementById('interaction-counts');
        this.interactionFilters = document.getElementById('interaction-type-filters');
        this.noInteractionData = document.getElementById('no-interaction-data');
        this.currentInteractions = [];
        this.selectedInteractionTypes = new Set();
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
        if (isInstance) {
            ApiService.getPdbFile(molecule.pdbId)
                .then(pdbData => {
                    setTimeout(() => {
                        try {
                            const viewer = $3Dmol.createViewer(this.detailsViewer, {
                                backgroundColor: 'white',
                                width: '100%',
                                height: '100%'
                            });
                            viewer.addModel(pdbData, 'pdb');
                            viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
                            const selection = {
                                chain: molecule.labelAsymId,
                                resi: parseInt(molecule.authSeqId, 10)
                            };
                            viewer.setStyle(selection, { stick: { radius: 0.25, colorscheme: 'greenCarbon' } });
                            viewer.zoomTo(selection);
                            viewer.render();
                            this.viewer = viewer;
                        } catch (e) {
                            console.error(`Error initializing PDB viewer for ${ccdCode}:`, e);
                            this.detailsViewer.innerHTML = '<p style="color: #666;">Structure rendering error</p>';
                        }
                    }, 100);
                })
                .catch(e => {
                    console.error(`Error fetching PDB for ${ccdCode}:`, e);
                    this.detailsViewer.innerHTML = '<p style="color: #666;">Structure data not available</p>';
                });
        } else if (sdfData) {
            setTimeout(() => {
                try {
                    const viewer = $3Dmol.createViewer(this.detailsViewer, {
                        backgroundColor: 'white',
                        width: '100%',
                        height: '100%'
                    });
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

        this.loadInteractions(ccdCode, molecule);

        this.modal.style.display = 'block';
    }

    loadInteractions(ccdCode, molecule) {
        if (!this.interactionTable || !this.interactionTbody || !this.interactionFilters) return;
        this.interactionTbody.innerHTML = '';
        if (this.interactionCounts) this.interactionCounts.textContent = '';
        if (this.noInteractionData) this.noInteractionData.style.display = 'none';
        return ApiService.getLigandInteractions(
            molecule?.pdbId,
            ccdCode,
            molecule?.authSeqId,
            molecule?.labelAsymId
        )
            .then(data => {
                this.currentInteractions = Array.isArray(data) ? data : [];
                if (this.currentInteractions.length === 0) {
                    if (this.noInteractionData) this.noInteractionData.style.display = 'block';
                    this.interactionTable.style.display = 'none';
                    this.interactionFilters.innerHTML = '';
                    return;
                }
                const types = [...new Set(this.currentInteractions.map(i => i.type))];
                this.selectedInteractionTypes = new Set(types);
                this.renderInteractionFilters(types);
                this.renderInteractions();
            })
            .catch(() => {
                this.currentInteractions = [];
                if (this.noInteractionData) this.noInteractionData.style.display = 'block';
                this.interactionTable.style.display = 'none';
                this.interactionFilters.innerHTML = '';
            });
    }

    renderInteractionFilters(types) {
        if (!this.interactionFilters) return;
        this.interactionFilters.innerHTML = '';
        types.forEach(type => {
            const label = document.createElement('label');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = type;
            cb.checked = true;
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    this.selectedInteractionTypes.add(type);
                } else {
                    this.selectedInteractionTypes.delete(type);
                }
                this.renderInteractions();
            });
            label.appendChild(cb);
            const text = document.createElement('span');
            text.textContent = ' ' + this.formatInteractionType(type);
            label.appendChild(text);
            this.interactionFilters.appendChild(label);
        });
    }

    renderInteractions() {
        if (!this.interactionTbody) return;
        const filtered = this.currentInteractions.filter(i => this.selectedInteractionTypes.has(i.type));
        this.interactionTbody.innerHTML = '';
        filtered.forEach(inter => {
            const row = document.createElement('tr');
            const typeCell = document.createElement('td');
            typeCell.textContent = this.formatInteractionType(inter.type);
            const partnerCell = document.createElement('td');
            partnerCell.textContent = inter.partner || inter.residue || inter.target || '-';
            const detailsCell = document.createElement('td');
            if (inter.details) {
                detailsCell.textContent = inter.details;
            } else if (typeof inter.distance === 'number') {
                detailsCell.textContent = `${inter.distance.toFixed(2)} Å`;
            } else {
                detailsCell.textContent = '-';
            }
            row.appendChild(typeCell);
            row.appendChild(partnerCell);
            row.appendChild(detailsCell);
            this.interactionTbody.appendChild(row);
        });

        const counts = {};
        filtered.forEach(i => {
            counts[i.type] = (counts[i.type] || 0) + 1;
        });
        const countsText = Object.entries(counts)
            .map(([t, c]) => `${c} ${this.formatInteractionType(t)}`)
            .join(', ');
        if (this.interactionCounts) {
            this.interactionCounts.textContent = countsText;
        }
        if (filtered.length === 0) {
            if (this.noInteractionData) this.noInteractionData.style.display = 'block';
            this.interactionTable.style.display = 'none';
        } else {
            if (this.noInteractionData) this.noInteractionData.style.display = 'none';
            this.interactionTable.style.display = 'table';
        }
    }

    formatInteractionType(type) {
        return type ? type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
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

