let viewer = null;
let listEl = null;
const molecules = [];

function init() {
    const container = document.getElementById('viewer-content');
    if (!container) return;

    container.innerHTML = '';

    const viewerDiv = document.createElement('div');
    viewerDiv.style.width = '100%';
    viewerDiv.style.height = '400px';
    container.appendChild(viewerDiv);

    listEl = document.createElement('ul');
    listEl.className = 'viewer-list';
    container.appendChild(listEl);

    viewer = $3Dmol.createViewer(viewerDiv, { backgroundColor: 'white' });
    viewer.render();
}

function renderList() {
    if (!listEl) return;
    listEl.innerHTML = '';
    molecules.forEach(({ code, visible }) => {
        const row = document.createElement('li');
        row.className = 'viewer-row';

        const codeSpan = document.createElement('span');
        codeSpan.textContent = code;
        row.appendChild(codeSpan);

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'viewer-hide-btn';
        toggleBtn.innerHTML = visible ? '&#128065;' : '&#128068;';
        toggleBtn.addEventListener('click', () => toggleVisibility(code));
        row.appendChild(toggleBtn);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'viewer-remove-btn';
        removeBtn.innerHTML = '&#10006;';
        removeBtn.addEventListener('click', () => removeMolecule(code));
        row.appendChild(removeBtn);

        listEl.appendChild(row);
    });
}

function addMolecule({ code, sdf }) {
    if (!viewer || molecules.some(m => m.code === code)) {
        return false;
    }
    const model = viewer.addModel(sdf, 'sdf');
    model.setStyle({}, { stick: {} });
    viewer.zoomTo();
    viewer.render();
    molecules.push({ code, model, visible: true });
    renderList();
    return true;
}

function toggleVisibility(code) {
    const entry = molecules.find(m => m.code === code);
    if (!entry) return;
    entry.visible = !entry.visible;
    entry.model.setStyle({}, entry.visible ? { stick: {} } : {});
    viewer.render();
    renderList();
}

function removeMolecule(code) {
    const index = molecules.findIndex(m => m.code === code);
    if (index === -1) return;
    const { model } = molecules[index];
    if (model) {
        viewer.removeModel(model);
        viewer.render();
    }
    molecules.splice(index, 1);
    renderList();
}

export default { init, addMolecule, toggleVisibility, removeMolecule };
