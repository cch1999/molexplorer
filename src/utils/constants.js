export const RCSB_LIGAND_BASE_URL = 'https://files.rcsb.org/ligands/view';
export const RCSB_MODEL_BASE_URL = 'https://models.rcsb.org/v1';
export const FRAGMENT_LIBRARY_URL = 'https://raw.githubusercontent.com/cch1999/cch1999.github.io/refs/heads/new_website/assets/files/fragment_library_ccd.tsv';
export const CHEMBL_FRAGMENT_API_URL =
  'https://www.ebi.ac.uk/chembl/api/data/molecule.json?molecule_properties__mw_freebase__lte=150&molecule_properties__hba__lte=3&molecule_properties__hbd__lte=3&molecule_properties__rtb__lte=3&limit=100';
export const PD_BE_SIMILARITY_BASE_URL = 'https://www.ebi.ac.uk/pdbe/graph-api/compound/similarity';
export const PD_BE_IN_PDB_BASE_URL = 'https://www.ebi.ac.uk/pdbe/graph-api/compound/in_pdb';
export const RCSB_ENTRY_BASE_URL = 'https://data.rcsb.org/rest/v1/core/entry';
export const PD_BE_SUMMARY_BASE_URL = 'https://www.ebi.ac.uk/pdbe/graph-api/pdb/summary';
export const RCSB_PDB_DOWNLOAD_BASE_URL = 'https://files.rcsb.org/download';
export const PD_BE_LIGAND_MONOMERS_BASE_URL = 'https://www.ebi.ac.uk/pdbe/api/pdb/entry/ligand_monomers';
export const RCSB_GROUP_BASE_URL = 'https://data.rcsb.org/rest/v1/core/entry_groups';
export const UNIPROT_ENTRY_BASE_URL = 'https://rest.uniprot.org/uniprotkb';
export const PUBCHEM_COMPOUND_BASE_URL = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound';
export const PUBCHEM_COMPOUND_LINK_BASE = 'https://pubchem.ncbi.nlm.nih.gov/compound';
export const PD_BE_STATIC_IMAGE_BASE_URL = 'https://www.ebi.ac.uk/pdbe/static/files/pdbechem_v2';
export const RCSB_STRUCTURE_BASE_URL = 'https://www.rcsb.org/structure';
export const PD_BE_ENTRY_BASE_URL = 'https://www.ebi.ac.uk/pdbe/entry/pdb';
export const RCSB_STRUCTURE_IMAGE_BASE_URL = 'https://cdn.rcsb.org/images/structures';
export const EXCLUDED_LIGANDS = ['HOH', 'ZN', 'MG', 'CA', 'NA', 'K', 'CL'];
export const ADD_LIGAND_DELAY_MS = 100;
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
export const DEFAULT_PDB_INSTANCES = [
    {
      code: 'UHV',
      source: 'reagents',
      type: 'reagent',
      pdbId: '5RH5',
      chainId: 'A',
      authorResidueNumber: 1001
    }
  ];
export const CRYSTALLIZATION_AIDS = [
  'SO4', 'PO4', 'CIT', 'EDO', 'GOL', '1PE',
  'ACE', 'ACT', 'BME', 'DMS', 'FMT', 'IMD', 'MES',
  'PEG', 'PGE', 'TRS'
];
export const ION_LIGANDS = ['ZN', 'MG', 'CA', 'NA', 'K', 'CL'];
