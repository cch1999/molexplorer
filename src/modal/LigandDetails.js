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
        this.copyBtn = document.getElementById('copy-json-btn');
        this.detailsNotes = document.getElementById('details-notes');
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

        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => {
                const text = this.detailsJSON ? this.detailsJSON.textContent : '';
                if (navigator.clipboard && text) {
                    navigator.clipboard.writeText(text).then(() => {
                        if (typeof showNotification === 'function') {
                            showNotification('JSON copied to clipboard', 'success');
                        }
                    }).catch(() => {});
                } else if (text) {
                    const area = document.createElement('textarea');
                    area.value = text;
                    document.body.appendChild(area);
                    area.select();
                    document.execCommand('copy');
                    document.body.removeChild(area);
                }
            });
        }
    }

    show(ccdCode, sdfData) {
        this.cleanupViewer();
        this.detailsTitle.textContent = `Molecule Details: ${ccdCode}`;
        this.detailsCode.textContent = ccdCode;

        const isAminoAcid = ['ALA','ARG','ASN','ASP','CYS','GLN','GLU','GLY','HIS','ILE','LEU','LYS','MET','PHE','PRO','SER','THR','TRP','TYR','VAL'].includes(ccdCode);
        this.detailsSource.textContent = isAminoAcid ? 'building_blocks' : 'reagents';
        this.detailsType.textContent = isAminoAcid ? 'building_block' : 'reagent';

          const molecule = this.moleculeManager.getMolecule ? this.moleculeManager.getMolecule(ccdCode) : null;
          const isInstance = molecule && molecule.pdbId && molecule.chainId && molecule.authorResidueNumber;
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
              if (this.detailsChain) this.detailsChain.textContent = molecule.chainId;
              if (this.detailsResidue) this.detailsResidue.textContent = molecule.authorResidueNumber;
        } else {
        if (this.detailsPdbId) this.detailsPdbId.textContent = '-';
        if (this.detailsChain) this.detailsChain.textContent = '-';
        if (this.detailsResidue) this.detailsResidue.textContent = '-';
        }

        if (this.detailsNotes) {
            const note = window.notebook?.getNote(ccdCode) || '';
            this.detailsNotes.value = note;
            this.detailsNotes.oninput = () => window.notebook?.setNoteForMolecule(ccdCode, this.detailsNotes.value);
        }

        this.detailsViewer.innerHTML = '<p>Loading structure...</p>';
        if (isInstance) {
            ApiService.getPdbFile(molecule.pdbId)
                .then(pdbData => {
                    setTimeout(() => {
                        try {
                            const bgColor = document.body?.classList?.contains('dark-mode') ? '#e0e0e0' : 'white';
                            const viewer = $3Dmol.createViewer(this.detailsViewer, {
                                backgroundColor: bgColor,
                                width: '100%',
                                height: '100%'
                            });
                            this.detailsViewer.viewer = viewer;
                            viewer.addModel(pdbData, 'pdb');
                            // Show overall protein as light grey cartoon
                            viewer.setStyle({}, { cartoon: { color: 'lightgrey' } });
              const ligandSel = {
                                  chain: molecule.chainId,
                                  resi: parseInt(molecule.authorResidueNumber, 10)
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
                    const bgColor = document.body?.classList?.contains('dark-mode') ? '#e0e0e0' : 'white';
                    const viewer = $3Dmol.createViewer(this.detailsViewer, {
                        backgroundColor: bgColor,
                        width: '100%',
                        height: '100%'
                    });
                    this.detailsViewer.viewer = viewer;
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
                  chain_id: molecule.chainId,
                  author_residue_number: molecule.authorResidueNumber
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
            this.detailsViewer.viewer = null;
        }
    }
}

export default LigandDetails;

