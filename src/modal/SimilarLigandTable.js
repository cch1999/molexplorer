import ApiService from '../utils/apiService.js';
import { PD_BE_STATIC_IMAGE_BASE_URL } from '../utils/constants.js';

class SimilarLigandTable {
    constructor(moleculeManager) {
        this.moleculeManager = moleculeManager;
        this.currentSimilarLigands = [];
    }

    async load(ccdCode) {
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

export default SimilarLigandTable;

