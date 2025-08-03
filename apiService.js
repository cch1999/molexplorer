export default class ApiService {
  /**
   * Fetch a plain text resource.
   *
   * @param {string} url - Target URL.
   * @returns {Promise<string>} Response body as text.
   * @example
   * const txt = await ApiService.fetchText('/example.txt');
   * // txt => 'file contents'
   */
  static async fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  }

  /**
   * Fetch a JSON resource.
   *
   * @param {string} url - Target URL.
   * @returns {Promise<Object>} Parsed JSON response.
   * @example
   * const data = await ApiService.fetchJson('https://example.com/data.json');
   * // data => { "id": 1 }
   */
  static async fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  /**
   * Retrieve the ideal SDF data for a Chemical Component Dictionary (CCD) code.
   *
   * @param {string} ccdCode - Three-letter CCD code (e.g., 'ATP').
   * @returns {Promise<string>} SDF file contents.
   * @example
   * const sdf = await ApiService.getCcdSdf('ATP');
   * // sdf starts with 'ATP\n  3Dmol...'
   */
  static getCcdSdf(ccdCode) {
    return this.fetchText(`/rcsb/ligands/view/${ccdCode.toUpperCase()}_ideal.sdf`);
  }

  /**
   * Fetch the bundled local SDF library used for offline lookups.
   *
   * @returns {Promise<string>} Entire SDF library as text.
   * @example
   * const library = await ApiService.getLocalSdfLibrary();
   * // library.includes('$$$$') => true
   */
  static getLocalSdfLibrary() {
    return this.fetchText('./data/Enamine_MiniFrag_Library_80cmpds_20250123.sdf');
  }

  /**
   * Download the fragment library in TSV format.
   *
   * @returns {Promise<string>} TSV file contents.
   * @example
   * const tsv = await ApiService.getFragmentLibraryTsv();
   * // tsv.split('\n')[0] => 'ccd\tsmiles'
   */
  static getFragmentLibraryTsv() {
    return this.fetchText('https://raw.githubusercontent.com/cch1999/cch1999.github.io/refs/heads/new_website/assets/files/fragment_library_ccd.tsv');
  }

  /**
   * Fetch compounds similar to the given CCD code using PDBe's similarity service.
   *
   * @param {string} ccdCode - CCD code to query.
   * @returns {Promise<Object>} Mapping of the CCD code to an array of similar components.
   * @example
   * await ApiService.getSimilarCcds('ATP');
   * // => { "ATP": [ { "ccd_id": "ADP", "similarity": 0.75 } ] }
   */
  static getSimilarCcds(ccdCode) {
    return this.fetchJson(`https://www.ebi.ac.uk/pdbe/graph-api/compound/similarity/${ccdCode}`);
  }

  /**
   * Retrieve PDB entry IDs that contain a given CCD code.
   *
   * @param {string} ccdCode - CCD code to search for.
   * @returns {Promise<Object>} Mapping of the CCD code to an array of PDB IDs.
   * @example
   * await ApiService.getPdbEntriesForCcd('ATP');
   * // => { "ATP": ["2MZ5", "3AMO"] }
   */
  static getPdbEntriesForCcd(ccdCode) {
    return this.fetchJson(`https://www.ebi.ac.uk/pdbe/graph-api/compound/in_pdb/${ccdCode}`);
  }

  /**
   * Fetch RCSB entry metadata for a PDB ID.
   *
   * @param {string} pdbId - Four-character PDB identifier.
   * @returns {Promise<Object>} RCSB entry JSON.
   * @example
   * const entry = await ApiService.getRcsbEntry('1CBS');
   * // entry.rcsb_id => '1CBS'
   */
  static getRcsbEntry(pdbId) {
    return this.fetchJson(`https://data.rcsb.org/rest/v1/core/entry/${pdbId.toLowerCase()}`);
  }

  /**
   * Fetch PDBe summary metadata for a PDB ID.
   *
   * @param {string} pdbId - Four-character PDB identifier.
   * @returns {Promise<Object>} Summary information.
   * @example
   * const summary = await ApiService.getPdbSummary('1CBS');
   * // summary['1cbs'][0].title => '...'
   */
  static getPdbSummary(pdbId) {
    return this.fetchJson(`https://www.ebi.ac.uk/pdbe/graph-api/pdb/summary/${pdbId}`);
  }

  /**
   * Download a PDB file.
   *
   * @param {string} pdbId - Four-character PDB identifier.
   * @returns {Promise<string>} Raw PDB file content.
   * @example
   * const pdb = await ApiService.getPdbFile('1CBS');
   * // pdb.startsWith('HEADER') => true
   */
  static getPdbFile(pdbId) {
    return this.fetchText(`https://files.rcsb.org/download/${pdbId}.pdb`);
  }

  /**
   * Retrieve ligand monomer information for a PDB entry.
   *
   * @param {string} pdbId - PDB entry ID.
   * @returns {Promise<Object>} Ligand monomer data keyed by PDB ID.
   * @example
   * await ApiService.getLigandMonomers('1CBS');
   * // => { "1cbs": [ { "chem_comp_id": "ATP", ... } ] }
   */
  static getLigandMonomers(pdbId) {
    return this.fetchJson(`https://www.ebi.ac.uk/pdbe/api/pdb/entry/ligand_monomers/${pdbId}`);
  }

  /**
   * Fetch information about an RCSB entry group.
   *
   * @param {string} groupId - RCSB group identifier.
   * @returns {Promise<Object>} Group metadata.
   * @example
   * const group = await ApiService.getProteinGroup('P12345');
   * // group.group_id => 'P12345'
   */
  static getProteinGroup(groupId) {
    return this.fetchJson(`https://data.rcsb.org/rest/v1/core/entry_groups/${groupId}`);
  }
}
