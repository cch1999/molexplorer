import initRDKit from '@rdkit/rdkit';

let rdkitModule = null;

export async function getRDKit() {
    if (!rdkitModule) {
        rdkitModule = await initRDKit();
    }
    return rdkitModule;
}
