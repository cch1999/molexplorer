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
        this.resultsCountMessage = null;
        this.loadMoreBtn = null;
        this.allPdbIds = [];
        this.totalResults = 0;
        this.currentOffset = 0;
        this.limit = 20;
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
        this.resultsCountMessage = document.getElementById('protein-results-count');
        this.loadMoreBtn = document.getElementById('protein-load-more');

        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => {
                const queryId = this.searchInput.value.trim();
                if (queryId) {
                    this.fetchProteinEntries(queryId);
                } else {
                    showNotification('Please enter a Group ID or UniProt ID.', 'info');
                }
            });
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    const queryId = this.searchInput.value.trim();
                    if (queryId) {
                        this.fetchProteinEntries(queryId);
                    } else {
                        showNotification('Please enter a Group ID or UniProt ID.', 'info');
                    }
                    this.searchInput.blur();
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
                    this.fetchProteinEntries(selected);
                }
            });
        }

        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => {
                this.loadMoreResults();
            });
        }

        return this;
    }

    async fetchProteinEntries(identifier) {
        this.loadingIndicator.style.display = 'block';
        this.resultsContainer.style.display = 'none';
        this.noResultsMessage.style.display = 'none';
        if (this.resultsCountMessage) {
            this.resultsCountMessage.style.display = 'none';
        }
        if (this.loadMoreBtn) {
            this.loadMoreBtn.style.display = 'none';
        }

        try {
            let pdbIds = [];
            if (identifier.toUpperCase().startsWith('G_')) {
                const data = await ApiService.getProteinGroup(identifier);
                pdbIds = data.rcsb_group_container_identifiers.group_member_ids;
            } else {
                pdbIds = await ApiService.getPdbEntriesForUniprot(identifier);
            }
            this.allPdbIds = pdbIds;
            this.totalResults = pdbIds.length;
            this.currentOffset = 0;
            this.currentProteinDetails = [];
            const details = await this.fetchMemberDetails(this.allPdbIds, this.limit, this.currentOffset);
            this.currentOffset += details.length;
            this.currentProteinDetails = details;
            await this.displayResults(this.currentProteinDetails);
            this.updateResultsInfo();
        } catch (error) {
            console.error('Error fetching protein entries:', error);
            this.noResultsMessage.textContent = 'Could not fetch data for the given identifier.';
            this.noResultsMessage.style.display = 'block';
            const msg = error.status && error.url
                ? `Failed to fetch protein data (status ${error.status}) from ${error.url}`
                : 'Failed to fetch protein data.';
            if (typeof showNotification === 'function') {
                showNotification(msg, 'error');
            }
        } finally {
            this.loadingIndicator.style.display = 'none';
        }
    }

    async fetchMemberDetails(pdbIds, limit = 20, offset = 0) {
        const limitedIds = pdbIds.slice(offset, offset + limit);
        const promises = limitedIds.map(async pdbId => {
            try {
                return await ApiService.getRcsbEntry(pdbId);
            } catch (error) {
                return { rcsb_id: pdbId, error: 'Failed to fetch details' };
            }
        });
        return Promise.all(promises);
    }

    async loadMoreResults() {
        if (this.currentOffset >= this.totalResults) return;
        this.loadingIndicator.style.display = 'block';
        try {
            const details = await this.fetchMemberDetails(this.allPdbIds, this.limit, this.currentOffset);
            this.currentOffset += details.length;
            this.currentProteinDetails = this.currentProteinDetails.concat(details);
            await this.displayResults(details, true);
            this.updateResultsInfo();
        } catch (error) {
            console.error('Error loading more results:', error);
            if (typeof showNotification === 'function') {
                showNotification('Failed to load more protein entries.', 'error');
            }
        } finally {
            this.loadingIndicator.style.display = 'none';
        }
    }

    updateResultsInfo() {
        if (!this.resultsCountMessage || !this.loadMoreBtn) return;
        if (this.totalResults > 0) {
            const shown = Math.min(this.currentOffset, this.totalResults);
            this.resultsCountMessage.textContent = `Showing ${shown} of ${this.totalResults} results.`;
            this.resultsCountMessage.style.display = 'block';
        } else {
            this.resultsCountMessage.style.display = 'none';
        }
        if (this.currentOffset < this.totalResults) {
            this.loadMoreBtn.style.display = 'block';
        } else {
            this.loadMoreBtn.style.display = 'none';
        }
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

    renderBoundLigands(ligands, pdbId) {
        if (!ligands || ligands.length === 0) {
            return '<div class="bound-ligands-container"></div>';
        }
        const ligandHtml = ligands
            .slice(0, 5)
            .map(
                ligand => `
            <div class="ligand-img-container">
                <img src="${PD_BE_STATIC_IMAGE_BASE_URL}/${ligand.chem_comp_id}_200.svg" alt="${ligand.chem_comp_id}" title="${ligand.chem_comp_id}: ${ligand.chem_comp_name}" class="bound-ligand-img">
                <div class="ligand-img-overlay">
                    <button class="ligand-action-btn add-ligand" data-ccd-code="${ligand.chem_comp_id}" data-pdb-id="${pdbId}" data-label-asym-id="${ligand.chain_id}" data-auth-seq-id="${ligand.author_residue_number}">+</button>
                </div>
            </div>
        `
            )
            .join('');
        const moreIndicator =
            ligands.length > 5
                ? `<span class="more-ligands-indicator" title="${ligands.length - 5} more ligands">+${ligands.length - 5}</span>`
                : '';
        return `<div class="bound-ligands-container">${ligandHtml}${moreIndicator}</div>`;
    }

    async displayResults(proteinDetails, append = false) {
        if (!append) {
            this.resultsBody.innerHTML = '';
        }
        if (proteinDetails && proteinDetails.length > 0) {
            const hideAids = this.hideAidsToggle && this.hideAidsToggle.checked;
            for (const detail of proteinDetails) {
                const row = this.resultsBody.insertRow();
                const pdbId = detail.rcsb_id;
                const title = detail.struct?.title || 'N/A';
                const resolution = detail.rcsb_entry_info?.resolution_combined?.[0]?.toFixed(2) || 'N/A';
                const releaseDate = detail.rcsb_accession_info?.initial_release_date ? new Date(detail.rcsb_accession_info.initial_release_date).toLocaleDateString() : 'N/A';
                const citation = detail.rcsb_primary_citation;
                const citationTitle = citation?.title || 'N/A';
                const citationUrl = citation?.pdbx_database_id_doi
                    ? `https://doi.org/${citation.pdbx_database_id_doi}`
                    : (citation?.pdbx_database_id_PubMed
                        ? `https://pubmed.ncbi.nlm.nih.gov/${citation.pdbx_database_id_PubMed}/`
                        : null);
                const citationHtml = citationUrl
                    ? `<a href="${citationUrl}" target="_blank">${citationTitle}</a>`
                    : citationTitle;
                const imageUrl = `${RCSB_STRUCTURE_IMAGE_BASE_URL}/${pdbId.toLowerCase()}_assembly-1.jpeg`;

                let boundLigands = await this.fetchBoundLigands(pdbId);
                if (hideAids) {
                    boundLigands = boundLigands.filter(ligand => !CRYSTALLIZATION_AIDS.includes(ligand.chem_comp_id));
                }

                row.innerHTML = `
                    <td data-label="Image"><img src="${imageUrl}" alt="${pdbId} thumbnail" class="protein-thumbnail"></td>
                    <td data-label="PDB ID"><a href="#" class="pdb-id-link" data-pdb-id="${pdbId}">${pdbId}</a></td>
                    <td data-label="Title">${title}</td>
                    <td data-label="Resolution">${resolution}</td>
                    <td data-label="Release Date">${releaseDate}</td>
                    <td data-label="Publication">${citationHtml}</td>
                    <td data-label="Bound Ligands" class="bound-ligands-cell">${this.renderBoundLigands(boundLigands, pdbId)}</td>
                    <td data-label="View Structure" class="view-buttons-cell">
                        <button class="view-structure-btn rcsb-btn" data-pdb-id="${pdbId}">RCSB PDB</button>
                        <button class="view-structure-btn pdbe-btn" data-pdb-id="${pdbId}">PDBe</button>
                    </td>
                `;

                const pdbLink = row.querySelector('.pdb-id-link');
                pdbLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.moleculeManager.showPDBDetailsModal(e.target.dataset.pdbId);
                });

                const rcsbBtn = row.querySelector('.view-structure-btn.rcsb-btn');
                rcsbBtn.addEventListener('click', (e) => {
                    window.open(`${RCSB_STRUCTURE_BASE_URL}/${e.target.dataset.pdbId}`, '_blank');
                });

                const pdbeBtn = row.querySelector('.view-structure-btn.pdbe-btn');
                pdbeBtn.addEventListener('click', (e) => {
                    window.open(`${PD_BE_ENTRY_BASE_URL}/${e.target.dataset.pdbId.toLowerCase()}`, '_blank');
                });

                row.querySelectorAll('.add-ligand').forEach(button => {
                    button.addEventListener('click', e => {
                        const { ccdCode, pdbId, authSeqId, labelAsymId } = e.currentTarget.dataset;
                        const success = this.moleculeManager.addPdbInstance({
                            code: ccdCode,
                            pdbId,
                            authSeqId,
                            labelAsymId
                        });
                        if (success) {
                            showNotification(`Adding molecule ${ccdCode}...`, 'success');
                        } else {
                            showNotification(`Molecule ${ccdCode} already exists`, 'info');
                        }
                    });
                });
            }

            this.resultsContainer.style.display = 'block';
            this.noResultsMessage.style.display = 'none';
        } else if (!append) {
            this.noResultsMessage.textContent = 'No PDB entries found in this group.';
            this.noResultsMessage.style.display = 'block';
            this.resultsContainer.style.display = 'none';
        }
    }
}

export default ProteinBrowser;
