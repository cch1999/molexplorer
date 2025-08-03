import ApiService from '../utils/apiService.js';

class AddMoleculeModal {
    constructor(moleculeManager) {
        this.moleculeManager = moleculeManager;
        this.modal = document.getElementById('add-molecule-modal');
        this.codeInput = document.getElementById('molecule-code');
        this.errorText = document.getElementById('ccd-error');
        this.confirmBtn = document.getElementById('confirm-add-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.closeBtn = document.getElementById('close-modal');
        this.luckyBtn = document.getElementById('feeling-lucky-btn');

        // Create datalist for CCD code suggestions
        if (this.codeInput) {
            this.suggestionsList = document.createElement('datalist');
            this.suggestionsList.id = 'ccd-suggestions';
            // Tie datalist to input when possible
            if (this.codeInput.setAttribute) {
                this.codeInput.setAttribute('list', 'ccd-suggestions');
            } else {
                this.codeInput.list = 'ccd-suggestions';
            }
            // Append datalist near the input if DOM structure allows
            const parent = this.codeInput.parentNode || this.codeInput.parentElement || document.body;
            if (parent && parent.appendChild) {
                parent.appendChild(this.suggestionsList);
            }
        }

        this.pdbIdInput = document.getElementById('pdb-id');
        this.authSeqIdInput = document.getElementById('auth-seq-id');
        this.labelAsymIdInput = document.getElementById('label-asym-id');
        this.instanceError = document.getElementById('instance-error');

        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.close());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        if (this.codeInput) {
            this.codeInput.addEventListener('input', () => this.handleInput());
        }
        if (this.pdbIdInput) {
            this.pdbIdInput.addEventListener('input', () => this.handleInstanceInput());
        }
        if (this.authSeqIdInput) {
            this.authSeqIdInput.addEventListener('input', () => this.handleInstanceInput());
        }
        if (this.labelAsymIdInput) {
            this.labelAsymIdInput.addEventListener('input', () => this.handleInstanceInput());
        }
        if (this.confirmBtn) {
            this.confirmBtn.addEventListener('click', () => this.handleSubmit());
        }
        if (this.luckyBtn) {
            this.luckyBtn.disabled = true;
        }
    }

    open() {
        if (this.modal) {
            this.reset();
            this.modal.style.display = 'block';
            this.codeInput.focus();
        }
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    reset() {
        if (this.codeInput) {
            this.codeInput.value = '';
        }
        if (this.errorText) {
            this.errorText.textContent = '';
        }
        if (this.instanceError) {
            this.instanceError.textContent = '';
        }
        if (this.pdbIdInput) {
            this.pdbIdInput.value = '';
        }
        if (this.authSeqIdInput) {
            this.authSeqIdInput.value = '';
        }
        if (this.labelAsymIdInput) {
            this.labelAsymIdInput.value = '';
        }
        if (this.confirmBtn) {
            this.confirmBtn.disabled = true;
        }
    }

    async handleInput() {
        let value = this.codeInput.value.toUpperCase();
        this.codeInput.value = value;
        const isValid = /^[A-Z0-9]{3}$/.test(value);
        if (this.errorText) {
            this.errorText.textContent = isValid ? '' : 'Code must be 3 alphanumeric characters.';
        }
        if (this.confirmBtn) {
            this.confirmBtn.disabled = !isValid;
        }

        // Fetch CCD code suggestions for the current prefix
        if (value) {
            try {
                const suggestions = await ApiService.searchCcdCodes(value);
                if (this.suggestionsList) {
                    this.suggestionsList.innerHTML = '';
                    suggestions.forEach(code => {
                        const option = document.createElement('option');
                        option.value = code;
                        this.suggestionsList.appendChild(option);
                    });
                }
                if (this.luckyBtn) {
                    this.luckyBtn.disabled = suggestions.length === 0;
                }
            } catch (e) {
                if (this.suggestionsList) {
                    this.suggestionsList.innerHTML = '';
                }
                if (this.luckyBtn) {
                    this.luckyBtn.disabled = true;
                }
            }
        } else {
            if (this.suggestionsList) {
                this.suggestionsList.innerHTML = '';
            }
            if (this.luckyBtn) {
                this.luckyBtn.disabled = true;
            }
        }
    }

    handleInstanceInput() {
        if (this.instanceError) {
            this.instanceError.textContent = '';
        }
    }

    handleSubmit() {
        const code = this.codeInput.value.toUpperCase();
        const pdbId = this.pdbIdInput.value.trim().toUpperCase();
        const authSeqId = this.authSeqIdInput.value.trim();
        const labelAsymId = this.labelAsymIdInput.value.trim().toUpperCase();

        if (pdbId || authSeqId || labelAsymId) {
            if (!(pdbId && authSeqId && labelAsymId)) {
                if (this.instanceError) {
                    this.instanceError.textContent = 'PDB ID, residue number and chain are required.';
                }
                return;
            }
            const success = this.moleculeManager.addPdbInstance({
                code,
                pdbId,
                authSeqId,
                labelAsymId
            });
            if (success) {
                window.showNotification(`Adding ligand ${code} from ${pdbId}...`, 'success');
            } else {
                window.showNotification(`Ligand ${code} instance already exists`, 'info');
            }
        } else {
            const success = this.moleculeManager.addMolecule(code);
            if (success) {
                window.showNotification(`Adding molecule ${code}...`, 'success');
            } else {
                window.showNotification(`Molecule ${code} already exists`, 'info');
            }
        }
        this.close();
    }
}

export default AddMoleculeModal;
