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
        this.viewer = null;
        this.interactionShapes = [];
        this.interactionToggle = null;

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
        this.clearInteractions();
        if (isInstance && this.detailsViewer?.parentElement) {
            if (!this.interactionToggle) {
                const container = document.createElement('div');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = 'interaction-toggle';
                checkbox.checked = true;
                const label = document.createElement('label');
                label.htmlFor = 'interaction-toggle';
                label.textContent = 'Show interactions';
                container.appendChild(checkbox);
                container.appendChild(label);
                this.detailsViewer.parentElement.insertBefore(container, this.detailsViewer);
                checkbox.addEventListener('change', () => this.updateInteractionVisibility());
                this.interactionToggle = checkbox;
            } else {
                this.interactionToggle.checked = true;
                if (this.interactionToggle.parentElement) {
                    this.interactionToggle.parentElement.style.display = 'block';
                }
            }
        } else if (this.interactionToggle?.parentElement) {
            this.interactionToggle.parentElement.style.display = 'none';
        }

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
                            // Show overall protein as light grey cartoon
                            viewer.setStyle({}, { cartoon: { color: 'lightgrey' } });
                            const ligandSel = {
                                chain: molecule.labelAsymId,
                                resi: parseInt(molecule.authSeqId, 10)
                            };
                            const pocketSel = { within: { distance: 5, sel: ligandSel } };
                            // Surrounding residues as element-coloured sticks
                            viewer.setStyle(pocketSel, {
                                stick: { radius: 0.15, colorscheme: 'element' }
                            });
                            // Ligand in ball-and-stick with element colouring
                            viewer.setStyle(ligandSel, {
                                stick: { radius: 0.2, colorscheme: 'element' },
                                sphere: { scale: 0.3, colorscheme: 'element' }
                            });
                            // Transparent surface around binding pocket
                            viewer.addSurface($3Dmol.SurfaceType.MS,
                                { opacity: 0.6, color: 'white' },
                                pocketSel
                            );
                            viewer.zoomTo(ligandSel);
                            viewer.render();
                            this.viewer = viewer;
                            if (this.interactionToggle) {
                                ApiService.getLigandInteractions(
                                    molecule.pdbId,
                                    molecule.labelAsymId,
                                    molecule.authSeqId
                                )
                                    .then(data => this.renderInteractions(data, molecule))
                                    .catch(err => console.error('Interaction fetch error:', err));
                            }
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
                    viewer.setStyle({}, {
                        stick: { radius: 0.2, colorscheme: 'element' },
                        sphere: { scale: 0.3, colorscheme: 'element' }
                    });
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
        this.clearInteractions();
    }

    renderInteractions(data, molecule) {
        if (!this.viewer || !data) return;
        const pdbId = Object.keys(data)[0];
        const chain = molecule.labelAsymId;
        const res = String(molecule.authSeqId);
        const entries = data?.[pdbId]?.[chain]?.[res] || [];
        entries.forEach(inter => {
            const ligandAtom = inter?.ligand_atom?.atom || inter?.ligand_atom || inter?.atom;
            const partnerChain = inter?.partner_chain || inter?.chain_id || inter?.partner?.chain_id;
            const partnerRes = parseInt(
                inter?.partner_residue_number || inter?.residue_number || inter?.partner?.residue_number,
                10
            );
            const partnerAtom = inter?.partner_atom || inter?.atom2 || inter?.partner?.atom;
            const [a1] = this.viewer.getModel().selectedAtoms({ chain, resi: parseInt(res, 10), atom: ligandAtom });
            const [a2] = this.viewer.getModel().selectedAtoms({ chain: partnerChain, resi: partnerRes, atom: partnerAtom });
            if (a1 && a2) {
                const shape = this.viewer.addCylinder({
                    start: { x: a1.x, y: a1.y, z: a1.z },
                    end: { x: a2.x, y: a2.y, z: a2.z },
                    radius: 0.1,
                    color: 'magenta',
                    dashed: true
                });
                this.interactionShapes.push(shape);
            }
        });
        this.updateInteractionVisibility();
    }

    updateInteractionVisibility() {
        const visible = !this.interactionToggle || this.interactionToggle.checked;
        this.interactionShapes.forEach(shape => {
            shape.hidden = !visible;
        });
        if (this.viewer?.render) this.viewer.render();
    }

    clearInteractions() {
        if (this.viewer && this.interactionShapes.length) {
            this.interactionShapes.forEach(shape => {
                if (this.viewer.removeShape) {
                    this.viewer.removeShape(shape);
                } else {
                    shape.hidden = true;
                }
            });
            if (this.viewer.render) this.viewer.render();
        }
        this.interactionShapes = [];
    }
}

export default LigandDetails;

