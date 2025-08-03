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
        downloadBtn.title = `Download ${ccdCode} as PDF`;
        downloadBtn.addEventListener('click', e => {
            e.stopPropagation();
            this.downloadAsPDF(ccdCode);
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
        smilesLabel.style.fontSize = '10px';
        smilesLabel.style.color = '#666';
        smilesLabel.style.marginTop = '5px';
        card.appendChild(smilesLabel);

        this.grid.appendChild(card);
        this.renderSmilesIn2D(smiles, viewerContainer);
        this.addDragEvents(card);
    }

    renderSmilesIn2D(smiles, container) {
        container.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f8f9fa;border:1px solid #e9ecef;border-radius:4px;">
                <div style="text-align:center;padding:10px;">
                    <div style="font-size:24px;margin-bottom:5px;">🧪</div>
                    <div style="font-size:10px;color:#666;">SMILES</div>
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
        downloadBtn.title = `Download ${ccdCode} as PDF`;
        downloadBtn.addEventListener('click', e => {
            e.stopPropagation();
            this.downloadAsPDF(ccdCode);
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
                const viewer = $3Dmol.createViewer(viewerContainer, { backgroundColor: 'white' });
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
        downloadBtn.title = `Download ${ccdCode} as PDF`;
        downloadBtn.addEventListener('click', e => {
            e.stopPropagation();
            this.downloadAsPDF(ccdCode);
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

    downloadAsPDF(text) {
        const content = `BT /F1 24 Tf 50 100 Td (${text}) Tj ET`;
        const pdf = `%PDF-1.3\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 144]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length ${content.length}>>stream\n${content}\nendstream\nendobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000102 00000 n \n0000000224 00000 n \n0000000309 00000 n \ntrailer<</Size 6/Root 1 0 R>>\nstartxref\n363\n%%EOF`;
        const blob = new Blob([pdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${text}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearAll() {
        const allCards = this.grid.querySelectorAll('.molecule-card');
        allCards.forEach(card => card.remove());
    }
}

export default MoleculeCard;
