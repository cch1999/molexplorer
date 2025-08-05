class Viewer {
  constructor(viewer, listEl) {
    this.viewer = viewer;
    this.listEl = listEl;
    this.entries = [];
  }

  addModel(model, label = '') {
    const row = document.createElement('div');
    row.className = 'viewer-row';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = label;
    row.appendChild(nameSpan);

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'visibility-toggle';
    toggleBtn.textContent = '👁';
    row.appendChild(toggleBtn);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-model';
    removeBtn.textContent = '✖';
    row.appendChild(removeBtn);

    if (this.listEl && typeof this.listEl.appendChild === 'function') {
      this.listEl.appendChild(row);
    }

    const entry = { model, row, visible: true, style: { stick: {} } };
    this.entries.push(entry);

    toggleBtn.addEventListener('click', () => {
      entry.visible = !entry.visible;
      if (entry.visible) {
        model.setStyle({}, entry.style);
        row.classList.remove('model-hidden');
        if (!row.style) row.style = {};
        row.style.opacity = '1';
        row.style.textDecoration = '';
      } else {
        model.setStyle({}, {});
        row.classList.add('model-hidden');
        if (!row.style) row.style = {};
        row.style.opacity = '0.5';
        row.style.textDecoration = 'line-through';
      }
      if (this.viewer && typeof this.viewer.render === 'function') {
        this.viewer.render();
      }
    });

    removeBtn.addEventListener('click', () => {
      if (this.viewer && typeof this.viewer.removeModel === 'function') {
        this.viewer.removeModel(model);
      }
      const idx = this.entries.findIndex(e => e.model === model);
      if (idx !== -1) {
        this.entries.splice(idx, 1);
      }
      if (this.listEl) {
        if (typeof row.remove === 'function') {
          row.remove();
        } else if (Array.isArray(this.listEl.children)) {
          const i = this.listEl.children.indexOf(row);
          if (i > -1) {
            this.listEl.children.splice(i, 1);
          }
        }
      }
      if (this.viewer && typeof this.viewer.zoomTo === 'function') {
        this.viewer.zoomTo();
      }
      if (this.viewer && typeof this.viewer.render === 'function') {
        this.viewer.render();
      }
    });

    return row;
  }
}

export default Viewer;
