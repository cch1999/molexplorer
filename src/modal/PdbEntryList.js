import ApiService from '../utils/apiService.js';
import { RCSB_STRUCTURE_BASE_URL, PD_BE_ENTRY_BASE_URL } from '../utils/constants.js';

class PdbEntryList {
    constructor(moleculeManager) {
        this.moleculeManager = moleculeManager;
    }

    async load(ccdCode) {
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
}

export default PdbEntryList;

