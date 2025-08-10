class EnzymeDesigner {
    constructor() {
        this.sequenceInput = null;
        this.analyzeBtn = null;
        this.resultContainer = null;
    }

    init() {
        this.sequenceInput = document.getElementById('enzyme-sequence-input');
        this.analyzeBtn = document.getElementById('analyze-sequence-btn');
        this.resultContainer = document.getElementById('sequence-analysis-result');

        if (this.analyzeBtn) {
            this.analyzeBtn.addEventListener('click', () => {
                const seq = (this.sequenceInput.value || '').trim().toUpperCase();
                const result = EnzymeDesigner.analyzeSequence(seq);
                if (!result) {
                    this.resultContainer.innerHTML = '<p>Invalid sequence.</p>';
                    return;
                }
                const compList = Object.entries(result.composition)
                    .map(([aa, count]) => `<li>${aa}: ${count}</li>`)
                    .join('');
                this.resultContainer.innerHTML = `
                    <p>Length: ${result.length}</p>
                    <p>Molecular Weight: ${result.molecularWeight.toFixed(2)} Da</p>
                    <ul>${compList}</ul>
                `;
            });
        }
        return this;
    }

    static analyzeSequence(seq) {
        if (!seq || /[^ACDEFGHIKLMNPQRSTVWY]/i.test(seq)) {
            return null;
        }
        const weights = {
            A: 89.09, C: 121.15, D: 133.10, E: 147.13, F: 165.19,
            G: 75.07, H: 155.16, I: 131.17, K: 146.19, L: 131.17,
            M: 149.21, N: 132.12, P: 115.13, Q: 146.15, R: 174.20,
            S: 105.09, T: 119.12, V: 117.15, W: 204.23, Y: 181.19
        };
        let weight = 18.015; // add weight of water
        const composition = {};
        for (const aa of seq) {
            weight += weights[aa];
            composition[aa] = (composition[aa] || 0) + 1;
        }
        return { length: seq.length, molecularWeight: weight, composition };
    }
}

export default EnzymeDesigner;
