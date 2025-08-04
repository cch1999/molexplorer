/**
 * ApiService - Centralized service for all external API calls
 *
 * This service handles communication with various molecular biology databases:
 * - RCSB PDB (Protein Data Bank) - Primary protein structure database
 * - PDBe (Protein Data Bank in Europe) - European protein structure database
 * - Local data files (TSV) - Fragment libraries
 *
 * @see https://www.ebi.ac.uk/pdbe/graph-api/pdbe_doc/ for PDBe API documentation
 */

import {
  RCSB_LIGAND_BASE_URL,
  RCSB_MODEL_BASE_URL,
  FRAGMENT_LIBRARY_URL,
  PD_BE_SIMILARITY_BASE_URL,
  PD_BE_IN_PDB_BASE_URL,
  RCSB_ENTRY_BASE_URL,
  PD_BE_SUMMARY_BASE_URL,
  RCSB_PDB_DOWNLOAD_BASE_URL,
  PD_BE_LIGAND_MONOMERS_BASE_URL,
  PD_BE_LIGAND_INTERACTIONS_BASE_URL,
  RCSB_GROUP_BASE_URL,
  PUBCHEM_COMPOUND_BASE_URL,
  PUBCHEM_COMPOUND_LINK_BASE
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
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.url = url;
      throw error;
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
      `${RCSB_LIGAND_BASE_URL}/${ccdCode.toUpperCase()}_ideal.sdf`
    );
  }

  /**
   * Fetch experimental ligand instance data from RCSB models API
   *
   * Retrieves the experimentally observed coordinates for a specific ligand
   * instance within a PDB entry.
   *
   * @param {string} pdbId - The 4-character PDB ID
   * @param {string|number} authSeqId - Author provided residue/sequence number
   * @param {string} labelAsymId - Chain identifier
   * @returns {Promise<string>} SDF file content for the ligand instance
   */
  static getInstanceSdf(pdbId, authSeqId, labelAsymId) {
    return this.fetchText(
      `${RCSB_MODEL_BASE_URL}/${pdbId.toUpperCase()}/ligand?auth_seq_id=${authSeqId}&label_asym_id=${labelAsymId}&encoding=sdf`
    );
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
    return this.fetchText(FRAGMENT_LIBRARY_URL);
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
    return this.fetchJson(`${PD_BE_SIMILARITY_BASE_URL}/${ccdCode}`);
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
    return this.fetchJson(`${PD_BE_IN_PDB_BASE_URL}/${ccdCode}`);
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
    return this.fetchJson(`${RCSB_ENTRY_BASE_URL}/${pdbId.toLowerCase()}`);
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
    return this.fetchJson(`${PD_BE_SUMMARY_BASE_URL}/${pdbId}`);
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
    return this.fetchText(`${RCSB_PDB_DOWNLOAD_BASE_URL}/${pdbId}.pdb`);
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
    return this.fetchJson(`${PD_BE_LIGAND_MONOMERS_BASE_URL}/${pdbId}`);
  }

  /**
   * Fetch interaction data for a specific bound ligand residue.
   *
   * Retrieves detailed interactions between a protein residue and its bound
   * ligand, including interaction types, atoms involved and distances.
   *
   * @param {string} pdbId - PDB entry ID (e.g., '1cbs')
   * @param {string} chainId - Chain identifier (auth_asym_id)
   * @param {number|string} seqId - Residue sequence number (auth_seq_id)
   * @returns {Promise<Object>} Interaction data keyed by PDB ID
   *
   * @see https://www.ebi.ac.uk/pdbe/graph-api/pdbe_doc/ for interactions API
   */
  static getLigandInteractions(pdbId, chainId, seqId) {
    return this.fetchJson(
      `${PD_BE_LIGAND_INTERACTIONS_BASE_URL}/${pdbId}/${chainId}/${seqId}`
    );
  }

  /**
   * Fetch compound synonyms from PubChem.
   *
   * @param {string} name - Compound name or identifier.
   * @returns {Promise<string[]>} Array of synonym strings.
   */
  static async getPubChemSynonyms(name) {
    const url = `${PUBCHEM_COMPOUND_BASE_URL}/name/${encodeURIComponent(name)}/synonyms/JSON`;
    const data = await this.fetchJson(url);
    return data?.InformationList?.Information?.[0]?.Synonym ?? [];
  }

  /**
   * Fetch compound properties from PubChem.
   *
   * Retrieves basic chemical properties for a compound such as formula and
   * molecular weight.
   *
   * @param {string} name - Compound name or identifier.
   * @returns {Promise<Object|null>} Properties object or null if unavailable.
   */
  static async getPubChemProperties(name) {
    const url = `${PUBCHEM_COMPOUND_BASE_URL}/name/${encodeURIComponent(name)}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES/JSON`;
    const data = await this.fetchJson(url);
    return data?.PropertyTable?.Properties?.[0] ?? null;
  }

  /**
   * Fetch combined compound metadata from PubChem (synonyms, properties, link).
   *
   * @param {string} name - Compound name or identifier.
   * @returns {Promise<{synonyms: string[], properties: Object|null, link: string|null}>}
   *   Metadata including synonyms, properties, and a PubChem entry link.
   */
  static async getPubChemMetadata(name) {
    const [synonyms, properties] = await Promise.all([
      this.getPubChemSynonyms(name).catch(() => []),
      this.getPubChemProperties(name).catch(() => null)
    ]);
    const cid = properties?.CID;
    return {
      synonyms,
      properties,
      link: cid ? `${PUBCHEM_COMPOUND_LINK_BASE}/${cid}` : null
    };
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
    return this.fetchJson(`${RCSB_GROUP_BASE_URL}/${groupId}`);
  }

  /**
   * Clear the internal response cache.
   * Useful for tests or debugging to force re-fetching resources.
   */
  static clearCache() {
    responseCache.clear();
  }
}
