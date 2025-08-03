export class LigandModal {
  constructor({ loadSimilarLigands, loadPDBEntries, getMolecule } = {}) {
    this.modal = document.getElementById('molecule-details-modal');
    this.detailsTitle = document.getElementById('details-title');
    this.detailsCode = document.getElementById('details-code');
    this.detailsSource = document.getElementById('details-source');
    this.detailsType = document.getElementById('details-type');
    this.detailsViewer = document.getElementById('details-viewer-container');
    this.detailsJSON = document.getElementById('details-json');

    this.loadSimilarLigands = loadSimilarLigands;
    this.loadPDBEntries = loadPDBEntries;
    this.getMolecule = getMolecule;
  }

  reset() {
    // Clear similar ligands section
    const similarTable = document.getElementById('similar-ligands-table');
    const similarTbody = document.getElementById('similar-ligands-tbody');
    const similarContainer = document.getElementById('similar-ligands-container');
    const addAllBtn = document.getElementById('add-all-similar-btn');

    if (similarTable) similarTable.style.display = 'none';
    if (similarTbody) similarTbody.innerHTML = '';
    if (similarContainer) similarContainer.innerHTML = '<p>Loading similar ligands...</p>';
    if (addAllBtn) addAllBtn.style.display = 'none';

    // Clear PDB entries section
    const pdbTable = document.getElementById('pdb-entries-table-container');
    const pdbTbody = document.getElementById('pdb-entries-tbody');
    const pdbContainer = document.getElementById('pdb-entries-container');

    if (pdbTable) {
      pdbTable.style.display = 'none';
      const existingNotes = pdbTable.querySelectorAll('p[style*="font-size: 12px"]');
      existingNotes.forEach(note => note.remove());
    }
    if (pdbTbody) pdbTbody.innerHTML = '';
    if (pdbContainer) pdbContainer.innerHTML = '<p>Loading PDB entries...</p>';
  }

  show(ligandCode, sdfData) {
    this.detailsTitle.textContent = `Molecule Details: ${ligandCode}`;
    this.detailsCode.textContent = ligandCode;

    const aminoAcids = ['ALA','ARG','ASN','ASP','CYS','GLN','GLU','GLY','HIS','ILE','LEU','LYS','MET','PHE','PRO','SER','THR','TRP','TYR','VAL'];
    const isAminoAcid = aminoAcids.includes(ligandCode);

    this.detailsSource.textContent = isAminoAcid ? 'building_blocks' : 'reagents';
    this.detailsType.textContent = isAminoAcid ? 'building_block' : 'reagent';

    this.detailsViewer.innerHTML = '<p>Loading structure...</p>';

    if (sdfData) {
      setTimeout(() => {
        try {
          const viewer = $3Dmol.createViewer(this.detailsViewer, {
            backgroundColor: 'white',
            width: '100%',
            height: '100%'
          });
          viewer.addModel(sdfData, 'sdf');
          viewer.setStyle({}, { stick: { radius: 0.2 }, sphere: { scale: 0.3 } });
          viewer.setStyle({ elem: 'H' }, {});
          viewer.zoomTo();
          viewer.render();
        } catch (e) {
          console.error(`Error initializing details viewer for ${ligandCode}:`, e);
          this.detailsViewer.innerHTML = '<p style="color: #666;">Structure rendering error</p>';
        }
      }, 100);
    } else {
      this.detailsViewer.innerHTML = '<p style="color: #666;">Structure data not available</p>';
    }

    const molecule = this.getMolecule ? this.getMolecule(ligandCode) : null;
    const jsonData = {
      molecule_id: `mol_${ligandCode.toLowerCase()}`,
      ccd_code: ligandCode,
      source: isAminoAcid ? 'building_blocks' : 'reagents',
      type: isAminoAcid ? 'building_block' : 'reagent',
      structure_data: sdfData ? sdfData.substring(0, 100) + '...' : 'N/A',
      properties: {
        molecular_weight: null,
        formula: null,
        status: molecule ? molecule.status : 'unknown'
      }
    };
    this.detailsJSON.textContent = JSON.stringify(jsonData, null, 2);

    this.modal.style.display = 'block';

    this.reset();

    if (this.loadSimilarLigands) this.loadSimilarLigands(ligandCode);
    if (this.loadPDBEntries) this.loadPDBEntries(ligandCode);
  }
}

