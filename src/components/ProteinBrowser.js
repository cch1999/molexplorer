import ApiService from '../utils/apiService.js';
import {
    PD_BE_STATIC_IMAGE_BASE_URL,
    RCSB_STRUCTURE_IMAGE_BASE_URL,
    RCSB_STRUCTURE_BASE_URL,
    PD_BE_ENTRY_BASE_URL,
    CRYSTALLIZATION_AIDS
} from '../utils/constants.js';

class ProteinBrowser {
    constructor(moleculeManager) {
        this.moleculeManager = moleculeManager;
        this.searchBtn = null;
        this.searchInput = null;
        this.suggestedDropdown = null;
        this.resultsContainer = null;
        this.resultsBody = null;
        this.loadingIndicator = null;
        this.noResultsMessage = null;
        this.hideAidsToggle = null;
        this.currentProteinDetails = [];
    }

    init() {
        this.searchBtn = document.getElementById('protein-group-search-btn');
        this.searchInput = document.getElementById('protein-group-search');
        this.suggestedDropdown = document.getElementById('suggested-groups-dropdown');
        this.resultsContainer = document.getElementById('protein-results-table-container');
        this.resultsBody = document.getElementById('protein-results-tbody');
        this.loadingIndicator = document.getElementById('protein-loading-indicator');
        this.noResultsMessage = document.getElementById('no-protein-results-message');
        this.hideAidsToggle = document.getElementById('hide-aids-toggle');

        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                const groupId = this.searchInput.value.trim();
                if (groupId) {
                    this.fetchProteinGroup(groupId);
                } else {
                    showNotification('Please enter a Group ID.', 'info');
                }
            });
        }

        if (this.hideAidsToggle) {
            this.hideAidsToggle.addEventListener('change', () => {
                if (this.currentProteinDetails.length > 0) {
                    this.displayResults(this.currentProteinDetails);
                }
            });
        }

        if (this.suggestedDropdown) {
            this.suggestedDropdown.addEventListener('change', () => {
                const selected = this.suggestedDropdown.value;
                if (selected) {
                    if (this.searchInput) {
                        this.searchInput.value = selected;
                    }
                    this.fetchProteinGroup(selected);
                }
            });
        }

        return this;
    }

    async fetchProteinGroup(groupId) {
        this.loadingIndicator.style.display = 'block';
        this.resultsContainer.style.display = 'none';
        this.noResultsMessage.style.display = 'none';

        try {
            const data = await ApiService.getProteinGroup(groupId);
            const memberIds = data.rcsb_group_container_identifiers.group_member_ids;
            this.currentProteinDetails = await this.fetchMemberDetails(memberIds);
            this.displayResults(this.currentProteinDetails);
        } catch (error) {
            console.error('Error fetching protein group:', error);
            this.noResultsMessage.textContent = 'Could not fetch data for the given Group ID.';
            this.noResultsMessage.style.display = 'block';
        } finally {
            this.loadingIndicator.style.display = 'none';
        }
    }

    async fetchMemberDetails(pdbIds) {
        const details = [];
        for (const pdbId of pdbIds) {
            try {
                const data = await ApiService.getRcsbEntry(pdbId);
                details.push(data);
            } catch (error) {
                details.push({ rcsb_id: pdbId, error: 'Failed to fetch details' });
            }
        }
        return details;
    }

    async fetchBoundLigands(pdbId) {
        try {
            const data = await ApiService.getLigandMonomers(pdbId);
            return data[pdbId.toLowerCase()] || [];
        } catch (error) {
            console.error(`Error fetching bound ligands for ${pdbId}:`, error);
            return [];
        }
    }

    renderBoundLigands(ligands) {
        if (!ligands || ligands.length === 0) {
            return '<div class="bound-ligands-container"></div>';
        }
        const ligandHtml = ligands.slice(0, 5).map(ligand => `
            <div class="ligand-img-container">
                <img src="${PD_BE_STATIC_IMAGE_BASE_URL}/${ligand.chem_comp_id}_200.svg" alt="${ligand.chem_comp_id}" title="${ligand.chem_comp_id}: ${ligand.chem_comp_name}" class="bound-ligand-img">
                <div class="ligand-img-overlay">
                    <button class="ligand-action-btn add-ligand" data-ccd-code="${ligand.chem_comp_id}">+</button>
                </div>
            </div>
        `).join('');
        const moreIndicator = ligands.length > 5 ? `<span class="more-ligands-indicator" title="${ligands.length - 5} more ligands">+${ligands.length - 5}</span>` : '';
        return `<div class="bound-ligands-container">${ligandHtml}${moreIndicator}</div>`;
    }

    async displayResults(proteinDetails) {
        this.resultsBody.innerHTML = '';
        if (proteinDetails && proteinDetails.length > 0) {
            const hideAids = this.hideAidsToggle && this.hideAidsToggle.checked;
            for (const detail of proteinDetails) {
                const row = this.resultsBody.insertRow();
                const pdbId = detail.rcsb_id;
                const title = detail.struct?.title || 'N/A';
                const resolution = detail.rcsb_entry_info?.resolution_combined?.[0]?.toFixed(2) || 'N/A';
                const releaseDate = detail.rcsb_accession_info?.initial_release_date ? new Date(detail.rcsb_accession_info.initial_release_date).toLocaleDateString() : 'N/A';
                const imageUrl = `${RCSB_STRUCTURE_IMAGE_BASE_URL}/${pdbId.toLowerCase()}_assembly-1.jpeg`;

                let boundLigands = await this.fetchBoundLigands(pdbId);
                if (hideAids) {
                    boundLigands = boundLigands.filter(ligand => !CRYSTALLIZATION_AIDS.includes(ligand.chem_comp_id));
                }

                row.innerHTML = `
                    <td><img src="${imageUrl}" alt="${pdbId} thumbnail" class="protein-thumbnail"></td>
                    <td><a href="#" class="pdb-id-link" data-pdb-id="${pdbId}">${pdbId}</a></td>
                    <td>${title}</td>
                    <td>${resolution}</td>
                    <td>${releaseDate}</td>
                    <td class="bound-ligands-cell">${this.renderBoundLigands(boundLigands)}</td>
                    <td class="view-buttons-cell">
                        <button class="view-structure-btn rcsb-btn" data-pdb-id="${pdbId}">RCSB PDB</button>
                        <button class="view-structure-btn pdbe-btn" data-pdb-id="${pdbId}">PDBe</button>
                    </td>
                `;
            }

            this.resultsContainer.style.display = 'block';
            this.noResultsMessage.style.display = 'none';

            document.querySelectorAll('.pdb-id-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.moleculeManager.showPDBDetailsModal(e.target.dataset.pdbId);
                });
            });
            document.querySelectorAll('.view-structure-btn.rcsb-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    window.open(`${RCSB_STRUCTURE_BASE_URL}/${e.target.dataset.pdbId}`, '_blank');
                });
            });
            document.querySelectorAll('.view-structure-btn.pdbe-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    window.open(`${PD_BE_ENTRY_BASE_URL}/${e.target.dataset.pdbId.toLowerCase()}`, '_blank');
                });
            });
            document.querySelectorAll('.add-ligand').forEach(button => {
                button.addEventListener('click', (e) => {
                    const ccdCode = e.target.dataset.ccdCode;
                    const success = this.moleculeManager.addMolecule(ccdCode);
                    if (success) {
                        showNotification(`Adding molecule ${ccdCode}...`, 'success');
                    } else {
                        showNotification(`Molecule ${ccdCode} already exists`, 'info');
                    }
                });
            });
        } else {
            this.noResultsMessage.textContent = 'No PDB entries found in this group.';
            this.noResultsMessage.style.display = 'block';
            this.resultsContainer.style.display = 'none';
        }
    }
}

export default ProteinBrowser;
