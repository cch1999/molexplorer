$(document).ready(function () {
    const molecules = [
        { name: "Caffeine", pubchemId: 2519, smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C" },
        { name: "Aspirin", pubchemId: 2244, smiles: "CC(=O)OC1=CC=CC=C1C(=O)O" },
        { name: "Ethanol", pubchemId: 702, smiles: "CCO" },
        { name: "Benzene", pubchemId: 241, smiles: "C1=CC=CC=C1" },
        { name: "Methane", pubchemId: 297, smiles: "C" },
        { name: "Glucose", pubchemId: 5793, smiles: "C(C1C(C(C(C(O1)O)O)O)O)O" },
    ];

    const grid = $('#molecule-grid');
    const loadingMessage = $('#loading-message');

    function createMoleculeCard(molecule, index) {
        return new Promise((resolve) => {
            console.log(`Creating card for: ${molecule.name}`);

            const card = `
                <div class="card" id="molecule-${molecule.pubchemId}">
                    <h3>${molecule.name}</h3>
                    <div id="viewer-${molecule.pubchemId}" class="viewer">
                        <div style="padding: 20px; text-align: center; color: #666;">
                            <div style="font-size: 3em; margin-bottom: 10px;">⚛️</div>
                            <div style="font-size: 1em; font-weight: bold;">${molecule.name}</div>
                            <div style="font-size: 0.8em; margin-top: 5px;">PubChem ID: ${molecule.pubchemId}</div>
                        </div>
                    </div>
                    <p style="font-size: 0.8em; color: #666; margin-top: 5px;">SMILES: ${molecule.smiles}</p>
                </div>
            `;

            grid.append(card);

            // Simulate loading time
            setTimeout(() => {
                console.log(`Loaded: ${molecule.name}`);
                resolve();
            }, 200 + Math.random() * 300);
        });
    }

    function loadMolecules() {
        console.log('Starting to load molecules...');
        loadingMessage.show();
        grid.hide();

        const promises = molecules.map((mol, index) => createMoleculeCard(mol, index));

        Promise.all(promises).then(() => {
            console.log('All molecules loaded successfully');
            loadingMessage.hide();
            grid.show();
        }).catch((error) => {
            console.error('Error loading molecules:', error);
            loadingMessage.hide();
            grid.show();
        });
    }

    // Add some debugging
    console.log('Document ready, starting load process...');
    loadMolecules();
}); 