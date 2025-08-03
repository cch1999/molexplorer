import ApiService from '../utils/apiService.js';
import {
    PD_BE_STATIC_IMAGE_BASE_URL,
    RCSB_STRUCTURE_BASE_URL,
    PD_BE_ENTRY_BASE_URL
} from '../utils/constants.js';

class LigandModal {
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
        this.currentSimilarLigands = [];
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

        this.modal.style.display = 'block';
        this.clearPreviousModalData();
        this.loadSimilarCcds(ccdCode);
        this.loadPdbEntries(ccdCode);
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

    clearPreviousModalData() {
        this.currentSimilarLigands = [];
        const similarTable = document.getElementById('similar-ligands-table');
        const similarTbody = document.getElementById('similar-ligands-tbody');
        const similarContainer = document.getElementById('similar-ligands-container');
        const addAllBtn = document.getElementById('add-all-similar-btn');

        if (similarTable) similarTable.style.display = 'none';
        if (similarTbody) similarTbody.innerHTML = '';
        if (similarContainer) similarContainer.innerHTML = '<p>Loading similar ligands...</p>';
        if (addAllBtn) addAllBtn.style.display = 'none';

        const pdbTable = document.getElementById('pdb-entries-table-container');
        const pdbTbody = document.getElementById('pdb-entries-tbody');
        const pdbContainer = document.getElementById('pdb-entries-container');

        if (pdbTable) {
            pdbTable.style.display = 'none';
            const existingNotes = pdbTable.querySelectorAll('p[style*="font-size: 12px"]');
            existingNotes.forEach(note => note.remove());
        }
        if (pdbTbody) pdbTbody.innerHTML = '';
        if (pdbContainer) pdbContainer.innerHTML = '<p>Loading PDB entries...</p>';
    }

    async loadSimilarCcds(ccdCode) {
        const container = document.getElementById('similar-ligands-container');
        const table = document.getElementById('similar-ligands-table');
        const tbody = document.getElementById('similar-ligands-tbody');
        const addAllBtn = document.getElementById('add-all-similar-btn');

        this.currentSimilarLigands = [];

        try {
            container.innerHTML = '<p>Loading similar ligands...</p>';
            table.style.display = 'none';
            addAllBtn.style.display = 'none';

            const data = await ApiService.getSimilarCcds(ccdCode);
            const ccdData = data[ccdCode];

            if (!ccdData || (!ccdData[0]?.stereoisomers?.length && !ccdData[0]?.same_scaffold?.length && !ccdData[0]?.similar_ligands?.length)) {
                container.innerHTML = '<div class="no-similar-ligands">No similar ligands found</div>';
                return;
            }

            tbody.innerHTML = '';

            const processLigandGroup = (type, ligands) => {
                ligands.forEach(ligand => {
                    this.currentSimilarLigands.push(ligand);
                    const row = this.createSimilarLigandRow(type, ligand);
                    tbody.appendChild(row);
                });
            };

            if (ccdData[0]?.stereoisomers) processLigandGroup('stereoisomer', ccdData[0].stereoisomers);
            if (ccdData[0]?.same_scaffold) processLigandGroup('scaffold', ccdData[0].same_scaffold);
            if (ccdData[0]?.similar_ligands) processLigandGroup('similar', ccdData[0].similar_ligands);

            container.style.display = 'none';
            table.style.display = 'table';

            if (this.currentSimilarLigands.length > 0) {
                addAllBtn.style.display = 'inline-block';
                addAllBtn.textContent = `Add All (${this.currentSimilarLigands.length})`;

                addAllBtn.replaceWith(addAllBtn.cloneNode(true));
                const newAddAllBtn = document.getElementById('add-all-similar-btn');
                newAddAllBtn.addEventListener('click', () => this.addAllSimilarLigands());
            }
        } catch (error) {
            console.error(`Error fetching similar CCDs for ${ccdCode}:`, error);
            container.innerHTML = '<div class="no-similar-ligands">Similar ligands feature temporarily unavailable due to CORS restrictions. <br><small>In production, this would be handled via a backend proxy.</small></div>';
            if (ccdCode === 'ATP') {
                this.showDemoSimilarLigands();
            }
        }
    }

    addAllSimilarLigands() {
        if (!this.currentSimilarLigands || this.currentSimilarLigands.length === 0) {
            showNotification('No similar ligands to add', 'info');
            return;
        }

        const addAllBtn = document.getElementById('add-all-similar-btn');
        addAllBtn.disabled = true;
        addAllBtn.textContent = 'Adding...';

        let addedCount = 0;
        let skippedCount = 0;

        this.currentSimilarLigands.forEach((ligand, index) => {
            setTimeout(() => {
                const success = this.moleculeManager.addMolecule(ligand.chem_comp_id);
                if (success) {
                    addedCount++;
                } else {
                    skippedCount++;
                }

                if (index === this.currentSimilarLigands.length - 1) {
                    let message = '';
                    if (addedCount > 0 && skippedCount > 0) {
                        message = `Added ${addedCount} new molecules, ${skippedCount} already existed`;
                    } else if (addedCount > 0) {
                        message = `Added ${addedCount} new molecules`;
                    } else {
                        message = `All ${skippedCount} molecules already existed`;
                    }

                    showNotification(message, addedCount > 0 ? 'success' : 'info');
                    addAllBtn.disabled = false;
                    addAllBtn.textContent = `Add All (${this.currentSimilarLigands.length})`;
                }
            }, index * 100);
        });
    }

    createSimilarLigandRow(type, ligand) {
        const row = document.createElement('tr');

        const imageCell = document.createElement('td');
        imageCell.className = 'structure-2d';
        const imageContainer = document.createElement('div');
        imageContainer.className = 'loading';
        imageContainer.textContent = 'Loading...';
        imageCell.appendChild(imageContainer);
        this.load2DStructure(ligand.chem_comp_id, imageContainer);

        const typeCell = document.createElement('td');
        const typeBadge = document.createElement('span');
        typeBadge.className = `type-badge type-${type}`;
        let typeText = '';
        switch (type) {
            case 'stereoisomer':
                typeText = 'Stereoisomer';
                break;
            case 'scaffold':
                typeText = 'Same Scaffold';
                break;
            case 'similar':
                typeText = 'Similar';
                break;
        }
        typeBadge.textContent = typeText;
        typeCell.appendChild(typeBadge);

        const codeCell = document.createElement('td');
        const codeSpan = document.createElement('span');
        codeSpan.className = 'ccd-code';
        codeSpan.textContent = ligand.chem_comp_id;
        codeSpan.title = `Click to add ${ligand.chem_comp_id} to database`;
        codeSpan.addEventListener('click', () => {
            document.getElementById('close-details-modal').click();
            this.moleculeManager.showMoleculeDetails(ligand.chem_comp_id);
        });
        codeCell.appendChild(codeSpan);

        const nameCell = document.createElement('td');
        nameCell.className = 'ligand-name';
        nameCell.textContent = ligand.name || 'N/A';

        const matchCell = document.createElement('td');
        matchCell.className = 'match-info';
        if (ligand.similarity_score) {
            const score = Math.round(ligand.similarity_score * 100);
            matchCell.textContent = `${score}% similarity`;
        } else if (ligand.substructure_match && ligand.substructure_match.length > 0) {
            matchCell.textContent = ligand.substructure_match.join(', ');
        } else {
            matchCell.textContent = '-';
        }

        const addCell = document.createElement('td');
        const addButton = document.createElement('button');
        addButton.className = 'add-ligand-btn';
        addButton.innerHTML = '&#43;';
        addButton.title = `Add ${ligand.chem_comp_id} to database`;
        addButton.addEventListener('click', () => {
            const success = this.moleculeManager.addMolecule(ligand.chem_comp_id);
            if (success) {
                showNotification(`Adding molecule ${ligand.chem_comp_id}...`, 'success');
            } else {
                showNotification(`Molecule ${ligand.chem_comp_id} already exists`, 'info');
            }
        });
        addCell.appendChild(addButton);

        row.appendChild(imageCell);
        row.appendChild(typeCell);
        row.appendChild(codeCell);
        row.appendChild(nameCell);
        row.appendChild(matchCell);
        row.appendChild(addCell);
        return row;
    }

    async load2DStructure(ccdCode, container) {
        try {
            const imageUrl = `${PD_BE_STATIC_IMAGE_BASE_URL}/${ccdCode.toUpperCase()}_200.svg`;
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `2D structure of ${ccdCode}`;
            img.onload = () => {
                container.innerHTML = '';
                container.appendChild(img);
            };
            img.onerror = () => {
                const altImageUrl = `${PD_BE_STATIC_IMAGE_BASE_URL}/${ccdCode.toLowerCase()}_200.svg`;
                const altImg = document.createElement('img');
                altImg.src = altImageUrl;
                altImg.alt = `2D structure of ${ccdCode}`;
                altImg.onload = () => {
                    container.innerHTML = '';
                    container.appendChild(altImg);
                };
                altImg.onerror = () => {
                    container.className = 'error';
                    container.textContent = 'No image';
                };
            };
        } catch (error) {
            console.error(`Error loading 2D structure for ${ccdCode}:`, error);
            container.className = 'error';
            container.textContent = 'Error';
        }
    }

    async loadPdbEntries(ccdCode) {
        const container = document.getElementById('pdb-entries-container');
        const tableContainer = document.getElementById('pdb-entries-table-container');
        const tbody = document.getElementById('pdb-entries-tbody');
        try {
            container.innerHTML = '<p>Loading PDB entries...</p>';
            tbody.innerHTML = '';
            tableContainer.style.display = 'none';
            const existingNotes = tableContainer.querySelectorAll('p[style*="font-size: 12px"]');
            existingNotes.forEach(note => note.remove());
            const data = await ApiService.getPdbEntriesForCcd(ccdCode);
            const pdbIds = data[ccdCode];
            if (!pdbIds || pdbIds.length === 0) {
                container.innerHTML = '<div class="no-pdb-entries">No PDB entries found containing this CCD code</div>';
                return;
            }
            tbody.innerHTML = '';
            const limitedPdbIds = pdbIds.slice(0, 10);
            console.log(`Found ${pdbIds.length} PDB entries for ${ccdCode}, showing first ${limitedPdbIds.length}`);
            for (const pdbId of limitedPdbIds) {
                try {
                    const details = await this.moleculeManager.fetchRCSBDetails(pdbId);
                    const row = this.createDetailedPDBEntryRow(pdbId, details);
                    tbody.appendChild(row);
                } catch (error) {
                    console.warn(`Failed to fetch details for ${pdbId}:`, error);
                    const row = this.createSimplePDBEntryRow(pdbId);
                    tbody.appendChild(row);
                }
            }
            container.style.display = 'none';
            tableContainer.style.display = 'block';
            if (pdbIds.length > 10) {
                const note = document.createElement('p');
                note.style.fontSize = '12px';
                note.style.color = '#666';
                note.style.fontStyle = 'italic';
                note.style.marginTop = '10px';
                note.textContent = `Showing first 10 of ${pdbIds.length} PDB entries containing ${ccdCode}`;
                tableContainer.appendChild(note);
            }
        } catch (error) {
            console.error(`Error fetching PDB entries for ${ccdCode}:`, error);
            tbody.innerHTML = '';
            tableContainer.style.display = 'none';
            container.innerHTML = '<div class="no-pdb-entries">PDB entries feature temporarily unavailable due to CORS restrictions. <br><small>In production, this would be handled via a backend proxy.</small></div>';
            if (ccdCode === 'ATP') {
                this.showDemoPDBEntries();
            }
        }
    }

    createDetailedPDBEntryRow(pdbId, details) {
        const row = document.createElement('tr');
        const idCell = document.createElement('td');
        const idSpan = document.createElement('span');
        idSpan.className = 'pdb-id';
        idSpan.textContent = pdbId.toUpperCase();
        idSpan.title = `Click to view details for ${pdbId.toUpperCase()}`;
        idSpan.addEventListener('click', () => {
            this.moleculeManager.showPDBDetailsModal(pdbId);
        });
        idCell.appendChild(idSpan);

        const titleCell = document.createElement('td');
        titleCell.className = 'pdb-title';
        if (details && details.struct && details.struct.title) {
            titleCell.textContent = details.struct.title;
            titleCell.title = details.struct.title;
        } else {
            titleCell.textContent = 'N/A';
        }

        const resolutionCell = document.createElement('td');
        resolutionCell.className = 'pdb-resolution';
        if (details && details.rcsb_entry_info && details.rcsb_entry_info.resolution_combined && details.rcsb_entry_info.resolution_combined.length > 0) {
            resolutionCell.textContent = `${details.rcsb_entry_info.resolution_combined[0].toFixed(2)}`;
        } else {
            resolutionCell.textContent = 'N/A';
        }

        const dateCell = document.createElement('td');
        dateCell.className = 'pdb-date';
        if (details && details.rcsb_accession_info && details.rcsb_accession_info.initial_release_date) {
            const date = new Date(details.rcsb_accession_info.initial_release_date);
            dateCell.textContent = date.toLocaleDateString();
        } else {
            dateCell.textContent = 'N/A';
        }

        const viewCell = document.createElement('td');
        viewCell.className = 'view-buttons-cell';
        const rcsbButton = document.createElement('button');
        rcsbButton.textContent = 'RCSB PDB';
        rcsbButton.className = 'view-structure-btn rcsb-btn';
        rcsbButton.title = `View ${pdbId.toUpperCase()} on RCSB PDB`;
        rcsbButton.addEventListener('click', () => {
            window.open(`${RCSB_STRUCTURE_BASE_URL}/${pdbId.toUpperCase()}`, '_blank');
        });
        const pdbeButton = document.createElement('button');
        pdbeButton.textContent = 'PDBe';
        pdbeButton.className = 'view-structure-btn pdbe-btn';
        pdbeButton.title = `View ${pdbId.toUpperCase()} on PDBe`;
        pdbeButton.addEventListener('click', () => {
            window.open(`${PD_BE_ENTRY_BASE_URL}/${pdbId.toLowerCase()}`, '_blank');
        });
        viewCell.appendChild(rcsbButton);
        viewCell.appendChild(pdbeButton);

        row.appendChild(idCell);
        row.appendChild(titleCell);
        row.appendChild(resolutionCell);
        row.appendChild(dateCell);
        row.appendChild(viewCell);
        return row;
    }

    createSimplePDBEntryRow(pdbId) {
        const row = document.createElement('tr');
        const idCell = document.createElement('td');
        const idSpan = document.createElement('span');
        idSpan.className = 'pdb-id';
        idSpan.textContent = pdbId.toUpperCase();
        idSpan.title = `Click to view details for ${pdbId.toUpperCase()}`;
        idSpan.addEventListener('click', () => {
            this.moleculeManager.showPDBDetailsModal(pdbId);
        });
        idCell.appendChild(idSpan);

        const titleCell = document.createElement('td');
        titleCell.textContent = 'Loading...';
        titleCell.className = 'pdb-title';

        const resolutionCell = document.createElement('td');
        resolutionCell.textContent = 'N/A';
        resolutionCell.className = 'pdb-resolution';

        const dateCell = document.createElement('td');
        dateCell.textContent = 'N/A';
        dateCell.className = 'pdb-date';

        const viewCell = document.createElement('td');
        viewCell.className = 'view-buttons-cell';
        const rcsbButton = document.createElement('button');
        rcsbButton.textContent = 'RCSB PDB';
        rcsbButton.className = 'view-structure-btn rcsb-btn';
        rcsbButton.title = `View ${pdbId.toUpperCase()} on RCSB PDB`;
        rcsbButton.addEventListener('click', () => {
            window.open(`${RCSB_STRUCTURE_BASE_URL}/${pdbId.toUpperCase()}`, '_blank');
        });
        const pdbeButton = document.createElement('button');
        pdbeButton.textContent = 'PDBe';
        pdbeButton.className = 'view-structure-btn pdbe-btn';
        pdbeButton.title = `View ${pdbId.toUpperCase()} on PDBe`;
        pdbeButton.addEventListener('click', () => {
            window.open(`${PD_BE_ENTRY_BASE_URL}/${pdbId.toLowerCase()}`, '_blank');
        });
        viewCell.appendChild(rcsbButton);
        viewCell.appendChild(pdbeButton);

        row.appendChild(idCell);
        row.appendChild(titleCell);
        row.appendChild(resolutionCell);
        row.appendChild(dateCell);
        row.appendChild(viewCell);
        return row;
    }

    showDemoPDBEntries() {
        const container = document.getElementById('pdb-entries-container');
        const tableContainer = document.getElementById('pdb-entries-table-container');
        const tbody = document.getElementById('pdb-entries-tbody');
        tbody.innerHTML = '';
        const existingNotes = tableContainer.querySelectorAll('p[style*="font-size: 12px"]');
        existingNotes.forEach(note => note.remove());
        const demoEntries = [
            { pdb_id: '1atp', title: 'CRYSTAL STRUCTURE OF THE TERNARY COMPLEX OF PHENYLALANYL-TRNA SYNTHETASE WITH TRNA AND A PHENYLALANYL-ADENYLATE ANALOGUE', resolution: 2.7, release_date: '1995-01-31' },
            { pdb_id: '2atp', title: 'ADENOSINE-5\'-TRIPHOSPHATE', resolution: 1.83, release_date: '1996-07-17' },
            { pdb_id: '3atp', title: 'ATP SYNTHASE', resolution: 2.4, release_date: '1999-02-24' },
            { pdb_id: '1a49', title: 'CRYSTAL STRUCTURE OF ADENYLYL CYCLASE', resolution: 2.8, release_date: '1998-04-15' },
            { pdb_id: '1a5u', title: 'ATP BINDING CASSETTE TRANSPORTER', resolution: 3.2, release_date: '1998-08-12' }
        ];
        demoEntries.forEach(entry => {
            const mockDetails = {
                struct: { title: entry.title },
                rcsb_entry_info: { resolution_combined: [entry.resolution] },
                rcsb_accession_info: { initial_release_date: entry.release_date }
            };
            const row = this.createDetailedPDBEntryRow(entry.pdb_id, mockDetails);
            tbody.appendChild(row);
        });
        container.innerHTML = '<div style="background: #fff3cd; color: #856404; padding: 10px; border-radius: 4px; font-size: 12px; margin-bottom: 10px;">Demo data shown due to CORS restrictions. In production, this would show all PDB entries containing ATP.</div>';
        tableContainer.style.display = 'block';
    }

    showDemoSimilarLigands() {
        const container = document.getElementById('similar-ligands-container');
        const table = document.getElementById('similar-ligands-table');
        const tbody = document.getElementById('similar-ligands-tbody');
        const demoData = [
            {
                type: 'stereoisomer',
                chem_comp_id: 'HEJ',
                name: '9-{5-O-[(S)-hydroxy{[(R)-hydroxy(phosphonooxy)phosphoryl]oxy}phosphoryl]-beta-D-arabinofuranosyl}-9H-purin-6-amine',
                substructure_match: []
            },
            {
                type: 'scaffold',
                chem_comp_id: 'E7X',
                name: '(2~{S})-4-[[(2~{R},3~{S},4~{R},5~{R})-5-(6-aminopurin-9-yl)-3,4-bis(oxidanyl)oxolan-2-yl]methyl-(2-hydroxyethyl)amino]-2-azaniumyl-butanoate',
                substructure_match: ['N7']
            },
            {
                type: 'scaffold',
                chem_comp_id: 'ADP',
                name: 'Adenosine 5-diphosphate',
                substructure_match: ['N1', 'N3', 'N7', 'N9']
            }
        ];
        tbody.innerHTML = '';
        demoData.forEach(ligand => {
            const row = this.createSimilarLigandRow(ligand.type, ligand);
            tbody.appendChild(row);
        });
        container.innerHTML = '<div style="background: #e8f5e8; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 13px;"><strong>Demo Data:</strong> Showing sample similar ligands for ATP. In production, this would fetch real data from the PDBe API.</div>';
        table.style.display = 'table';
    }
}

export default LigandModal;
