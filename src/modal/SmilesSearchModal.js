import ApiService from '../utils/apiService.js';

class SmilesSearchModal {
  constructor(moleculeManager) {
    this.moleculeManager = moleculeManager;
    this.modal = document.getElementById('smiles-search-modal');
    this.input = document.getElementById('smiles-input');
    this.searchBtn = document.getElementById('smiles-submit-btn');
    this.results = document.getElementById('smiles-results');
    this.closeBtn = document.getElementById('close-smiles-modal');

    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => this.handleSearch());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    window.addEventListener('click', e => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  open() {
    if (this.modal) {
      this.reset();
      this.modal.style.display = 'block';
      this.input.focus();
    }
  }

  close() {
    if (this.modal) {
      this.modal.style.display = 'none';
    }
  }

  reset() {
    if (this.input) this.input.value = '';
    if (this.results) this.results.innerHTML = '';
  }

  async handleSearch() {
    const smiles = this.input.value.trim();
    if (!smiles) return;
    if (this.results) this.results.innerHTML = 'Searching...';
    try {
      const hits = await ApiService.searchCcdsBySmiles(smiles);
      if (!hits.length) {
        this.results.innerHTML = '<p>No matches found</p>';
        return;
      }
      const list = document.createElement('ul');
      hits.forEach(hit => {
        const li = document.createElement('li');
        const score = Math.round((hit.score || 0) * 100);
        li.textContent = `${hit.id} (${score}%) `;
        const btn = document.createElement('button');
        btn.textContent = '+';
        btn.addEventListener('click', () => this.handleAdd(hit.id));
        li.appendChild(btn);
        list.appendChild(li);
      });
      this.results.innerHTML = '';
      this.results.appendChild(list);
    } catch (err) {
      console.error('SMILES search failed:', err);
      this.results.innerHTML = '<p class="error-text">Search failed</p>';
    }
  }

  handleAdd(code) {
    const success = this.moleculeManager.addMolecule(code);
    if (typeof showNotification === 'function') {
      if (success) {
        showNotification(`Adding molecule ${code}...`, 'success');
      } else {
        showNotification(`Molecule ${code} already exists`, 'info');
      }
    }
  }
}

export default SmilesSearchModal;
