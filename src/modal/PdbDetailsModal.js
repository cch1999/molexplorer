import ApiService from '../utils/apiService.js';
import { RCSB_STRUCTURE_BASE_URL, PD_BE_ENTRY_BASE_URL } from '../utils/constants.js';

class PdbDetailsModal {
    constructor(boundLigandTable) {
        this.boundLigandTable = boundLigandTable;
        this.modal = document.getElementById('pdb-details-modal');
        const closeBtn = document.getElementById('close-pdb-details-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    async fetchRCSBDetails(pdbId) {
        try {
            const data = await ApiService.getRcsbEntry(pdbId);
            return data;
        } catch (error) {
            console.error(`Error fetching RCSB details for PDB ${pdbId}:`, error);
            return null;
        }
    }

    async showPDBDetailsModal(pdbId) {
        const title = document.getElementById('pdb-details-title');
        const body = document.getElementById('pdb-details-body');
        const viewerContainer = document.getElementById('pdb-viewer-container');

        title.textContent = `PDB Entry Details: ${pdbId.toUpperCase()}`;
        body.innerHTML = '<div class="properties-loading">Loading PDB entry details...</div>';
        viewerContainer.innerHTML = '';
        viewerContainer.style.display = 'none';
        this.modal.style.display = 'block';

        try {
            const details = await this.fetchRCSBDetails(pdbId);
            if (!details) {
                throw new Error('No data found for this PDB entry.');
            }

            body.innerHTML = this.createPDBDetailsHTML(details);
            if (this.boundLigandTable) {
                this.boundLigandTable.populateBoundLigands(pdbId);
            }

            document.getElementById('open-rcsb-btn').addEventListener('click', () => {
                window.open(`${RCSB_STRUCTURE_BASE_URL}/${pdbId.toUpperCase()}`, '_blank');
            });
            document.getElementById('open-pdbe-btn').addEventListener('click', () => {
                window.open(`${PD_BE_ENTRY_BASE_URL}/${pdbId.toLowerCase()}`, '_blank');
            });

            viewerContainer.style.display = 'block';
            viewerContainer.innerHTML = '<p class="properties-loading">Loading 3D structure...</p>';
            const pdbData = await ApiService.getPdbFile(pdbId);

            setTimeout(() => {
                try {
                    const isDark = document.body.classList
                        ? document.body.classList.contains('dark-mode')
                        : document.body.className.split(' ').includes('dark-mode');
                    const viewer = $3Dmol.createViewer(viewerContainer, {
                        backgroundColor: isDark ? '#bbbbbb' : 'white',
                        width: '100%',
                        height: '100%'
                    });
                    viewerContainer.viewer = viewer;
                    viewer.addModel(pdbData, 'pdb');
                    viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
                    viewer.zoomTo();
                    viewer.render();
                } catch (e) {
                    console.error('Error creating 3Dmol viewer:', e);
                    viewerContainer.innerHTML = '<div class="no-pdb-entries">Could not render 3D structure.</div>';
                }
            }, 100);
        } catch (error) {
            console.error('Error fetching PDB details:', error);
            body.innerHTML = '<div class="no-pdb-entries">Could not load details for this PDB entry.</div>';
            viewerContainer.style.display = 'none';
            const msg = error.status && error.url
                ? `Failed to load PDB details (status ${error.status}) from ${error.url}`
                : 'Failed to load PDB entry details.';
            if (typeof showNotification === 'function') {
                showNotification(msg, 'error');
            }
        }
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    createPDBDetailsHTML(data) {
        const title = data.struct?.title || 'Not available';
        const authors = data.citation?.[0]?.rcsb_authors?.join(', ') || 'Not available';
        const releaseDate = data.rcsb_accession_info?.initial_release_date ? new Date(data.rcsb_accession_info.initial_release_date).toLocaleDateString() : 'Not available';
        const resolution = data.rcsb_entry_info?.resolution_combined?.[0]?.toFixed(2) ? `${data.rcsb_entry_info.resolution_combined[0].toFixed(2)} Å` : 'N/A';
        const method = data.exptl?.[0]?.method || 'N/A';
        const organism = data.entity_src_gen?.[0]?.pdbx_host_org_scientific_name || 'Not available';
        const pdbId = data.rcsb_id;

        return `
            <div class="details-section" style="padding-bottom: 0;">
                <div class="pdb-details-grid" style="grid-template-columns: repeat(5, 1fr);">
                    <div class="pdb-info-item">
                        <div class="pdb-info-label">PDB ID</div>
                        <div class="pdb-info-value">${pdbId.toUpperCase()}</div>
                    </div>
                    <div class="pdb-info-item">
                        <div class="pdb-info-label">Organism</div>
                        <div class="pdb-info-value">${organism}</div>
                    </div>
                    <div class="pdb-info-item">
                        <div class="pdb-info-label">Method</div>
                        <div class="pdb-info-value">${method}</div>
                    </div>
                    <div class="pdb-info-item">
                        <div class="pdb-info-label">Resolution</div>
                        <div class="pdb-info-value">${resolution}</div>
                    </div>
                    <div class="pdb-info-item">
                        <div class="pdb-info-label">Release Date</div>
                        <div class="pdb-info-value">${releaseDate}</div>
                    </div>
                </div>
            </div>
            <div class="details-section" style="padding-top: 0;">
                 <div class="pdb-details-grid">
                    <div class="pdb-info-item" style="grid-column: 1 / -1;">
                        <div class="pdb-info-label">Title</div>
                        <div class="pdb-info-value" title="${title}">${title}</div>
                    </div>
                    <div class="pdb-info-item" style="grid-column: 1 / -1;">
                        <div class="pdb-info-label">Authors</div>
                        <div class="pdb-info-value">${authors}</div>
                    </div>
                </div>
                <div class="pdb-external-links">
                    <button id="open-rcsb-btn" class="view-structure-btn rcsb-btn">RCSB PDB</button>
                    <button id="open-pdbe-btn" class="view-structure-btn pdbe-btn">PDBe</button>
                </div>
            </div>
            <div class="details-section">
                <h4>Interactive Molecular Structure</h4>
            </div>
        `;
    }
}

export default PdbDetailsModal;
