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

        this.pdbIdInput = document.getElementById('pdb-id');
        this.authSeqIdInput = document.getElementById('auth-seq-id');
        this.authAsymIdInput = document.getElementById('auth-asym-id');
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
        if (this.authAsymIdInput) {
            this.authAsymIdInput.addEventListener('input', () => this.handleInstanceInput());
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
        if (this.authAsymIdInput) {
            this.authAsymIdInput.value = '';
        }
        if (this.confirmBtn) {
            this.confirmBtn.disabled = true;
        }
    }

    handleInput() {
        let value = this.codeInput.value.toUpperCase();
        this.codeInput.value = value;
        const isValid = /^[A-Z0-9]{3}$/.test(value);
        if (this.errorText) {
            this.errorText.textContent = isValid ? '' : 'Code must be 3 alphanumeric characters.';
        }
        if (this.confirmBtn) {
            this.confirmBtn.disabled = !isValid;
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
        const authAsymId = this.authAsymIdInput.value.trim().toUpperCase();

        if (pdbId || authSeqId || authAsymId) {
            if (!(pdbId && authSeqId && authAsymId)) {
                if (this.instanceError) {
                    this.instanceError.textContent = 'PDB ID, residue number and chain are required.';
                }
                return;
            }
            const success = this.moleculeManager.addPdbInstance({
                code,
                pdbId,
                authSeqId,
                authAsymId
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
