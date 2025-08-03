/**
 * ApiService - Centralized service for all external API calls
 *
 * This service handles communication with various molecular biology databases:
 * - RCSB PDB (Protein Data Bank) - Primary protein structure database
 * - PDBe (Protein Data Bank in Europe) - European protein structure database
 * - Local data files (SDF, TSV) - Fragment and molecule libraries
 *
 * @see https://www.ebi.ac.uk/pdbe/graph-api/pdbe_doc/ for PDBe API documentation
 */

import {
  LOCAL_SDF_LIBRARY_PATH,
  FRAGMENT_LIBRARY_TSV_URL,
  RCSB_LIGANDS_URL,
  PDBe_COMPOUND_SIMILARITY_URL,
  PDBe_COMPOUND_IN_PDB_URL,
  RCSB_ENTRY_URL,
  PDBe_PDB_SUMMARY_URL,
  RCSB_PDB_DOWNLOAD_URL,
  PDBe_LIGAND_MONOMERS_URL,
  RCSB_ENTRY_GROUPS_URL,
} from './constants.js';

// In-memory cache for URL -> parsed response pairs
const responseCache = new Map();

export default class ApiService {
  /**
   * Perform a fetch request and parse the response using the provided parser.
   *
   * @param {string} url - Target URL.
   * @param {(response: Response) => Promise<any>} parser - Function that parses the response.
   * @returns {Promise<any>} Parsed response data.
   * @private
   */
  static async #fetchResource(url, parser) {
    if (responseCache.has(url)) {
      return responseCache.get(url);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const parsed = await parser(response);
    responseCache.set(url, parsed);
    return parsed;
  }

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
    return this.#fetchResource(url, (response) => response.text());
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
    return this.#fetchResource(url, (response) => response.json());
  }

  /**
   * Fetch ideal chemical component data from PDBe Graph API
   *
   * Retrieves the ideal (reference) structure for a chemical component from the 
   * Chemical Component Dictionary (CCD) via PDBe's Graph API.
   *
   * @param {string} ligandCode - The 3-letter CCD code (e.g., 'ATP', 'HEM')
   * @returns {Promise<string>} SDF file content as string
   *
   * @example
   * // Example SDF response for ligandCode 'HEM':
   * const sdf = await ApiService.getCcdSdf('HEM');
   * // sdf.startsWith('HEM') => true
   *
   * @note
   * - Uses PDBe Graph API endpoint: /api/pdb/entry/ideal_ccd/{ligandCode}
   * - Returns ideal (reference) structure, not experimental data
   * - Chemical components are standardized molecular entities in the CCD
   *
   * @see https://www.ebi.ac.uk/pdbe/graph-api/pdbe_doc/ for API documentation
  */
  static getCcdSdf(ccdCode) {
    return this.fetchText(
      `${RCSB_LIGANDS_URL}${ccdCode.toUpperCase()}_ideal.sdf`
    );
  }

  /**
   * Fetch local SDF (Structure Data File) data
   *
   * Loads molecular structure data from the local SDF file containing
   * pre-loaded chemical components and their 3D coordinates.
   *
   * @returns {Promise<string>} SDF file content as string
   *
   * @example
   * // Example SDF format:
   * // HEM
   * // CCTOOLS-1004241128
   * //
   * // 75 82 0 0 0 0 0 0 0 0999 V2000
   * //    -0.1234    1.2345    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   * //    ...
   * // M  END
   * // $$$$
   *
   * @note
   * - SDF files contain 3D molecular coordinates in MOL format
   * - Each molecule is separated by $$$$
   * - Used for 3D molecular visualization with 3Dmol.js
  */
  static getLocalSdfLibrary() {
    return this.fetchText(LOCAL_SDF_LIBRARY_PATH);
  }

  /**
   * Fetch fragment library data from local TSV file
   *
   * Loads fragment library data containing molecular fragments with their
   * properties, sources, and structural information.
   *
   * @returns {Promise<string>} TSV file contents as string
   *
   * @example
   * // Example TSV first line:
   * // fragment_id\tsmiles\tsource\tdescription\t...
   *
   * @note
   * - TSV format with tab-separated values
   * - Contains fragments from multiple sources (PDBe, ENAMINE, DSI)
   * - Used for fragment-based drug discovery workflows
  */
  static getFragmentLibraryTsv() {
    // Fetch fragment library TSV from GitHub
    return this.fetchText(FRAGMENT_LIBRARY_TSV_URL);
  }

  /**
   * Fetch similar ligands for a given chemical component
   *
   * Retrieves structurally similar ligands from PDBe's similarity search API.
   * Returns ligands that share structural features with the query molecule.
   *
   * @param {string} ligandCode - The 3-letter CCD code to find similar ligands for
   * @returns {Promise<Object>} Mapping of the CCD code to an array of similar components
   *
   * @example
   * await ApiService.getSimilarCcds('ATP');
   * // => { "ATP": [ { "ccd_id": "ADP", "similarity": 0.75 } ] }
   *
   * @note
   * - Uses PDBe similarity search algorithms
   * - Similarity types: scaffold, stereoisomer, similar
   * - Scores range from 0.0 to 1.0 (higher = more similar)
   *
   * @see https://www.ebi.ac.uk/pdbe/graph-api/pdbe_doc/ for similarity search API
   */
  static getSimilarCcds(ccdCode) {
    return this.fetchJson(`${PDBe_COMPOUND_SIMILARITY_URL}${ccdCode}`);
  }

  /**
   * Fetch PDB entries containing a specific ligand
   *
   * Retrieves all PDB entries where the specified chemical component appears
   * as a bound ligand in protein structures.
   *
   * @param {string} ligandCode - The 3-letter CCD code to search for
   * @returns {Promise<Object>} Mapping of the CCD code to an array of PDB IDs
   *
   * @example
   * await ApiService.getPdbEntriesForCcd('ATP');
   * // => { "ATP": ["2MZ5", "3AMO"] }
   *
   * @note
   * - Searches across all PDB entries for ligand binding
   * - Returns experimental protein-ligand complexes
   * - Includes structural and experimental metadata
   *
   * @see https://www.ebi.ac.uk/pdbe/graph-api/pdbe_doc/ for PDB search API
   */
  static getPdbEntriesForCcd(ccdCode) {
    return this.fetchJson(`${PDBe_COMPOUND_IN_PDB_URL}${ccdCode}`);
  }

  /**
   * Fetch detailed PDB entry information from RCSB API
   *
   * Retrieves comprehensive information about a specific PDB entry including
   * structural metadata, experimental details, and publication information.
   *
   * @param {string} pdbId - The 4-character PDB ID (e.g., '1ATP', '4HHB')
   * @returns {Promise<Object|null>} PDB entry details or null if failed
   *
   * @example
   * const entry = await ApiService.getRcsbEntry('1CBS');
   * // entry.rcsb_id => '1CBS'
   *
   * @note
   * - Uses RCSB PDB REST API
   * - Returns comprehensive structural and experimental metadata
   * - Includes entity information for proteins, nucleic acids, and ligands
   *
   * @see https://data.rcsb.org/redoc/index.html for RCSB API documentation
   */
  static getRcsbEntry(pdbId) {
    return this.fetchJson(`${RCSB_ENTRY_URL}${pdbId.toLowerCase()}`);
  }

  /**
   * Fetch PDBe summary information for a PDB entry
   *
   * Retrieves summary information about a PDB entry from PDBe's Graph API,
   * including structural statistics, experimental details, and quality metrics.
   *
   * @param {string} pdbId - The 4-character PDB ID (e.g., '1ATP', '4HHB')
   * @returns {Promise<Object|null>} PDBe summary data or null if failed
   *
   * @example
   * const summary = await ApiService.getPdbSummary('1CBS');
   * // summary['1cbs'][0].title => 'CRYSTAL STRUCTURE OF ADENOSINE KINASE'
   *
   * @note
   * - Uses PDBe Graph API for comprehensive structural information
   * - Includes quality indicators and experimental metadata
   * - Provides entity-level information for all molecular components
   *
   * @see https://www.ebi.ac.uk/pdbe/graph-api/pdbe_doc/ for PDBe API documentation
   */
  static getPdbSummary(pdbId) {
    return this.fetchJson(`${PDBe_PDB_SUMMARY_URL}${pdbId}`);
  }

  /**
   * Fetch PDB file in mmCIF format from RCSB
   *
   * Downloads the complete PDB file containing atomic coordinates and
   * structural information in mmCIF format for 3D visualization.
   *
   * @param {string} pdbId - The 4-character PDB ID (e.g., '1ATP', '4HHB')
   * @returns {Promise<string>} PDB file content in mmCIF format
   *
   * @example
   * const pdb = await ApiService.getPdbFile('1CBS');
   * // pdb.startsWith('HEADER') => true
   *
   * @note
   * - mmCIF format is the standard for PDB structural data
   * - Contains atomic coordinates, B-factors, and structural metadata
   * - Used for 3D molecular visualization with 3Dmol.js
   *
   * @see https://www.wwpdb.org/data/file-format for mmCIF format specification
   */
  static getPdbFile(pdbId) {
    return this.fetchText(`${RCSB_PDB_DOWNLOAD_URL}${pdbId}.pdb`);
  }

  /**
   * Fetch bound ligands for a specific PDB entry
   *
   * Retrieves all chemical components bound to the protein structure,
   * including their binding sites, chain information, and structural details.
   *
   * @param {string} pdbId - The 4-character PDB ID (e.g., '1ATP', '4HHB')
   * @returns {Promise<Object>} Ligand monomer data keyed by PDB ID
   *
   * @example
   * await ApiService.getLigandMonomers('1CBS');
   * // => { "1cbs": [ { "chem_comp_id": "ATP", ... } ] }
   *
   * @note
   * - Includes both small molecules and ions
   * - Provides binding site and structural information
   * - Used for analyzing protein-ligand interactions
   *
   * @see https://www.ebi.ac.uk/pdbe/graph-api/pdbe_doc/ for bound ligands API
   */
  static getLigandMonomers(pdbId) {
    return this.fetchJson(`${PDBe_LIGAND_MONOMERS_URL}${pdbId}`);
  }

  /**
   * Fetch protein group information from RCSB API
   *
   * Retrieves information about protein groups, which are collections of
   * related PDB entries (e.g., same protein with different ligands).
   *
   * @param {string} groupId - The protein group ID (e.g., 'G_1002155')
   * @returns {Promise<Object|null>} Protein group data or null if failed
   *
   * @example
   * const group = await ApiService.getProteinGroup('P12345');
   * // group.group_id => 'P12345'
   *
   * @note
   * - PDB IDs are in rcsb_group_container_identifiers.group_member_ids array
   * - Group metadata is in rcsb_group_info object
   * - This is NOT the same structure as individual PDB entry APIs
   *
   * @see https://data.rcsb.org/redoc/index.html for RCSB group API documentation
   */
  static getProteinGroup(groupId) {
    return this.fetchJson(`${RCSB_ENTRY_GROUPS_URL}${groupId}`);
  }

  /**
   * Clear the internal response cache.
   * Useful for tests or debugging to force re-fetching resources.
   */
  static clearCache() {
    responseCache.clear();
  }
}
