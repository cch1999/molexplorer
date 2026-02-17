import { getRDKit } from './utils/rdkit.js';

export async function initJoy() {
    const rdkit = await getRDKit();
    const button = document.createElement('button');
    button.id = 'joy-btn';
    button.textContent = 'Joy';
    Object.assign(button.style, {
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1002
    });

    button.addEventListener('click', () => {
        const mol = rdkit.get_mol('c1ccccc1');
        alert(mol.get_smiles());
        mol.delete();
    });

    document.body.appendChild(button);
}
