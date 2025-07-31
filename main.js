
window.onload = async () => {
    const ligandCodes = [
        'HEM', 'NAD', 'FAD', 'COA', 'ATP', 'ADP', '355', 'GPY', 'YQD',
    ];

    const grid = document.getElementById('molecule-grid');
    const loadingIndicator = document.querySelector('.loading-indicator');

    if (loadingIndicator) {
        loadingIndicator.style.display = 'block';
    }

    for (const code of ligandCodes) {
        await fetchMoleculeData(code, grid);
    }

    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
};

async function fetchMoleculeData(ligandCode, grid) {
    try {
        const response = await fetch(`https://files.rcsb.org/ligands/view/${ligandCode}_ideal.sdf`);
        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`Ligand ${ligandCode} not found.`);
                createNotFoundCard(ligandCode, grid);
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const sdfData = await response.text();
        createMoleculeCard(sdfData, ligandCode, grid);
    } catch (error) {
        console.error(`Could not fetch or process data for ${ligandCode}:`, error);
        createNotFoundCard(ligandCode, grid, "Failed to load");
    }
}

function createMoleculeCard(sdfData, ligandCode, grid) {
    const card = document.createElement('div');
    card.className = 'molecule-card';
    card.draggable = true;

    // Add drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '⋯';
    card.appendChild(dragHandle);

    const title = document.createElement('h3');
    title.textContent = ligandCode;
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

    grid.appendChild(card);

    // Wait a bit for the DOM to be ready
    setTimeout(() => {
        try {
            const viewer = $3Dmol.createViewer(viewerContainer, {
                backgroundColor: 'white'
            });
            viewer.addModel(sdfData, 'sdf');
            viewer.setStyle({}, { stick: {} });
            viewer.zoomTo();
            viewer.render();
        } catch (e) {
            console.error(`Error initializing 3Dmol viewer for ${ligandCode}:`, e);
            viewerContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Render Error</p>';
        }
    }, 100);
}

function createNotFoundCard(ligandCode, grid, message = "Not found") {
    const card = document.createElement('div');
    card.className = 'molecule-card';
    card.draggable = true;

    // Add drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.innerHTML = '⋯';
    card.appendChild(dragHandle);

    const content = document.createElement('div');
    content.innerHTML = `<h3>${ligandCode}</h3><p>${message}</p>`;
    card.appendChild(content);

    // Add drag event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragend', handleDragEnd);

    grid.appendChild(card);
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
    }

    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
} 