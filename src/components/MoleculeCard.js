import ApiService from '../utils/apiService.js';

class MoleculeCard {
    constructor(grid, repository, callbacks = {}) {
        this.grid = grid;
        this.repository = repository;
        this.onDelete = callbacks.onDelete;
        this.onShowDetails = callbacks.onShowDetails;
        this.draggedElement = null;
    }

    createMoleculeCardFromSmiles(smiles, ccdCode, id = ccdCode) {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ccdCode);
        card.setAttribute('data-molecule-id', id);

        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋯';
        card.appendChild(dragHandle);

        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>';
        deleteBtn.title = `Delete ${ccdCode}`;
        deleteBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (this.onDelete) this.onDelete(ccdCode);
        });
        card.appendChild(deleteBtn);

        const downloadBtn = document.createElement('div');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7Z"/></svg>';
        downloadBtn.title = `Download ${ccdCode} as SDF`;
        downloadBtn.addEventListener('click', e => {
            e.stopPropagation();
            this.downloadSdf(ccdCode);
        });
        card.appendChild(downloadBtn);

        const codeLabel = document.createElement('div');
        codeLabel.className = 'molecule-code';
        codeLabel.textContent = ccdCode;
        card.appendChild(codeLabel);

        const viewerContainer = document.createElement('div');
        viewerContainer.className = 'molecule-viewer';
        viewerContainer.id = `viewer-${ccdCode}`;
        card.appendChild(viewerContainer);

        const smilesLabel = document.createElement('div');
        smilesLabel.className = 'smiles-label';
        smilesLabel.textContent = `SMILES: ${smiles}`;
        card.appendChild(smilesLabel);

        this.grid.appendChild(card);
        this.renderSmilesIn2D(smiles, viewerContainer);
        this.addDragEvents(card);
    }

    renderSmilesIn2D(smiles, container) {
        container.innerHTML = `
            <div class="smiles-placeholder">
                <div style="text-align:center;padding:10px;">
                    <div style="font-size:24px;margin-bottom:5px;">🧪</div>
                    <div class="label">SMILES</div>
                </div>
            </div>
        `;
    }

    createMoleculeCard(data, ccdCode, format = 'sdf', id = ccdCode) {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ccdCode);
        card.setAttribute('data-molecule-id', id);

        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋯';
        card.appendChild(dragHandle);

        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>';
        deleteBtn.title = `Delete ${ccdCode}`;
        deleteBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (this.onDelete) this.onDelete(ccdCode);
        });
        card.appendChild(deleteBtn);

        const downloadBtn = document.createElement('div');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7Z"/></svg>';
        downloadBtn.title = `Download ${ccdCode} as SDF`;
        downloadBtn.addEventListener('click', e => {
            e.stopPropagation();
            this.downloadSdf(ccdCode, data);
        });
        card.appendChild(downloadBtn);

        const title = document.createElement('h3');
        title.textContent = ccdCode;
        title.style.cursor = 'pointer';
        title.addEventListener('click', () => {
            if (this.onShowDetails) this.onShowDetails(ccdCode, data, format);
        });
        card.appendChild(title);

        const viewerContainer = document.createElement('div');
        viewerContainer.id = `viewer-${ccdCode}`;
        viewerContainer.className = 'viewer-container';
        card.appendChild(viewerContainer);

        this.grid.appendChild(card);
        this.addDragEvents(card);

        setTimeout(() => {
            try {
                const isDarkMode = document.body.classList.contains('dark-mode');
                const viewer = $3Dmol.createViewer(viewerContainer, { backgroundColor: isDarkMode ? '#1e1e1e' : 'white' });
                viewerContainer.viewer = viewer;
                viewer.addModel(data, format);
                viewer.setStyle({}, { stick: {} });
                viewer.setStyle({ elem: 'H' }, {});
                viewer.zoomTo();
                viewer.render();
            } catch (e) {
                console.error(`Error initializing 3Dmol viewer for ${ccdCode}:`, e);
                viewerContainer.innerHTML = '<p style="text-align:center;padding:20px;">Render Error</p>';
            }
        }, 100);
    }

    createNotFoundCard(ccdCode, message = 'Not found', id = ccdCode) {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ccdCode);
        card.setAttribute('data-molecule-id', id);

        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '⋯';
        card.appendChild(dragHandle);

        const deleteBtn = document.createElement('div');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/></svg>';
        deleteBtn.title = `Delete ${ccdCode}`;
        deleteBtn.addEventListener('click', e => {
            e.stopPropagation();
            if (this.onDelete) this.onDelete(ccdCode);
        });
        card.appendChild(deleteBtn);

        const downloadBtn = document.createElement('div');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7Z"/></svg>';
        downloadBtn.title = `Download ${ccdCode} as SDF`;
        downloadBtn.addEventListener('click', e => {
            e.stopPropagation();
            this.downloadSdf(ccdCode);
        });
        card.appendChild(downloadBtn);

        const content = document.createElement('div');
        content.className = 'not-found-content';
        content.innerHTML = `<h3>${ccdCode}</h3><p>${message}</p>`;
        card.appendChild(content);

        this.grid.appendChild(card);
        this.addDragEvents(card);
    }

    addDragEvents(card) {
        card.addEventListener('dragstart', e => this.handleDragStart(e));
        card.addEventListener('dragover', e => this.handleDragOver(e));
        card.addEventListener('drop', e => this.handleDrop(e));
        card.addEventListener('dragend', e => this.handleDragEnd(e));
    }

    handleDragStart(e) {
        this.draggedElement = e.currentTarget;
        e.currentTarget.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
    }

    handleDragOver(e) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    handleDrop(e) {
        if (e.stopPropagation) e.stopPropagation();
        if (this.draggedElement !== e.currentTarget) {
            const allCards = Array.from(this.grid.querySelectorAll('.molecule-card'));
            const draggedIndex = allCards.indexOf(this.draggedElement);
            const targetIndex = allCards.indexOf(e.currentTarget);
            if (draggedIndex < targetIndex) {
                e.currentTarget.parentNode.insertBefore(this.draggedElement, e.currentTarget.nextSibling);
            } else {
                e.currentTarget.parentNode.insertBefore(this.draggedElement, e.currentTarget);
            }
            const molecules = this.repository.molecules;
            const draggedCode = this.draggedElement.getAttribute('data-molecule-code');
            const targetCode = e.currentTarget.getAttribute('data-molecule-code');
            const draggedIdx = molecules.findIndex(m => m.code === draggedCode);
            const targetIdx = molecules.findIndex(m => m.code === targetCode);
            if (draggedIdx > -1 && targetIdx > -1) {
                const [draggedMol] = molecules.splice(draggedIdx, 1);
                molecules.splice(targetIdx, 0, draggedMol);
            }
        }
        return false;
    }

    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        this.draggedElement = null;
    }

    async downloadSdf(ccdCode, sdfData) {
        try {
            let data = sdfData;
            if (!data) {
                data = await ApiService.getCcdSdf(ccdCode);
            }
            if (!data) {
                throw new Error('No SDF data available');
            }
            const blob = new Blob([data], { type: 'chemical/x-mdl-sdfile' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${ccdCode}.sdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error(`Failed to download SDF for ${ccdCode}:`, err);
        }
    }

    clearAll() {
        const allCards = this.grid.querySelectorAll('.molecule-card');
        allCards.forEach(card => card.remove());
    }
}

export default MoleculeCard;
