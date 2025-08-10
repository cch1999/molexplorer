class Notebook {
    constructor(moleculeManager) {
        this.moleculeManager = moleculeManager;
        this.notesPanel = document.getElementById('notes-panel');
        this.notesToggle = document.getElementById('notes-toggle');
        this.notesEditor = document.getElementById('notes-editor');
        this.tagsInput = document.getElementById('notes-tags');
        this.snapshotBtn = document.getElementById('snapshot-btn');
        this.snapshotContainer = document.getElementById('snapshot-container');
        this.timelineDock = document.getElementById('timeline-dock');
        this.timelineList = document.getElementById('timeline-list');
        this.timelineToggle = document.getElementById('timeline-toggle');
        this.timelineFilter = document.getElementById('timeline-filter');
        this.exportBtn = document.getElementById('export-session-btn');
        this.currentMolecule = null;
        this.tags = {};
        this.snapshots = [];
        this.timeline = [];

        if (this.notesToggle) {
            this.notesToggle.addEventListener('click', () => {
                this.notesPanel.classList.toggle('collapsed');
            });
        }
        if (this.timelineToggle) {
            this.timelineToggle.addEventListener('click', () => {
                this.timelineDock.classList.toggle('collapsed');
            });
        }
        if (this.tagsInput) {
            this.tagsInput.addEventListener('change', () => this.saveTags());
        }
        if (this.snapshotBtn) {
            this.snapshotBtn.addEventListener('click', () => this.captureSnapshot());
        }
        if (this.timelineFilter) {
            this.timelineFilter.addEventListener('input', () => this.renderTimeline());
        }
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportSession());
        }
    }

    setCurrentMolecule(code) {
        this.currentMolecule = code;
        const tags = this.tags[code] || [];
        if (this.tagsInput) this.tagsInput.value = tags.join(', ');
    }

    saveTags() {
        if (!this.currentMolecule) return;
        const tags = this.tagsInput.value
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);
        this.tags[this.currentMolecule] = tags;
    }

    logAction(action, thumbnail) {
        const entry = {
            action,
            time: new Date().toISOString(),
            thumbnail
        };
        this.timeline.push(entry);
        this.renderTimeline();
    }

    renderTimeline() {
        if (!this.timelineList) return;
        const filter = this.timelineFilter?.value?.toLowerCase() || '';
        this.timelineList.innerHTML = '';
        this.timeline
            .filter(e => e.action.toLowerCase().includes(filter))
            .forEach(e => {
                const li = document.createElement('li');
                li.className = 'timeline-item';
                if (e.thumbnail) {
                    const img = document.createElement('img');
                    img.src = e.thumbnail;
                    img.alt = '';
                    li.appendChild(img);
                }
                const span = document.createElement('span');
                span.textContent = `${new Date(e.time).toLocaleTimeString()} - ${e.action}`;
                li.appendChild(span);
                this.timelineList.appendChild(li);
            });
    }

    captureSnapshot() {
        const canvas = document.querySelector('.details-viewer canvas, .molecule-viewer canvas, .viewer-container canvas');
        if (!canvas) return;
        const dataURL = canvas.toDataURL('image/png');
        this.snapshots.push({ image: dataURL, note: this.notesEditor ? this.notesEditor.value : '' });
        if (this.snapshotContainer) {
            const img = document.createElement('img');
            img.src = dataURL;
            img.className = 'snapshot-thumb';
            this.snapshotContainer.appendChild(img);
        }
        this.logAction('Snapshot captured', dataURL);
    }

    exportSession() {
        const data = {
            molecules: this.moleculeManager?.getAllMolecules ? this.moleculeManager.getAllMolecules() : [],
            notes: this.notesEditor ? this.notesEditor.value : '',
            tags: this.tags,
            snapshots: this.snapshots,
            timeline: this.timeline,
            layout: {
                notesCollapsed: this.notesPanel?.classList.contains('collapsed'),
                timelineCollapsed: this.timelineDock?.classList.contains('collapsed')
            }
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'session.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

export default Notebook;

