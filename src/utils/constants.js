export const STATUS = {
  PENDING: 'pending',
  LOADING: 'loading',
  LOADED: 'loaded',
  ERROR: 'error'
};

export const DEFAULT_MOLECULE_CODES = [
  'HEM',
  'NAD',
  'FAD',
  'COA',
  'ATP',
  'ADP',
  '355',
  'MPV',
  'YQD',
  'J9N',
  'VIA'
];

export const LOCAL_SDF_LIBRARY_PATH = './data/Enamine_MiniFrag_Library_80cmpds_20250123.sdf';
export const FRAGMENT_LIBRARY_TSV_URL = 'https://raw.githubusercontent.com/cch1999/cch1999.github.io/refs/heads/new_website/assets/files/fragment_library_ccd.tsv';

export const RCSB_LIGANDS_URL = 'https://files.rcsb.org/ligands/view/';
export const PDBe_COMPOUND_SIMILARITY_URL = 'https://www.ebi.ac.uk/pdbe/graph-api/compound/similarity/';
export const PDBe_COMPOUND_IN_PDB_URL = 'https://www.ebi.ac.uk/pdbe/graph-api/compound/in_pdb/';
export const RCSB_ENTRY_URL = 'https://data.rcsb.org/rest/v1/core/entry/';
export const PDBe_PDB_SUMMARY_URL = 'https://www.ebi.ac.uk/pdbe/graph-api/pdb/summary/';
export const RCSB_PDB_DOWNLOAD_URL = 'https://files.rcsb.org/download/';
export const PDBe_LIGAND_MONOMERS_URL = 'https://www.ebi.ac.uk/pdbe/api/pdb/entry/ligand_monomers/';
export const RCSB_ENTRY_GROUPS_URL = 'https://data.rcsb.org/rest/v1/core/entry_groups/';

export const IGNORED_LIGANDS = ['HOH', 'ZN', 'MG', 'CA', 'NA', 'K', 'CL'];

export const AMINO_ACIDS = [
  'ALA','ARG','ASN','ASP','CYS','GLN','GLU','GLY','HIS','ILE','LEU','LYS','MET','PHE','PRO','SER','THR','TRP','TYR','VAL'
];

export const PDBe_CHEM_IMAGE_URL = 'https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2/';

export const RCSB_STRUCTURE_URL = 'https://www.rcsb.org/structure/';
export const PDBe_ENTRY_BASE_URL = 'https://www.ebi.ac.uk/pdbe/entry/pdb/';
export const RCSB_STRUCTURE_IMAGE_URL = 'https://cdn.rcsb.org/images/structures/';

export const CRYSTALLIZATION_AIDS = [
  'SO4', 'PO4', 'CIT', 'EDO', 'GOL', '1PE',
  'ACE', 'ACT', 'BME', 'DMS', 'FMT', 'IMD', 'MES',
  'PEG', 'PGE', 'TRS'
];

export const SMILES_CANVAS_WIDTH = 200;
export const SMILES_CANVAS_HEIGHT = 150;

export const NOTIFICATION_TIMEOUT = 3000;
export const NOTIFICATION_FADE_DURATION = 300;
