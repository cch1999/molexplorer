import { EXCLUDED_LIGANDS, ADD_LIGAND_DELAY_MS } from '../utils/constants.js';

class BoundLigandTable {
    constructor(apiService, addMolecule, showMoleculeDetails, ligandModal) {
        this.apiService = apiService;
        this.addMolecule = addMolecule;
        this.showMoleculeDetails = showMoleculeDetails;
        this.ligandModal = ligandModal;
    }

    populateBoundLigands(pdbId) {
        const section = document.getElementById('bound-ligands-section');
        const table = document.getElementById('bound-ligands-table');
        const tableBody = document.getElementById('bound-ligands-tbody');
        const noLigandsMessage = document.getElementById('no-bound-ligands-message');
        const addAllBtn = document.getElementById('add-all-bound-btn');

        tableBody.innerHTML = '';

        this.apiService.getLigandMonomers(pdbId)
            .then(data => {
                const ligands = data[pdbId.toLowerCase()];

                if (ligands && ligands.length > 0) {
                    const significantLigands = ligands.filter(l => !EXCLUDED_LIGANDS.includes(l.chem_comp_id));
                    const ligandsToShow = significantLigands.length > 0 ? significantLigands : ligands;

                    section.style.display = 'block';
                    table.style.display = 'table';
                    noLigandsMessage.style.display = 'none';

                    ligandsToShow.forEach(ligand => {
                        const row = this.createBoundLigandRow(ligand, pdbId);
                        tableBody.appendChild(row);
                    });
                    const currentBoundLigands = ligandsToShow;
                    if (currentBoundLigands.length > 0) {
                        addAllBtn.style.display = 'inline-block';
                        addAllBtn.textContent = `Add All (${currentBoundLigands.length})`;
                        addAllBtn.onclick = () => this.addAllLigands(currentBoundLigands, 'bound', pdbId);
                    } else {
                        addAllBtn.style.display = 'none';
                    }
                } else {
                    section.style.display = 'block';
                    table.style.display = 'none';
                    noLigandsMessage.style.display = 'block';
                    addAllBtn.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching bound ligands:', error);
                section.style.display = 'block';
                table.style.display = 'none';
                noLigandsMessage.style.display = 'block';
                noLigandsMessage.textContent = 'Could not load bound ligand data.';
                addAllBtn.style.display = 'none';
                const msg = error.status && error.url
                    ? `Failed to load bound ligands (status ${error.status}) from ${error.url}`
                    : 'Failed to load bound ligand data.';
                if (typeof showNotification === 'function') {
                    showNotification(msg, 'error');
                }
            });
    }

    createBoundLigandRow(ligand, pdbId) {
        const row = document.createElement('tr');

        const imageCell = document.createElement('td');
        imageCell.className = 'structure-2d';
        const imageContainer = document.createElement('div');
        imageContainer.className = 'loading';
        imageContainer.textContent = 'Loading...';
        imageCell.appendChild(imageContainer);
        if (this.ligandModal) {
            this.ligandModal.load2DStructure(ligand.chem_comp_id, imageContainer);
        }

        const codeCell = document.createElement('td');
        const codeSpan = document.createElement('span');
        codeSpan.className = 'ccd-code';
        codeSpan.textContent = ligand.chem_comp_id;
        codeSpan.title = `Click to add ${ligand.chem_comp_id} to database`;
        codeSpan.addEventListener('click', () => {
            document.getElementById('close-pdb-details-modal').click();
            if (this.showMoleculeDetails) {
                this.showMoleculeDetails(ligand.chem_comp_id);
            }
        });
        codeCell.appendChild(codeSpan);

        const chainCell = document.createElement('td');
        chainCell.textContent = ligand.chain_id;

        const residueCell = document.createElement('td');
        residueCell.textContent = ligand.author_residue_number;

        const entityCell = document.createElement('td');
        entityCell.textContent = ligand.entity_id;

        const nameCell = document.createElement('td');
        nameCell.className = 'ligand-name';
        nameCell.textContent = ligand.chem_comp_name;
        nameCell.title = ligand.chem_comp_name;

        const addCell = document.createElement('td');
        const addButton = document.createElement('button');
        addButton.className = 'add-ligand-btn';
        addButton.innerHTML = '&#43;';
        addButton.title = `Add ${ligand.chem_comp_id} to database`;
        addButton.addEventListener('click', () => {
            const success = this.addMolecule({
                code: ligand.chem_comp_id,
                pdbId,
                labelAsymId: ligand.chain_id,
                authSeqId: ligand.author_residue_number
            });
            if (success) {
                showNotification(`Adding molecule ${ligand.chem_comp_id}...`, 'success');
            } else {
                showNotification(`Molecule ${ligand.chem_comp_id} already exists`, 'info');
            }
        });
        addCell.appendChild(addButton);

        row.appendChild(imageCell);
        row.appendChild(codeCell);
        row.appendChild(chainCell);
        row.appendChild(residueCell);
        row.appendChild(entityCell);
        row.appendChild(nameCell);
        row.appendChild(addCell);

        return row;
    }

    addAllLigands(ligandList, type, pdbId) {
        if (!ligandList || ligandList.length === 0) {
            showNotification(`No ${type} ligands to add`, 'info');
            return;
        }
        const addAllBtn = document.getElementById(`add-all-${type}-btn`);
        addAllBtn.disabled = true;
        addAllBtn.textContent = 'Adding...';
        let addedCount = 0;
        let skippedCount = 0;
        ligandList.forEach((ligand, index) => {
            setTimeout(() => {
                const success = this.addMolecule({
                    code: ligand.chem_comp_id,
                    pdbId,
                    labelAsymId: ligand.chain_id,
                    authSeqId: ligand.author_residue_number
                });
                if (success) {
                    addedCount++;
                } else {
                    skippedCount++;
                }
                if (index === ligandList.length - 1) {
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
                    addAllBtn.textContent = `Add All (${ligandList.length})`;
                }
            }, index * ADD_LIGAND_DELAY_MS);
        });
    }
}

export default BoundLigandTable;
