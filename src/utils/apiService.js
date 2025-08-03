/**
 * ApiService - Centralized service for all external API calls
 *
 * Provides methods for retrieving data from several molecular biology
 * databases. The service is designed as an injectable class so that different
 * fetch implementations (real network, mocked, etc.) can be supplied when
 * constructing an instance. A default singleton instance is exported for
 * convenience and maintains an internal response cache.
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
  RCSB_GROUP_BASE_URL
} from './constants.js';

/**
 * Injectable API service.
 */
class ApiService {
  /**
   * @param {Function} fetchFn - Fetch implementation (defaults to global fetch)
   */
  constructor(fetchFn = (...args) => fetch(...args)) {
    this.fetch = fetchFn;
    this.responseCache = new Map();
  }

  /**
   * Internal fetch helper with caching.
   * @param {string} url
   * @param {(resp: Response) => Promise<any>} parser
   * @returns {Promise<any>}
   * @private
   */
  async #fetchResource(url, parser) {
    if (this.responseCache.has(url)) {
      return this.responseCache.get(url);
    }

    const response = await this.fetch(url);
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.url = url;
      throw error;
    }

    const parsed = await parser(response);
    this.responseCache.set(url, parsed);
    return parsed;
  }

  /**
   * Fetch a plain text resource.
   * @param {string} url
   * @returns {Promise<string>}
   */
  fetchText(url) {
    return this.#fetchResource(url, (response) => response.text());
  }

  /**
   * Fetch a JSON resource.
   * @param {string} url
   * @returns {Promise<any>}
   */
  fetchJson(url) {
    return this.#fetchResource(url, (response) => response.json());
  }

  /**
   * Fetch ideal chemical component data from PDBe Graph API.
   * @param {string} ccdCode
   * @returns {Promise<string>}
   */
  getCcdSdf(ccdCode) {
    return this.fetchText(`${RCSB_LIGAND_BASE_URL}/${ccdCode.toUpperCase()}_ideal.sdf`);
  }

  /**
   * Fetch experimental ligand instance data from RCSB models API.
   */
  getInstanceSdf(pdbId, authSeqId, labelAsymId) {
    return this.fetchText(
      `${RCSB_MODEL_BASE_URL}/${pdbId.toUpperCase()}/ligand?auth_seq_id=${authSeqId}&label_asym_id=${labelAsymId}&encoding=sdf`
    );
  }

  /**
   * Fetch fragment library data from local TSV file.
   */
  getFragmentLibraryTsv() {
    return this.fetchText(FRAGMENT_LIBRARY_URL);
  }

  /**
   * Fetch similar ligands for a given chemical component.
   */
  getSimilarCcds(ccdCode) {
    return this.fetchJson(`${PD_BE_SIMILARITY_BASE_URL}/${ccdCode}`);
  }

  /**
   * Fetch PDB entries containing a specific ligand.
   */
  getPdbEntriesForCcd(ccdCode) {
    return this.fetchJson(`${PD_BE_IN_PDB_BASE_URL}/${ccdCode}`);
  }

  /**
   * Fetch detailed PDB entry information from RCSB API.
   */
  getRcsbEntry(pdbId) {
    return this.fetchJson(`${RCSB_ENTRY_BASE_URL}/${pdbId.toLowerCase()}`);
  }

  /**
   * Fetch PDBe summary information for a PDB entry.
   */
  getPdbSummary(pdbId) {
    return this.fetchJson(`${PD_BE_SUMMARY_BASE_URL}/${pdbId}`);
  }

  /**
   * Fetch PDB file in mmCIF format from RCSB.
   */
  getPdbFile(pdbId) {
    return this.fetchText(`${RCSB_PDB_DOWNLOAD_BASE_URL}/${pdbId}.pdb`);
  }

  /**
   * Fetch bound ligands for a specific PDB entry.
   */
  getLigandMonomers(pdbId) {
    return this.fetchJson(`${PD_BE_LIGAND_MONOMERS_BASE_URL}/${pdbId}`);
  }

  /**
   * Fetch protein group information from RCSB API.
   */
  getProteinGroup(groupId) {
    return this.fetchJson(`${RCSB_GROUP_BASE_URL}/${groupId}`);
  }

  /**
   * Clear the internal response cache.
   */
  clearCache() {
    this.responseCache.clear();
  }
}

// Default singleton instance
const apiService = new ApiService();

export { ApiService };
export default apiService;

