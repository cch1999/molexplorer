// Molecule Manager Class
class MoleculeManager {
    constructor() {
        this.molecules = [
            { code: 'HEM', status: 'pending' },
            { code: 'NAD', status: 'pending' },
            { code: 'FAD', status: 'pending' },
            { code: 'COA', status: 'pending' },
            { code: 'ATP', status: 'pending' },
            { code: 'ADP', status: 'pending' },
            { code: '355', status: 'pending' },
            { code: 'MPV', status: 'pending' },
            { code: 'YQD', status: 'pending' },
            { code: 'J9N', status: 'pending' }
        ];
        this.grid = null;
        this.loadingIndicator = null;
    }

    // Initialize the manager with DOM elements
    init() {
        this.grid = document.getElementById('molecule-grid');
        this.loadingIndicator = document.querySelector('.loading-indicator');
        return this;
    }

    // Add a new molecule to the list
    addMolecule(code) {
        // Check if molecule already exists
        if (this.molecules.find(mol => mol.code === code)) {
            console.warn(`Molecule ${code} already exists`);
            return false;
        }

        this.molecules.push({ code: code, status: 'pending' });
        this.loadMolecule(code);
        return true;
    }

    // Remove a molecule from the list and DOM
    removeMolecule(code) {
        const index = this.molecules.findIndex(mol => mol.code === code);
        if (index === -1) {
            console.warn(`Molecule ${code} not found`);
            return false;
        }

        // Remove from array
        this.molecules.splice(index, 1);

        // Remove from DOM
        const card = document.querySelector(`[data-molecule-code="${code}"]`);
        if (card) {
            card.remove();
        }

        return true;
    }

    // Get molecule by code
    getMolecule(code) {
        return this.molecules.find(mol => mol.code === code);
    }

    // Update molecule status
    updateMoleculeStatus(code, status) {
        const molecule = this.getMolecule(code);
        if (molecule) {
            molecule.status = status;
        }
    }

    // Get all molecules
    getAllMolecules() {
        return [...this.molecules];
    }

    // Load all pending molecules
    async loadAllMolecules() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }

        for (const molecule of this.molecules) {
            if (molecule.status === 'pending') {
                await this.loadMolecule(molecule.code);
            }
        }

        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    // Load a single molecule
    async loadMolecule(code) {
        try {
            this.updateMoleculeStatus(code, 'loading');
            const response = await fetch(`https://files.rcsb.org/ligands/view/${code}_ideal.sdf`);

            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Ligand ${code} not found.`);
                    this.updateMoleculeStatus(code, 'not_found');
                    this.createNotFoundCard(code);
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const sdfData = await response.text();
            this.updateMoleculeStatus(code, 'loaded');
            this.createMoleculeCard(sdfData, code);
        } catch (error) {
            console.error(`Could not fetch or process data for ${code}:`, error);
            this.updateMoleculeStatus(code, 'error');
            this.createNotFoundCard(code, "Failed to load");
        }
    }

    // Create molecule card
    createMoleculeCard(sdfData, ligandCode) {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ligandCode);

        // Add drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋯';
        card.appendChild(dragHandle);

        // Add delete button
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>';
        deleteBtn.title = `Delete ${ligandCode}`;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.confirmDelete(ligandCode);
        });
        card.appendChild(deleteBtn);

        const title = document.createElement('h3');
        title.textContent = ligandCode;
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
            this.showMoleculeDetails(ligandCode, sdfData);
        });
        card.appendChild(title);

        const viewerContainer = document.createElement('div');
        viewerContainer.id = `viewer-${ligandCode}`;
        viewerContainer.className = 'viewer-container';
        card.appendChild(viewerContainer);

        // Add drag event listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);

        this.grid.appendChild(card);

        // Wait a bit for the DOM to be ready
        setTimeout(() => {
            try {
                const viewer = $3Dmol.createViewer(viewerContainer, {
                    backgroundColor: 'white'
                });
                viewer.addModel(sdfData, 'sdf');
                viewer.setStyle({}, { stick: {} });
                viewer.setStyle({ elem: 'H' }, {}); // Hide hydrogen atoms
                viewer.zoomTo();
                viewer.render();
            } catch (e) {
                console.error(`Error initializing 3Dmol viewer for ${ligandCode}:`, e);
                viewerContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Render Error</p>';
            }
        }, 100);
    }

    // Create not found card
    createNotFoundCard(ligandCode, message = "Not found") {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ligandCode);

        // Add drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋯';
        card.appendChild(dragHandle);

        // Add delete button
        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>';
        deleteBtn.title = `Delete ${ligandCode}`;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.confirmDelete(ligandCode);
        });
        card.appendChild(deleteBtn);

        const content = document.createElement('div');
        content.innerHTML = `<h3>${ligandCode}</h3><p>${message}</p>`;

        // Make title clickable
        const title = content.querySelector('h3');
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
            this.showMoleculeDetails(ligandCode, null);
        });

        card.appendChild(content);

        // Add drag event listeners
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);

        this.grid.appendChild(card);
    }

    // Confirm delete with user
    confirmDelete(code) {
        if (confirm(`Are you sure you want to delete molecule ${code}?`)) {
            const success = this.removeMolecule(code);
            if (success) {
                showNotification(`Molecule ${code} deleted`, 'success');
            } else {
                showNotification(`Failed to delete molecule ${code}`, 'error');
            }
        }
    }

    // Clear all molecules
    clearAll() {
        this.molecules = [];
        if (this.grid) {
            this.grid.innerHTML = '<div class="loading-indicator">Loading molecules...</div>';
            this.loadingIndicator = this.grid.querySelector('.loading-indicator');
        }
    }

    // Reload all molecules
    async reloadAll() {
        this.clearAll();
        await this.loadAllMolecules();
    }

    // Show molecule details in a modal
    showMoleculeDetails(ligandCode, sdfData) {
        const modal = document.getElementById('molecule-details-modal');
        const detailsTitle = document.getElementById('details-title');
        const detailsCode = document.getElementById('details-code');
        const detailsSource = document.getElementById('details-source');
        const detailsType = document.getElementById('details-type');
        const detailsViewer = document.getElementById('details-viewer-container');
        const detailsJSON = document.getElementById('details-json');

        // Update basic information
        detailsTitle.textContent = `Molecule Details: ${ligandCode}`;
        detailsCode.textContent = ligandCode;

        // Get molecule info
        const molecule = this.getMolecule(ligandCode);
        const isAminoAcid = ['ALA', 'ARG', 'ASN', 'ASP', 'CYS', 'GLN', 'GLU', 'GLY', 'HIS', 'ILE', 'LEU', 'LYS', 'MET', 'PHE', 'PRO', 'SER', 'THR', 'TRP', 'TYR', 'VAL'].includes(ligandCode);

        detailsSource.textContent = isAminoAcid ? 'building_blocks' : 'reagents';
        detailsType.textContent = isAminoAcid ? 'building_block' : 'reagent';

        // Clear and setup 3D viewer
        detailsViewer.innerHTML = '<p>Loading structure...</p>';

        if (sdfData) {
            setTimeout(() => {
                try {
                    const viewer = $3Dmol.createViewer(detailsViewer, {
                        backgroundColor: 'white',
                        width: '100%',
                        height: '100%'
                    });
                    viewer.addModel(sdfData, 'sdf');
                    viewer.setStyle({}, { stick: { radius: 0.2 }, sphere: { scale: 0.3 } });
                    viewer.setStyle({ elem: 'H' }, {}); // Hide hydrogen atoms
                    viewer.zoomTo();
                    viewer.render();
                } catch (e) {
                    console.error(`Error initializing details viewer for ${ligandCode}:`, e);
                    detailsViewer.innerHTML = '<p style="color: #666;">Structure rendering error</p>';
                }
            }, 100);
        } else {
            detailsViewer.innerHTML = '<p style="color: #666;">Structure data not available</p>';
        }

        // Update JSON representation
        const jsonData = {
            molecule_id: `mol_${ligandCode.toLowerCase()}`,
            ccd_code: ligandCode,
            source: isAminoAcid ? 'building_blocks' : 'reagents',
            type: isAminoAcid ? 'building_block' : 'reagent',
            structure_data: sdfData ? sdfData.substring(0, 100) + '...' : 'N/A',
            properties: {
                molecular_weight: null,
                formula: null,
                status: molecule ? molecule.status : 'unknown'
            }
        };

        detailsJSON.textContent = JSON.stringify(jsonData, null, 2);

        // Show modal
        modal.style.display = 'block';

        // Clear any cached data from previous molecule views
        this.clearPreviousModalData();

        // Load similar ligands and PDB entries
        this.loadSimilarLigands(ligandCode);
        this.loadPDBEntries(ligandCode);
    }

    // Clear any cached data from previous molecule modal views
    clearPreviousModalData() {
        // Clear similar ligands data
        this.currentSimilarLigands = [];
        const similarTable = document.getElementById('similar-ligands-table');
        const similarTbody = document.getElementById('similar-ligands-tbody');
        const similarContainer = document.getElementById('similar-ligands-container');
        const addAllBtn = document.getElementById('add-all-similar-btn');

        if (similarTable) similarTable.style.display = 'none';
        if (similarTbody) similarTbody.innerHTML = '';
        if (similarContainer) similarContainer.innerHTML = '<p>Loading similar ligands...</p>';
        if (addAllBtn) addAllBtn.style.display = 'none';

        // Clear PDB entries data
        const pdbTable = document.getElementById('pdb-entries-table-container');
        const pdbTbody = document.getElementById('pdb-entries-tbody');
        const pdbContainer = document.getElementById('pdb-entries-container');

        if (pdbTable) {
            pdbTable.style.display = 'none';
            // Remove any existing notes
            const existingNotes = pdbTable.querySelectorAll('p[style*="font-size: 12px"]');
            existingNotes.forEach(note => note.remove());
        }
        if (pdbTbody) pdbTbody.innerHTML = '';
        if (pdbContainer) pdbContainer.innerHTML = '<p>Loading PDB entries...</p>';
    }

    // Load similar ligands from PDBe API
    async loadSimilarLigands(ligandCode) {
        const container = document.getElementById('similar-ligands-container');
        const table = document.getElementById('similar-ligands-table');
        const tbody = document.getElementById('similar-ligands-tbody');
        const addAllBtn = document.getElementById('add-all-similar-btn');

        // Store similar ligands for "Add all" functionality
        this.currentSimilarLigands = [];

        try {
            container.innerHTML = '<p>Loading similar ligands...</p>';
            table.style.display = 'none';
            addAllBtn.style.display = 'none';

            const response = await fetch(`https://www.ebi.ac.uk/pdbe/graph-api/compound/similarity/${ligandCode}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const ligandData = data[ligandCode];

            if (!ligandData || (!ligandData[0]?.stereoisomers?.length && !ligandData[0]?.same_scaffold?.length && !ligandData[0]?.similar_ligands?.length)) {
                container.innerHTML = '<div class="no-similar-ligands">No similar ligands found</div>';
                return;
            }

            // Clear previous results
            tbody.innerHTML = '';
            this.currentSimilarLigands = [];

            const ligandInfo = ligandData[0];

            // Add stereoisomers
            if (ligandInfo.stereoisomers && ligandInfo.stereoisomers.length > 0) {
                ligandInfo.stereoisomers.forEach(ligand => {
                    const row = this.createSimilarLigandRow('stereoisomer', ligand);
                    tbody.appendChild(row);
                    this.currentSimilarLigands.push(ligand);
                });
            }

            // Add same scaffold ligands
            if (ligandInfo.same_scaffold && ligandInfo.same_scaffold.length > 0) {
                ligandInfo.same_scaffold.forEach(ligand => {
                    const row = this.createSimilarLigandRow('scaffold', ligand);
                    tbody.appendChild(row);
                    this.currentSimilarLigands.push(ligand);
                });
            }

            // Add similar ligands (>60% similarity)
            if (ligandInfo.similar_ligands && ligandInfo.similar_ligands.length > 0) {
                ligandInfo.similar_ligands.forEach(ligand => {
                    const row = this.createSimilarLigandRow('similar', ligand);
                    tbody.appendChild(row);
                    this.currentSimilarLigands.push(ligand);
                });
            }

            // Show table and add all button
            container.style.display = 'none';
            table.style.display = 'table';

            if (this.currentSimilarLigands.length > 0) {
                addAllBtn.style.display = 'inline-block';
                addAllBtn.textContent = `Add All (${this.currentSimilarLigands.length})`;

                // Remove existing event listeners and add new one
                addAllBtn.replaceWith(addAllBtn.cloneNode(true));
                const newAddAllBtn = document.getElementById('add-all-similar-btn');
                newAddAllBtn.addEventListener('click', () => this.addAllSimilarLigands());
            }

        } catch (error) {
            console.error(`Error fetching similar ligands for ${ligandCode}:`, error);

            // For now, show a placeholder with some example data to demonstrate the feature
            container.innerHTML = '<div class="no-similar-ligands">Similar ligands feature temporarily unavailable due to CORS restrictions. <br><small>In production, this would be handled via a backend proxy.</small></div>';

            // Optionally show demo data for ATP as an example
            if (ligandCode === 'ATP') {
                this.showDemoSimilarLigands();
            }
        }
    }

    // Add all similar ligands to the database
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
                const success = this.addMolecule(ligand.chem_comp_id);
                if (success) {
                    addedCount++;
                } else {
                    skippedCount++;
                }

                // Show final notification when all are processed
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

                    // Re-enable button
                    addAllBtn.disabled = false;
                    addAllBtn.textContent = `Add All (${this.currentSimilarLigands.length})`;
                }
            }, index * 100); // Stagger the additions to avoid overwhelming the UI
        });
    }

    // Create a table row for similar ligand
    createSimilarLigandRow(type, ligand) {
        const row = document.createElement('tr');

        // 2D Structure image
        const imageCell = document.createElement('td');
        imageCell.className = 'structure-2d';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'loading';
        imageContainer.textContent = 'Loading...';
        imageCell.appendChild(imageContainer);

        // Load 2D structure image
        this.load2DStructure(ligand.chem_comp_id, imageContainer);

        // Type badge
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

        // CCD Code (clickable)
        const codeCell = document.createElement('td');
        const codeSpan = document.createElement('span');
        codeSpan.className = 'ccd-code';
        codeSpan.textContent = ligand.chem_comp_id;
        codeSpan.title = `Click to add ${ligand.chem_comp_id} to database`;
        codeSpan.addEventListener('click', () => {
            const success = moleculeManager.addMolecule(ligand.chem_comp_id);
            if (success) {
                showNotification(`Adding molecule ${ligand.chem_comp_id}...`, 'success');
            } else {
                showNotification(`Molecule ${ligand.chem_comp_id} already exists`, 'info');
            }
        });
        codeCell.appendChild(codeSpan);

        // Name
        const nameCell = document.createElement('td');
        nameCell.className = 'ligand-name';
        nameCell.textContent = ligand.name || 'N/A';

        // Match info (substructure match or similarity score)
        const matchCell = document.createElement('td');
        matchCell.className = 'match-info';

        if (ligand.similarity_score) {
            // For similar ligands, show similarity score as percentage
            const score = Math.round(ligand.similarity_score * 100);
            matchCell.textContent = `${score}% similarity`;
        } else if (ligand.substructure_match && ligand.substructure_match.length > 0) {
            // For scaffold matches, show substructure match
            matchCell.textContent = ligand.substructure_match.join(', ');
        } else {
            matchCell.textContent = '-';
        }

        row.appendChild(imageCell);
        row.appendChild(typeCell);
        row.appendChild(codeCell);
        row.appendChild(nameCell);
        row.appendChild(matchCell);

        return row;
    }

    // Load 2D structure image from PDBe static files
    async load2DStructure(ligandCode, container) {
        try {
            // PDBe provides 2D structure images at this static endpoint
            // Format: https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/{code}_200.svg
            const imageUrl = `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${ligandCode.toUpperCase()}_200.svg`;

            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = `2D structure of ${ligandCode}`;

            img.onload = () => {
                container.innerHTML = '';
                container.appendChild(img);
            };

            img.onerror = () => {
                // Try with lowercase code as fallback
                const altImageUrl = `https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/${ligandCode.toLowerCase()}_200.svg`;
                const altImg = document.createElement('img');
                altImg.src = altImageUrl;
                altImg.alt = `2D structure of ${ligandCode}`;

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
            console.error(`Error loading 2D structure for ${ligandCode}:`, error);
            container.className = 'error';
            container.textContent = 'Error';
        }
    }

    // Load PDB entries containing the ligand
    async loadPDBEntries(ligandCode) {
        const container = document.getElementById('pdb-entries-container');
        const tableContainer = document.getElementById('pdb-entries-table-container');
        const tbody = document.getElementById('pdb-entries-tbody');

        try {
            // Clear all previous content completely
            container.innerHTML = '<p>Loading PDB entries...</p>';
            tbody.innerHTML = ''; // Clear table body
            tableContainer.style.display = 'none';

            // Remove any existing notes from previous searches
            const existingNotes = tableContainer.querySelectorAll('p[style*="font-size: 12px"]');
            existingNotes.forEach(note => note.remove());

            // Fetch PDB entries containing this ligand
            const response = await fetch(`https://www.ebi.ac.uk/pdbe/graph-api/compound/in_pdb/${ligandCode}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const pdbIds = data[ligandCode];

            if (!pdbIds || pdbIds.length === 0) {
                container.innerHTML = '<div class="no-pdb-entries">No PDB entries found containing this ligand</div>';
                return;
            }

            // Clear previous results
            tbody.innerHTML = '';

            // Limit to first 10 entries to avoid overwhelming the UI
            const limitedPdbIds = pdbIds.slice(0, 10);

            console.log(`Found ${pdbIds.length} PDB entries for ${ligandCode}, showing first ${limitedPdbIds.length}`);

            // Create table rows with detailed info from RCSB PDB REST API
            for (const pdbId of limitedPdbIds) {
                try {
                    const details = await this.fetchRCSBDetails(pdbId);
                    const row = this.createDetailedPDBEntryRow(pdbId, details);
                    tbody.appendChild(row);
                } catch (error) {
                    console.warn(`Failed to fetch details for ${pdbId}:`, error);
                    // Fallback to simple row
                    const row = this.createSimplePDBEntryRow(pdbId);
                    tbody.appendChild(row);
                }
            }

            // Show table and hide loading
            container.style.display = 'none';
            tableContainer.style.display = 'block';

            // Add note if we limited the results
            if (pdbIds.length > 10) {
                const note = document.createElement('p');
                note.style.fontSize = '12px';
                note.style.color = '#666';
                note.style.fontStyle = 'italic';
                note.style.marginTop = '10px';
                note.textContent = `Showing first 10 of ${pdbIds.length} PDB entries containing ${ligandCode}`;
                tableContainer.appendChild(note);
            }

        } catch (error) {
            console.error(`Error fetching PDB entries for ${ligandCode}:`, error);

            // Clear table and show error message
            tbody.innerHTML = '';
            tableContainer.style.display = 'none';
            container.innerHTML = '<div class="no-pdb-entries">PDB entries feature temporarily unavailable due to CORS restrictions. <br><small>In production, this would be handled via a backend proxy.</small></div>';

            // Show demo data for ATP as an example
            if (ligandCode === 'ATP') {
                this.showDemoPDBEntries();
            }
        }
    }

    // Fetch detailed information from RCSB PDB REST API
    async fetchRCSBDetails(pdbId) {
        try {
            const response = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${pdbId.toLowerCase()}`);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching RCSB details for PDB ${pdbId}:`, error);
            return null;
        }
    }

    // Fetch detailed information for a PDB entry (legacy method)
    async fetchPDBDetails(pdbId) {
        try {
            const response = await fetch(`https://www.ebi.ac.uk/pdbe/graph-api/pdb/summary/${pdbId}`);

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            return data[pdbId] && data[pdbId][0] ? data[pdbId][0] : null;
        } catch (error) {
            console.error(`Error fetching details for PDB ${pdbId}:`, error);
            return null;
        }
    }

    // Create a detailed table row for PDB entry with RCSB data
    createDetailedPDBEntryRow(pdbId, details) {
        const row = document.createElement('tr');

        // PDB ID (clickable)
        const idCell = document.createElement('td');
        const idSpan = document.createElement('span');
        idSpan.className = 'pdb-id';
        idSpan.textContent = pdbId.toUpperCase();
        idSpan.title = `Click to view ${pdbId.toUpperCase()} on RCSB PDB`;
        idSpan.addEventListener('click', () => {
            window.open(`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`, '_blank');
        });
        idCell.appendChild(idSpan);

        // Title
        const titleCell = document.createElement('td');
        titleCell.className = 'pdb-title';
        if (details && details.struct && details.struct.title) {
            titleCell.textContent = details.struct.title;
        } else {
            titleCell.textContent = 'N/A';
        }

        // Resolution
        const resolutionCell = document.createElement('td');
        resolutionCell.className = 'pdb-resolution';
        if (details && details.rcsb_entry_info && details.rcsb_entry_info.resolution_combined && details.rcsb_entry_info.resolution_combined.length > 0) {
            resolutionCell.textContent = `${details.rcsb_entry_info.resolution_combined[0].toFixed(2)}`;
        } else {
            resolutionCell.textContent = 'N/A';
        }

        // Release date
        const dateCell = document.createElement('td');
        dateCell.className = 'pdb-date';
        if (details && details.rcsb_accession_info && details.rcsb_accession_info.initial_release_date) {
            const date = new Date(details.rcsb_accession_info.initial_release_date);
            dateCell.textContent = date.toLocaleDateString();
        } else {
            dateCell.textContent = 'N/A';
        }

        // View Structure buttons
        const viewCell = document.createElement('td');
        viewCell.className = 'view-buttons-cell';

        // RCSB PDB button
        const rcsbButton = document.createElement('button');
        rcsbButton.textContent = 'RCSB PDB';
        rcsbButton.className = 'view-structure-btn rcsb-btn';
        rcsbButton.title = `View ${pdbId.toUpperCase()} on RCSB PDB`;
        rcsbButton.addEventListener('click', () => {
            window.open(`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`, '_blank');
        });

        // PDBe button
        const pdbeButton = document.createElement('button');
        pdbeButton.textContent = 'PDBe';
        pdbeButton.className = 'view-structure-btn pdbe-btn';
        pdbeButton.title = `View ${pdbId.toUpperCase()} on PDBe`;
        pdbeButton.addEventListener('click', () => {
            window.open(`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbId.toLowerCase()}`, '_blank');
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

    // Create a simple table row for PDB entry (without detailed info)
    createSimplePDBEntryRow(pdbId) {
        const row = document.createElement('tr');

        // PDB ID (clickable)
        const idCell = document.createElement('td');
        const idSpan = document.createElement('span');
        idSpan.className = 'pdb-id';
        idSpan.textContent = pdbId.toUpperCase();
        idSpan.title = `Click to view ${pdbId.toUpperCase()} on RCSB PDB`;
        idSpan.addEventListener('click', () => {
            window.open(`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`, '_blank');
        });
        idCell.appendChild(idSpan);

        // Fill empty cells for simple fallback
        const titleCell = document.createElement('td');
        titleCell.textContent = 'Loading...';
        titleCell.className = 'pdb-title';

        const resolutionCell = document.createElement('td');
        resolutionCell.textContent = 'N/A';
        resolutionCell.className = 'pdb-resolution';

        const dateCell = document.createElement('td');
        dateCell.textContent = 'N/A';
        dateCell.className = 'pdb-date';

        // View Structure buttons
        const viewCell = document.createElement('td');
        viewCell.className = 'view-buttons-cell';

        // RCSB PDB button
        const rcsbButton = document.createElement('button');
        rcsbButton.textContent = 'RCSB PDB';
        rcsbButton.className = 'view-structure-btn rcsb-btn';
        rcsbButton.title = `View ${pdbId.toUpperCase()} on RCSB PDB`;
        rcsbButton.addEventListener('click', () => {
            window.open(`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`, '_blank');
        });

        // PDBe button
        const pdbeButton = document.createElement('button');
        pdbeButton.textContent = 'PDBe';
        pdbeButton.className = 'view-structure-btn pdbe-btn';
        pdbeButton.title = `View ${pdbId.toUpperCase()} on PDBe`;
        pdbeButton.addEventListener('click', () => {
            window.open(`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbId.toLowerCase()}`, '_blank');
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

    // Create a table row for PDB entry
    createPDBEntryRow(pdbId, details) {
        const row = document.createElement('tr');

        // PDB ID (clickable)
        const idCell = document.createElement('td');
        const idSpan = document.createElement('span');
        idSpan.className = 'pdb-id';
        idSpan.textContent = pdbId.toUpperCase();
        idSpan.title = `View ${pdbId.toUpperCase()} on RCSB PDB`;
        idSpan.addEventListener('click', () => {
            window.open(`https://www.rcsb.org/structure/${pdbId.toUpperCase()}`, '_blank');
        });
        idCell.appendChild(idSpan);

        // Title
        const titleCell = document.createElement('td');
        titleCell.className = 'pdb-title';
        titleCell.textContent = details.title || 'N/A';

        // Resolution
        const resolutionCell = document.createElement('td');
        resolutionCell.className = 'pdb-resolution';
        if (details.resolution && details.resolution.length > 0) {
            resolutionCell.textContent = `${details.resolution[0].toFixed(2)}`;
        } else {
            resolutionCell.textContent = 'N/A';
        }

        // Release date
        const dateCell = document.createElement('td');
        dateCell.className = 'pdb-date';
        if (details.release_date) {
            const date = new Date(details.release_date);
            dateCell.textContent = date.toLocaleDateString();
        } else {
            dateCell.textContent = 'N/A';
        }

        // Experimental method
        const methodCell = document.createElement('td');
        if (details.experimental_method && details.experimental_method.length > 0) {
            const method = details.experimental_method[0].toLowerCase();
            const methodSpan = document.createElement('span');
            methodSpan.className = 'pdb-method';

            // Add specific class based on method type
            if (method.includes('x-ray') || method.includes('diffraction')) {
                methodSpan.classList.add('method-xray');
            } else if (method.includes('nmr')) {
                methodSpan.classList.add('method-nmr');
            } else if (method.includes('electron') || method.includes('em')) {
                methodSpan.classList.add('method-em');
            } else {
                methodSpan.classList.add('method-other');
            }

            methodSpan.textContent = details.experimental_method[0];
            methodCell.appendChild(methodSpan);
        } else {
            methodCell.textContent = 'N/A';
        }

        row.appendChild(idCell);
        row.appendChild(titleCell);
        row.appendChild(resolutionCell);
        row.appendChild(dateCell);
        row.appendChild(methodCell);

        return row;
    }

    // Show demo PDB entries for ATP when CORS fails
    showDemoPDBEntries() {
        const container = document.getElementById('pdb-entries-container');
        const tableContainer = document.getElementById('pdb-entries-table-container');
        const tbody = document.getElementById('pdb-entries-tbody');

        // Clear any existing content first
        tbody.innerHTML = '';
        const existingNotes = tableContainer.querySelectorAll('p[style*="font-size: 12px"]');
        existingNotes.forEach(note => note.remove());

        // Demo data for ATP with sample details
        const demoEntries = [
            {
                pdb_id: '1atp',
                title: 'CRYSTAL STRUCTURE OF THE TERNARY COMPLEX OF PHENYLALANYL-TRNA SYNTHETASE WITH TRNA AND A PHENYLALANYL-ADENYLATE ANALOGUE',
                resolution: 2.7,
                release_date: '1995-01-31'
            },
            {
                pdb_id: '2atp',
                title: 'ADENOSINE-5\'-TRIPHOSPHATE',
                resolution: 1.83,
                release_date: '1996-07-17'
            },
            {
                pdb_id: '3atp',
                title: 'ATP SYNTHASE',
                resolution: 2.4,
                release_date: '1999-02-24'
            },
            {
                pdb_id: '1a49',
                title: 'CRYSTAL STRUCTURE OF ADENYLYL CYCLASE',
                resolution: 2.8,
                release_date: '1998-04-15'
            },
            {
                pdb_id: '1a5u',
                title: 'ATP BINDING CASSETTE TRANSPORTER',
                resolution: 3.2,
                release_date: '1998-08-12'
            }
        ];

        tbody.innerHTML = '';

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

    // Demo function to show how similar ligands would work (for ATP example)
    showDemoSimilarLigands() {
        const container = document.getElementById('similar-ligands-container');
        const table = document.getElementById('similar-ligands-table');
        const tbody = document.getElementById('similar-ligands-tbody');

        // Sample data based on the API documentation example
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

        // Clear previous results
        tbody.innerHTML = '';

        // Add demo rows
        demoData.forEach(ligand => {
            const row = this.createSimilarLigandRow(ligand.type, ligand);
            tbody.appendChild(row);
        });

        // Update container message
        container.innerHTML = '<div style="background: #e8f5e8; padding: 10px; border-radius: 4px; margin-bottom: 10px; font-size: 13px;"><strong>Demo Data:</strong> Showing sample similar ligands for ATP. In production, this would fetch real data from the PDBe API.</div>';

        // Show table
        table.style.display = 'table';
    }
}

// Global molecule manager instance
const moleculeManager = new MoleculeManager();

// Initialize when page loads
window.onload = async () => {
    moleculeManager.init();
    await moleculeManager.loadAllMolecules();
    initializeModal();
};

// Modal functionality
function initializeModal() {
    // Add Molecule Modal
    const addModal = document.getElementById('add-molecule-modal');
    const addBtn = document.getElementById('add-molecule-btn');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const confirmBtn = document.getElementById('confirm-add-btn');
    const input = document.getElementById('molecule-code');

    // Details Modal
    const detailsModal = document.getElementById('molecule-details-modal');
    const closeDetailsBtn = document.getElementById('close-details-modal');

    // Open add modal
    addBtn.addEventListener('click', () => {
        addModal.style.display = 'block';
        input.focus();
    });

    // Close add modal functions
    const closeAddModal = () => {
        addModal.style.display = 'none';
        input.value = '';
    };

    // Close details modal function
    const closeDetailsModal = () => {
        detailsModal.style.display = 'none';
    };

    closeBtn.addEventListener('click', closeAddModal);
    cancelBtn.addEventListener('click', closeAddModal);
    closeDetailsBtn.addEventListener('click', closeDetailsModal);

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === addModal) {
            closeAddModal();
        }
        if (event.target === detailsModal) {
            closeDetailsModal();
        }
    });

    // Handle Enter key in input
    input.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addMolecule();
        }
    });

    // Add molecule function
    const addMolecule = () => {
        const code = input.value.trim().toUpperCase();

        if (!code) {
            alert('Please enter a molecule code');
            return;
        }

        if (code.length > 10) {
            alert('Molecule code should be 10 characters or less');
            return;
        }

        const success = moleculeManager.addMolecule(code);
        if (success) {
            closeAddModal();
            // Show success message briefly
            showNotification(`Adding molecule ${code}...`, 'success');
        } else {
            alert(`Molecule ${code} already exists in the database`);
        }
    };

    confirmBtn.addEventListener('click', addMolecule);
}

// Simple notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        zIndex: '1001',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease'
    });

    if (type === 'success') {
        notification.style.background = '#4CAF50';
    } else if (type === 'error') {
        notification.style.background = '#f44336';
    } else {
        notification.style.background = '#6e45e2';
    }

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Legacy functions for backward compatibility (now just wrappers)
async function fetchMoleculeData(ligandCode, grid) {
    await moleculeManager.loadMolecule(ligandCode);
}

function createMoleculeCard(sdfData, ligandCode, grid) {
    moleculeManager.createMoleculeCard(sdfData, ligandCode);
}

function createNotFoundCard(ligandCode, grid, message = "Not found") {
    moleculeManager.createNotFoundCard(ligandCode, message);
}

// Drag and drop functionality
let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedElement !== this) {
        const grid = document.getElementById('molecule-grid');
        const allCards = Array.from(grid.querySelectorAll('.molecule-card'));
        const draggedIndex = allCards.indexOf(draggedElement);
        const targetIndex = allCards.indexOf(this);

        if (draggedIndex < targetIndex) {
            this.parentNode.insertBefore(draggedElement, this.nextSibling);
        } else {
            this.parentNode.insertBefore(draggedElement, this);
        }

        // Update the internal molecule order to match the DOM order
        const draggedCode = draggedElement.getAttribute('data-molecule-code');
        const targetCode = this.getAttribute('data-molecule-code');

        const molecules = moleculeManager.getAllMolecules();
        const draggedMol = molecules.find(mol => mol.code === draggedCode);
        const targetMol = molecules.find(mol => mol.code === targetCode);

        if (draggedMol && targetMol) {
            const draggedIdx = molecules.indexOf(draggedMol);
            const targetIdx = molecules.indexOf(targetMol);

            // Remove and reinsert to maintain order
            molecules.splice(draggedIdx, 1);
            molecules.splice(targetIdx, 0, draggedMol);
        }
    }

    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
}

// Expose moleculeManager globally for console access and future UI integration
window.moleculeManager = moleculeManager; 