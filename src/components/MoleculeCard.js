import ApiService from '../utils/apiService.js';

class MoleculeCard {
    constructor(grid, repository, callbacks = {}) {
        this.grid = grid;
        this.repository = repository;
        this.onShowDetails = callbacks.onShowDetails;
        this.draggedElement = null;
    }

    createBaseCard(ccdCode, status = 'pending', id = ccdCode) {
        const card = document.createElement('div');
        card.className = 'molecule-card';
        card.draggable = true;
        card.setAttribute('data-molecule-code', ccdCode);
        card.setAttribute('data-molecule-id', id);

        const header = document.createElement('div');
        header.className = 'card-header';
        const codeEl = document.createElement('span');
        codeEl.className = 'ccd-code';
        codeEl.textContent = ccdCode;
        const badge = document.createElement('span');
        badge.className = `status-badge ${status}`;
        badge.textContent = status;
        header.appendChild(codeEl);
        header.appendChild(badge);
        card.appendChild(header);

        const viewerContainer = document.createElement('div');
        viewerContainer.className = 'viewer-container skeleton';
        viewerContainer.id = `viewer-${ccdCode}`;
        card.appendChild(viewerContainer);

        const footer = document.createElement('div');
        footer.className = 'card-footer';
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'btn-primary details-btn';
        detailsBtn.textContent = 'Details';
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn-primary download-btn';
        downloadBtn.textContent = 'Download SDF';
        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-secondary copy-btn';
        copyBtn.textContent = 'Copy CCD';
        footer.append(detailsBtn, downloadBtn, copyBtn);
        card.appendChild(footer);

        this.grid.appendChild(card);
        this.addDragEvents(card);

        return { card, viewerContainer, detailsBtn, downloadBtn, copyBtn };
    }

    createMoleculeCardFromSmiles(smiles, ccdCode, id = ccdCode) {
        const status = this.repository.getMolecule(ccdCode)?.status || 'unknown';
        const { viewerContainer, detailsBtn, downloadBtn, copyBtn } = this.createBaseCard(ccdCode, status, id);
        this.renderSmilesIn2D(smiles, viewerContainer);
        viewerContainer.classList.remove('skeleton');
        detailsBtn.addEventListener('click', () => {
            if (this.onShowDetails) this.onShowDetails(ccdCode, smiles, 'smiles');
        });
        downloadBtn.addEventListener('click', e => {
            e.stopPropagation();
            this.downloadSdf(ccdCode);
        });
        copyBtn.addEventListener('click', e => {
            e.stopPropagation();
            navigator.clipboard?.writeText(ccdCode);
            window.showNotification?.(`${ccdCode} copied`, 'success');
        });
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
        const status = this.repository.getMolecule(ccdCode)?.status || 'unknown';
        const { viewerContainer, detailsBtn, downloadBtn, copyBtn } = this.createBaseCard(ccdCode, status, id);
        detailsBtn.addEventListener('click', () => {
            if (this.onShowDetails) this.onShowDetails(ccdCode, data, format);
        });
        downloadBtn.addEventListener('click', e => {
            e.stopPropagation();
            this.downloadSdf(ccdCode, data);
        });
        copyBtn.addEventListener('click', e => {
            e.stopPropagation();
            navigator.clipboard?.writeText(ccdCode);
            window.showNotification?.(`${ccdCode} copied`, 'success');
        });

        setTimeout(() => {
            try {
                const bgColor = document.body?.classList?.contains('dark-mode') ? '#e0e0e0' : 'white';
                const viewer = $3Dmol.createViewer(viewerContainer, { backgroundColor: bgColor });
                viewerContainer.viewer = viewer;
                viewer.addModel(data, format);
                viewer.setStyle({}, { stick: {} });
                viewer.setStyle({ elem: 'H' }, {});
                viewer.zoomTo();
                viewer.render();
            } catch (e) {
                console.error(`Error initializing 3Dmol viewer for ${ccdCode}:`, e);
                viewerContainer.innerHTML = '<p style="text-align:center;padding:20px;">Render Error</p>';
            } finally {
                viewerContainer.classList.remove('skeleton');
            }
        }, 100);
    }

    createNotFoundCard(ccdCode, message = 'Not found', id = ccdCode) {
        const status = this.repository.getMolecule(ccdCode)?.status || 'error';
        const { viewerContainer, detailsBtn, downloadBtn } = this.createBaseCard(ccdCode, status, id);
        viewerContainer.classList.remove('skeleton');
        viewerContainer.innerHTML = `<p style="text-align:center;padding:20px;">${message}</p>`;
        detailsBtn.disabled = true;
        downloadBtn.disabled = true;
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

