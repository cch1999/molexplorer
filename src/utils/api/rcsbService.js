import {
  RCSB_LIGAND_BASE_URL,
  RCSB_MODEL_BASE_URL,
  RCSB_ENTRY_BASE_URL,
  RCSB_PDB_DOWNLOAD_BASE_URL,
  RCSB_GROUP_BASE_URL
} from '../constants.js';
import { fetchText, fetchJson } from './baseService.js';

export function getCcdSdf(ccdCode) {
  return fetchText(`${RCSB_LIGAND_BASE_URL}/${ccdCode.toUpperCase()}_ideal.sdf`);
}

export function getInstanceSdf(pdbId, authSeqId, labelAsymId) {
  return fetchText(
    `${RCSB_MODEL_BASE_URL}/${pdbId.toUpperCase()}/ligand?auth_seq_id=${authSeqId}&label_asym_id=${labelAsymId}&encoding=sdf`
  );
}

export function getRcsbEntry(pdbId) {
  return fetchJson(`${RCSB_ENTRY_BASE_URL}/${pdbId.toLowerCase()}`);
}

export function getPdbFile(pdbId) {
  return fetchText(`${RCSB_PDB_DOWNLOAD_BASE_URL}/${pdbId}.pdb`);
}

export function getProteinGroup(groupId) {
  return fetchJson(`${RCSB_GROUP_BASE_URL}/${groupId}`);
}

export default {
  getCcdSdf,
  getInstanceSdf,
  getRcsbEntry,
  getPdbFile,
  getProteinGroup
};
