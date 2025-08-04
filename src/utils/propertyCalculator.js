/**
 * PropertyCalculator - fetches molecular properties from public APIs.
 *
 * Currently uses the RCSB PDB chemical component service to retrieve
 * molecular formula and molecular weight for a given CCD code.
 *
 * @see https://data.rcsb.org/redoc/index.html#tag/chemcomp
 */

const BASE_URL = 'https://data.rcsb.org/rest/v1/core/chemcomp';

export default class PropertyCalculator {
  /**
   * Fetch molecular properties for a chemical component.
   *
   * @param {string} ccdCode - Three-letter chemical component code.
   * @returns {Promise<{molecularWeight: number|null, formula: string|null}|null>}
   *   Object with properties or null if unavailable.
   */
  static async getProperties(ccdCode) {
    try {
      const response = await fetch(`${BASE_URL}/${ccdCode.toUpperCase()}`);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      const comp = data?.chem_comp || {};
      const info = data?.rcsb_chem_comp_info || {};
      return {
        molecularWeight: comp.formula_weight ?? null,
        formula: comp.formula ?? null,
        atomCount: info.atom_count ?? null,
        heavyAtomCount: info.atom_count_heavy ?? null,
        aromaticBondCount: info.bond_count_aromatic ?? null,
      };
    } catch (e) {
      console.error(`Failed to fetch properties for ${ccdCode}:`, e);
      return null;
    }
  }
}

