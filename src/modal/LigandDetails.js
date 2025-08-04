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
        this.interactionsSection = document.getElementById('interactions-section');
        this.interactionsTbody = document.getElementById('interactions-tbody');
        this.noInteractionsMessage = document.getElementById('no-interactions-message');

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

        if (this.interactionsSection) {
            this.interactionsSection.style.display = isInstance ? 'block' : 'none';
        }
        if (isInstance) {
            this.loadInteractions(molecule);
        } else if (this.interactionsTbody) {
            this.interactionsTbody.innerHTML = '';
            if (this.noInteractionsMessage) this.noInteractionsMessage.style.display = 'none';
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

    loadInteractions(molecule) {
        if (!this.interactionsTbody) return;
        this.interactionsTbody.innerHTML = '';
        if (this.noInteractionsMessage) {
            this.noInteractionsMessage.style.display = 'none';
            this.noInteractionsMessage.textContent = 'No interactions found.';
        }
        ApiService.getLigandInteractions(
            molecule.pdbId,
            molecule.labelAsymId,
            molecule.authSeqId
        )
            .then(data => {
                const interactions =
                    data?.[molecule.pdbId]?.[0]?.interactions ?? [];
                if (interactions.length === 0) {
                    if (this.noInteractionsMessage)
                        this.noInteractionsMessage.style.display = 'block';
                    return;
                }
                for (const interaction of interactions) {
                    const row = document.createElement('tr');
                    const ligandAtoms = interaction.ligand_atoms?.join(', ') ?? '-';
                    const interactionType =
                        interaction.interaction_type ||
                        interaction.interaction_class ||
                        '-';
                    const residue = interaction.end
                        ? `${interaction.end.chem_comp_id || ''} ${
                              interaction.end.author_residue_number || ''
                          } (${interaction.end.chain_id || ''})`
                        : '-';
                    const atomNames =
                        interaction.end?.atom_names?.join(', ') ?? '-';
                    const details =
                        interaction.interaction_details?.join(', ') ?? '-';
                    const distance =
                        interaction.distance != null
                            ? interaction.distance.toFixed(2)
                            : '-';
                    row.innerHTML = `
                        <td>${ligandAtoms}</td>
                        <td>${interactionType}</td>
                        <td>${residue}</td>
                        <td>${atomNames}</td>
                        <td>${details}</td>
                        <td>${distance}</td>`;
                    this.interactionsTbody.appendChild(row);
                }
            })
            .catch(err => {
                console.error('Error fetching interactions:', err);
                if (this.noInteractionsMessage) {
                    this.noInteractionsMessage.textContent =
                        'Failed to load interactions.';
                    this.noInteractionsMessage.style.display = 'block';
                }
            });
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

