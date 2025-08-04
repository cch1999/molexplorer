import ApiService from '../utils/apiService.js';

class FragmentLibrary {
    constructor(moleculeManager, {
        notify = (typeof window !== 'undefined' && window.showNotification)
            || (typeof showNotification === 'function' ? showNotification : () => {}),
        rdkit = Promise.resolve(null)
    } = {}) {
        this.moleculeManager = moleculeManager;
        this.fragments = [];
        this.grid = null;
        this.searchInput = null;
        this.sourceFilter = null;
        this.ccdToggle = null;
        this.notify = notify;
        this.rdkitPromise = rdkit;
    }

    init() {
        this.grid = document.getElementById('fragment-grid');
        this.searchInput = document.getElementById('fragment-search');
        this.sourceFilter = document.getElementById('fragment-filter-source');
        this.ccdToggle = document.getElementById('ccd-toggle');

        this.addEventListeners();
        return this;
    }

    addEventListeners() {
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.renderFragments());
        }
        if (this.sourceFilter) {
            this.sourceFilter.addEventListener('change', () => this.renderFragments());
        }
        if (this.ccdToggle) {
            this.ccdToggle.addEventListener('change', () => this.renderFragments());
        }
    }

    async loadFragments() {
        try {
            const tsvData = await ApiService.getFragmentLibraryTsv();
            const rows = tsvData.split('\n').slice(1); // Skip header
            this.fragments = rows.map((row, index) => {
                const columns = row.split('\t');
                if (columns.length < 10) return null;
                return {
                    id: columns[0] || index,
                    name: columns[1],
                    kind: columns[2],
                    query: columns[3],
                    description: columns[4],
                    comment: columns[5],
                    url: columns[6],
                    source: columns[7],
                    ccd: columns[8],
                    in_ccd: columns[9].trim() === 'True'
                };
            }).filter(Boolean);
            this.renderFragments();
        } catch (error) {
            console.error('Failed to load fragment library:', error);
            if (this.grid) {
                this.grid.innerHTML = '<p>No fragments match your criteria.</p>';
            }
        }
    }

    renderFragments() {
        if (!this.grid) return;
        this.grid.innerHTML = '';

        const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
        const source = this.sourceFilter ? this.sourceFilter.value : 'all';
        const onlyInCCD = this.ccdToggle ? this.ccdToggle.checked : false;

        const filtered = this.fragments.filter(fragment => {
            const nameMatch = fragment.name.toLowerCase().includes(searchTerm);
            const sourceMatch = source === 'all' || fragment.source === source;
            const ccdMatch = !onlyInCCD || fragment.in_ccd;
            return nameMatch && sourceMatch && ccdMatch;
        });

        if (filtered.length === 0) {
            this.grid.innerHTML = '<p>No fragments match your criteria.</p>';
            return;
        }

        const fragmentContainer = document.createDocumentFragment();
        filtered.forEach(fragment => {
            const card = this.createFragmentCard(fragment);
            fragmentContainer.appendChild(card);
        });

        this.grid.appendChild(fragmentContainer);
    }

    createFragmentCard(fragment) {
        const card = document.createElement('div');
        card.className = 'molecule-card fragment-card';

        const title = document.createElement('h3');
        title.textContent = fragment.name;
        card.appendChild(title);

        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'viewer-container';
        card.appendChild(canvasContainer);

        const info = document.createElement('div');
        info.className = 'fragment-info';

        let ccdText = 'No';
        if (fragment.in_ccd && fragment.ccd) {
            const ccdCode = fragment.ccd.split(',')[0].trim();
            ccdText = `Yes (<a href="#" class="ccd-link" data-ccd="${ccdCode}">${ccdCode}</a>)`;
        }

        info.innerHTML = `
            <p><strong>Source:</strong> ${fragment.source}</p>
            <p><strong>In CCD:</strong> ${ccdText}</p>
            <p><strong>Type:</strong> ${fragment.kind}</p>
        `;
        card.appendChild(info);

        const ccdLink = info.querySelector('.ccd-link');
        if (ccdLink) {
            ccdLink.addEventListener('click', (e) => {
                e.preventDefault();
                const ccd = e.target.dataset.ccd;
                if (this.moleculeManager && this.moleculeManager.showMoleculeDetails) {
                    this.moleculeManager.showMoleculeDetails(ccd);
                }
            });
        }

        if (fragment.in_ccd && fragment.ccd) {
            const ccdCode = fragment.ccd.split(',')[0].trim();
            const alreadyExists = this.moleculeManager.getMolecule(ccdCode);
            const addButton = document.createElement('button');
            addButton.textContent = alreadyExists ? 'In library' : 'Add to library';
            addButton.className = 'add-to-library-btn';
            if (alreadyExists) {
                addButton.disabled = true;
                addButton.classList.add('added');
            }
            addButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const success = this.moleculeManager.addMolecule(ccdCode);
                if (success) {
                    this.notify(`Adding molecule ${ccdCode} to library...`, 'success');
                    addButton.textContent = 'Added to library';
                    addButton.disabled = true;
                    addButton.classList.add('added');
                } else {
                    this.notify(`Molecule ${ccdCode} already exists.`, 'info');
                    addButton.textContent = 'In library';
                    addButton.disabled = true;
                    addButton.classList.add('added');
                }
            });
            card.appendChild(addButton);
        }

        setTimeout(() => {
            if ((fragment.kind === 'SMILES' || fragment.kind === 'SMARTS') && fragment.query) {
                this.rdkitPromise.then((RDKit) => {
                    if (!RDKit) {
                        canvasContainer.innerHTML = `<p class="render-error">RDKit not available</p>`;
                        return;
                    }
                    try {
                        const sanitizedQuery = this.sanitizeSMILES(fragment.query);
                        const mol = RDKit.get_mol(sanitizedQuery);
                        const svg = mol.get_svg(200, 150);
                        mol.delete();
                        canvasContainer.innerHTML = svg;
                    } catch (err) {
                        console.error('Error rendering SMILES for ' + fragment.name, err);
                        canvasContainer.innerHTML = `<p class="render-error">Render error for query: ${fragment.query}</p>`;
                    }
                });
            } else {
                canvasContainer.innerHTML = `<p class="render-error">Cannot render type: ${fragment.kind || 'N/A'}</p>`;
            }
        }, 50);

        return card;
    }

    addFragment(fragmentData) {
        if (!fragmentData.name || !fragmentData.query) {
            this.notify('Fragment name and SMILES/SMARTS query are required.', 'error');
            return false;
        }

        this.fragments.unshift({
            id: `custom-${Date.now()}`,
            name: fragmentData.name,
            kind: 'SMILES',
            query: fragmentData.query,
            description: fragmentData.description,
            comment: 'Custom fragment',
            url: '',
            source: fragmentData.source || 'custom',
            ccd: '',
            in_ccd: false
        });

        this.renderFragments();
        this.notify(`Fragment "${fragmentData.name}" added successfully!`, 'success');
        return true;
    }

    sanitizeSMILES(smiles) {
        if (!smiles) return '';
        return smiles.replace(/[^A-Za-z0-9\(\)\[\]\.\-=#$:@\/\\]/g, '');
    }
}

export default FragmentLibrary;
