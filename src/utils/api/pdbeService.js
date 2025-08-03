import {
  PD_BE_SIMILARITY_BASE_URL,
  PD_BE_IN_PDB_BASE_URL,
  PD_BE_SUMMARY_BASE_URL,
  PD_BE_LIGAND_MONOMERS_BASE_URL
} from '../constants.js';
import { fetchJson } from './baseService.js';

export function getSimilarCcds(ccdCode) {
  return fetchJson(`${PD_BE_SIMILARITY_BASE_URL}/${ccdCode}`);
}

export function getPdbEntriesForCcd(ccdCode) {
  return fetchJson(`${PD_BE_IN_PDB_BASE_URL}/${ccdCode}`);
}

export function getPdbSummary(pdbId) {
  return fetchJson(`${PD_BE_SUMMARY_BASE_URL}/${pdbId}`);
}

export function getLigandMonomers(pdbId) {
  return fetchJson(`${PD_BE_LIGAND_MONOMERS_BASE_URL}/${pdbId}`);
}

export default {
  getSimilarCcds,
  getPdbEntriesForCcd,
  getPdbSummary,
  getLigandMonomers
};
