Skip to main content
 
About us
Training
Research
Services
EMBL-EBI
 PDBe logo
Home 
PDBe Graph API 
PDBe Graph Database 
Partners 
Join PDBe-KB 
Contact 
 Feedback

x
Compounds
Get PDB entries that contains the compound
Get atoms for a compound
Get bonds for a compound
Get similar hetcodes
Get similar ligands
Get substructures for the compound
Get summary information for the compound
Get summary of Cofactors
PDB
Get FunPDBe annotations for an entity
Get FunPDBe resources for a PDB entry
Get PDB Complex details
Get Rfam domains for an entity
Get UniProt mapping for an entity
Get all FunPDBe annotations for a PDB entry from a specific resource
Get all FunPDBe annotations for a PDB entry
Get binding sites for a PDB entry
Get binding sites for an entity
Get bound ligand interactions
Get bound molecule interactions
Get bound molecules excluding carbohydrate polymers
Get bound molecules
Get carbohydrate polymer interactions
Get carbohydrate polymers
Get chain and quality information for an entity
Get interface residues for an entity
Get list of modelled instances of ligands
Get modified residues for PDB entry
Get mutated residues for PDB entry
Get secondary structures for a PDB entry
Get secondary structures for an entity
Get sequence and structural domains for an entity
Get sequence conservations for a PDB Entity
Residue
Get FunPDBe annotations for a PDB Residue
Get annotations for a PDB Residue range
Get annotations for a PDB Residue
Get sequence conservations for a PDB Residue
SIFTS
Get Best Structures for a UniProt accession
Get CATH mappings for a PDB Entry ID
Get EC mappings for a PDB Entry ID
Get GO mappings for a PDB Entry ID
Get Interpro mappings for a PDB Entry ID
Get Pfam mappings for a PDB Entry ID
Get Pfam mappings for a UniProt accession
Get SCOP mappings for a PDB Entry ID
Get Uniprot mappings for a PDB Entry ID
Get Uniprot segment mappings for a PDB Entry ID
Get all isoforms for a PDB entry ID
Get annotations for a PDB Entry ID
Get best isoform for a PDB entry ID
Get ensembl mappings for a PDB entry ID
Get homologene for a PDB entity
Get sequence domains for a PDB entry ID
Get structural domains for a PDB entry ID
Get uniref90 mappings (Homologene) for a PDB entry ID
Get uniref90 mappings for a PDB entry ID
UniProt
Get Best Structures for a UniProt residue range
Get PDB structure mappings for a UniProt accession
Get SIFTS mappings for a UniProt residue
Get all PDB structures for a UniProt accession
Get annotations for a UniProt accession
Get interface residues for a UniProt accession
Get ligand binding residues for a UniProt accession
Get list of complexes in which the protein interacts
Get non-overlapping structures for a UniProt accession
Get processed protein details for a UniProt accession
Get secondary structure mappings for a UniProt accession
Get sequence and structural domains for a UniProt accession
Get sequence conservations for a UniProt Residue
Get sequence conservations for a UniProt accession
Get similar proteins for a UniProt accession for a given sequence identity
Get superposition details for a UniProt accession
Validation
Get Entry-wide validation metrics
Get Ramachandran status for a PDB Entry ID
Get SIFTS backbone and sidechain outliers for a PDB Entry ID
Get Suite and pucker outliers in RNA chains
Get X-Ray refine data stats
Get a list of outlier types found in residues
Get key validation stats
Get residues with geometric outliers in protein, DNA, RNA chains
Get summary of global absolute percentiles
PDBe API

PDBe API

Compounds

Compounds - Get PDB entries that contains the compound

This set of calls returns a list of PDB entries that contain the compound defined in the PDB Chemical Component Dictionary.

https://www.ebi.ac.uk/pdbe/graph-api/compound/in_pdb/:hetcode
Parameter

Field	Type	Description
hetcode	String	
Hetcode for the compound

Example success response JSON:
{
    "ADP": [
        "13pk",
        "1a6e",
        "1a9x",
        "1am1",
        "1amw",
        "1ao0",
        "1aon",
        "6v11",
        "6v4k",
        "6v6s",
        "6vao",
        "6vau",
        "6vfs",
        "6vfx",
        "6vvo"
    ]
}
Send a Sample Request


	url
Parameters

hetcode
	String
Compounds - Get atoms for a compound

This set of calls provides information about atoms in a chemical groups defined in the PDB Chemical Component Dictionary. For each atoms, properties such as name, element symbol, ideal coordinates, stereochemistry, aromaticity (when applicable), etc. are available.

https://www.ebi.ac.uk/pdbe/graph-api/compound/atoms/:hetcode
Parameter

Field	Type	Description
hetcode	String	
Hetcode for the compound

Success 200

Field	Type	Description
stereo	String	
This flag indicates R/S stereochemistry for atoms (or E/Z for bonds) when applicable, else false.

leaving_atom	Boolean	
Flag to indicate if this is a leaving atom.

pdb_name	String	
Alternate name of the atom.

aromatic	String	
Indicates whether the atom or bond is within an aromatic substructure.

element	String	
Element type of the atom.

ideal_x	String	
X of calculated idealized coordinates.

ideal_y	String	
Y of calculated idealized coordinates.

ideal_z	String	
Z of calculated idealized coordinates.

charge	Float	
Formal charge on the atom.

atom_name	String	
Atom identifier from chemical components dictionary.

Example success response JSON:
{
    "ADP": [
        {
            "stereo": false,
            "leaving_atom": false,
            "pdb_name": "H2",
            "aromatic": false,
            "element": "H",
            "ideal_y": -1.944,
            "ideal_x": -0.482,
            "charge": 0,
            "ideal_z": 7.169,
            "atom_name": "H2"
        },
        {
            "stereo": false,
            "leaving_atom": false,
            "pdb_name": "PB",
            "aromatic": false,
            "element": "P",
            "ideal_y": -0.221,
            "ideal_x": 1.162,
            "charge": 0,
            "ideal_z": -5.685,
            "atom_name": "PB"
        }
    ]
}
Send a Sample Request


	url
Parameters

hetcode
	String
Compounds - Get bonds for a compound

This set of calls provides information about bonds in a chemical groups defined in the PDB Chemical Component Dictionary. For each bond, properties such as atom names, bond type, stereochemistry and aromaticity (when applicable) etc. are available.

https://www.ebi.ac.uk/pdbe/graph-api/compound/bonds/:hetcode
Parameter

Field	Type	Description
hetcode	String	
Hetcode for the compound

Success 200

Field	Type	Description
stereo	String	
This flag indicates R/S stereochemistry for atoms (or E/Z for bonds) when applicable, else false.

leaving_atom	Boolean	
Flag to indicate if this is a leaving atom.

atom_1	String	
Name of atom 1 in the bond.

atom_2	String	
Name of atom 2 in the bond.

bond_type	String	
A string describing bond type.

bond_order	Integer	
A number describing bond order.

ideal_length	Float	
Target length of the bond, e.g. for refinement.

aromatic	Boolean	
Indicates whether the atom or bond is within an aromatic substructure.

Example success response JSON:
{
    "ADP": [
        {
            "stereo": false,
            "atom_1": "C1'",
            "atom_2": "H1'",
            "bond_type": "sing",
            "bond_order": 1,
            "ideal_length": 1.09,
            "aromatic": false
        },
        {
            "stereo": false,
            "atom_1": "PB",
            "atom_2": "O3B",
            "bond_type": "sing",
            "bond_order": 1,
            "ideal_length": 1.609,
            "aromatic": false
        },
        {
            "stereo": false,
            "atom_1": "PB",
            "atom_2": "O2B",
            "bond_type": "sing",
            "bond_order": 1,
            "ideal_length": 1.61,
            "aromatic": false
        },
        {
            "stereo": false,
            "atom_1": "PB",
            "atom_2": "O1B",
            "bond_type": "doub",
            "bond_order": 2,
            "ideal_length": 1.479,
            "aromatic": false
        }
    ]
}
Send a Sample Request


	url
Parameters

hetcode
	String
Compounds - Get similar hetcodes

This call provides hetcodes similar to the query parameter with the same functional annotation.

https://www.ebi.ac.uk/pdbe/graph-api/compound/cofactors/het/:hetcode
Parameter

Field	Type	Description
hetcode	String	
Hetcode for the compound

Success 200

Field	Type	Description
acts_as	String	
Indicates the type if it acts as a cofactor, reactant etc.

chem_comp_ids	Object[]	
A list of Objects including hetcode and it's name.

chem_comp_id	String	
Chemical component identifier, the so-called 3-letter code, but it need not be 3-letter long!

name	String	
A name for the hetcode

Example success response JSON:
{
    "TDP": [
        {
            "acts_as": "cofactor",
            "chem_comp_ids": [
                {
                    "chem_comp_id": "WWF",
                    "name": "C2-1-HYDROXY-3-METHYL-BUTYL-THIAMIN"
                },
                {
                    "chem_comp_id": "TZD",
                    "name": "2-{3-[(4-AMINO-2-METHYLPYRIMIDIN-5-YL)METHYL]-4-METHYL-2-OXO-2,3-DIHYDRO-1,3-THIAZOL-5-YL}ETHYL TRIHYDROGEN DIPHOSPHATE"
                },
                {
                    "chem_comp_id": "TPW",
                    "name": "2-{4-[(4-AMINO-2-METHYLPYRIMIDIN-5-YL)METHYL]-3-METHYLTHIOPHEN-2-YL}ETHYL TRIHYDROGEN DIPHOSPHATE"
                },
                {
                    "chem_comp_id": "TPU",
                    "name": "2-{1-[(4-AMINO-2-METHYLPYRIMIDIN-5-YL)METHYL]-5-METHYL-1H-1,2,3-TRIAZOL-4-YL}ETHYL TRIHYDROGEN DIPHOSPHATE"
                }
            ],
            "class": "Thiamine diphosphate"
        }
    ]
}
Send a Sample Request


	url
Parameters

hetcode
	String
Compounds - Get similar ligands

This call provides ligands similar to the ligand of interest. Stereoisomers, ligands with the same scaffold and ligands with similarity over 60% defined by PARITY method are returned.

https://www.ebi.ac.uk/pdbe/graph-api/compound/similarity/:hetcode
Parameter

Field	Type	Description
hetcode	String	
Hetcode for the compound

Success 200

Field	Type	Description
stereoisomers	Object[]	
A list of stereoisomer hetcode objects.

same_scaffold	Object[]	
A list of hetcode objects which is part of the same scaffold.

chem_comp_id	String	
Chemical component identifier, the so-called 3-letter code, but it need not be 3-letter long!

name	String	
A name for the hetcode

substructure_match	Object[]	
A list of atom names in the hetcode that match with the hetcode in the query

similarity_score	Float	
Similarity score in the range of 0 to 1 defined by the PARITY method.

Example success response JSON:
{
    "STI": [
        {
            "stereoisomers": [],
            "same_scaffold": [
                {
                    "chem_comp_id": "MPZ",
                    "name": "4-[(4-METHYLPIPERAZIN-1-YL)METHYL]-N-{3-[(4-PYRIDIN-3-YLPYRIMIDIN-2-YL)AMINO]PHENYL}BENZAMIDE",
                    "substructure_match": [
                        "O16",
                        "C33",
                        "N34"
                    ],
                    "similarity_score": 0.973
                }
            ],
            "similar_ligands": [
                {
                    "chem_comp_id": "406",
                    "name": "N-[3-(4,5'-BIPYRIMIDIN-2-YLAMINO)-4-METHYLPHENYL]-4-{[(3S)-3-(DIMETHYLAMINO)PYRROLIDIN-1-YL]METHYL}-3-(TRIFLUOROMETHYL)BENZAMIDE",
                    "similarity_score": 0.612,
                    "substructure_match": [
                        "N20",
                        "C25"
                    ]
                },
                {
                    "chem_comp_id": "748",
                    "name": "N-[2-(dimethylamino)ethyl]-N-[[4-[[4-methyl-3-[(4-pyridin-3-ylpyrimidin-2-yl)amino]phenyl]carbamoyl]phenyl]methyl]pyridine-3-carboxamide",
                    "similarity_score": 0.62,
                    "substructure_match": [
                        "CAG",
                        "CAL",
                        "CAA"
                    ]
                },
                {
                    "chem_comp_id": "CQQ",
                    "name": "4-{[4-(dimethylamino)butanoyl]amino}-N-(3-{[4-(pyridin-3-yl)pyrimidin-2-yl]amino}phenyl)benzamide",
                    "similarity_score": 0.609,
                    "substructure_match": [
                        "C17",
                        "C16"
                    ]
                }
            ]
        }
    ]
}
Send a Sample Request


	url
Parameters

hetcode
	String
Compounds - Get substructures for the compound

This call provides information about scaffold and fragments found in the structure.

https://www.ebi.ac.uk/pdbe/graph-api/compound/substructures/:hetcode
Parameter

Field	Type	Description
hetcode	String	
Hetcode for the compound

Example success response JSON:
{
    "ATP": [
        {
            "fragments": {
                "pyrimidine": [
                    [
                        "C4",
                        "N3",
                        "C2",
                        "N1",
                        "C6",
                        "C5"
                    ]
                ],
                "purine": [
                    [
                        "C4",
                        "N3",
                        "N9"
                    ]
                ],
                "imidazole": [
                    [
                        "C4",
                        "C5",
                        "N7",
                        "C8",
                        "N9"
                    ]
                ],
                "adenine": [
                    [
                        "C4",
                        "N3",
                        "C8",
                        "N9"
                    ]
                ],
                "ribose": [
                    [
                        "C1'",
                        "O2'",
                        "O5'"
                    ]
                ],
                "phosphate": [
                    [
                        "O3B",
                        "O3G",
                        "O2G",
                        "O1G",
                        "PG"
                    ],
                    [
                        "O3A",
                        "O3B",
                        "O2B",
                        "O1B",
                        "PB"
                    ],
                    [
                        "O5'",
                        "O3A",
                        "O2A",
                        "O1A",
                        "PA"
                    ]
                ]
            },
            "scaffold": {
                "c1ncc2ncn([C@H]3CCCO3)c2n1": [
                    "C4",
                    "N3"
                ]
            }
        }
    ]
}
Send a Sample Request


	url
Parameters

hetcode
	String
Response

{
    "355": [
        {
            "fragments": {
                "pyridine": [
                    [
                        "N5",
                        "C6",
                        "C5",
                        "C4",
                        "C3",
                        "C2"
                    ]
                ],
                "quinazoline": [
                    [
                        "C31",
                        "C30",
                        "C29",
                        "C28",
                        "C27",
                        "C26",
                        "C25",
                        "N3",
                        "C9",
                        "N2"
                    ]
                ],
                "pyrimidine": [
                    [
                        "C27",
                        "C26",
                        "C25",
                        "N3",
                        "C9",
                        "N2"
                    ],
                    [
                        "N5",
                        "C33",
                        "C32",
                        "C7",
                        "N1",
                        "C6"
                    ]
                ],
                "phenyl": [
                    [
                        "C24",
                        "C23",
                        "C22",
                        "C21",
                        "C20",
                        "C19"
                    ],
                    [
                        "C31",
                        "C30",
                        "C29",
                        "C28",
                        "C27",
                        "C26"
                    ]
                ],
                "amide": [
                    [
                        "N4",
                        "O2",
                        "C17",
                        "C14"
                    ]
                ],
                "cyclohexane": [
                    [
                        "C16",
                        "C15",
                        "C14",
                        "C13",
                        "C12",
                        "C11"
                    ]
                ]
            },
            "scaffold": {
                "O=c1c2ccccc2n(Cc2cc(=O)n3ccccc3n2)c(=O)n1C[C@H]1CC[C@H](C(=O)NCc2ccccc2)CC1": [
                    "C22",
                    "C5",
                    "N4",
                    "C33",
                    "C6",
                    "C28",
                    "C19",
                    "C7",
                    "C10",
                    "N2",
                    "C8",
                    "C3",
                    "C21",
                    "C23",
                    "N1",
                    "C9",
                    "C14",
                    "C18",
                    "C30",
                    "C24",
                    "O2",
                    "O4",
                    "C12",
                    "C4",
                    "O1",
                    "C27",
                    "C16",
                    "C29",
                    "C11",
                    "C20",
                    "C15",
                    "C32",
                    "C31",
                    "N3",
                    "C13",
                    "C26",
                    "O3",
                    "C2",
                    "C17",
                    "N5",
                    "C25"
                ]
            }
        }
    ]
}
Compounds - Get summary information for the compound

This call provides summary information for a chemical component

https://www.ebi.ac.uk/pdbe/graph-api/compound/summary/:hetcode
Parameter

Field	Type	Description
hetcode	String	
Hetcode for the compound

Success 200

Field	Type	Description
name	String	
The name of the chemical component.

released	Boolean	
A flag denoting if the hetcode is released or not.

superseded_by	String	
A hetcode which superseeds the hetcode in query.

formula	String	
The chemical formula of the component.

inchi	String	
The full INCHI of the component.

inchi_key	String	
INCHI key of the component.

smiles	Object[]	
The SMILES representation of the component (could be multiple).

ww_pdb_info	Object	
An info object which provides details of the chemical component from wwPDB.

defined_at	Date	
The date the chemical component was defined in wwPDB.

modified	Date	
The modified date of the chemical component in wwPDB.

modification_flag	String	
Y/N denoting the modification status of the chemical component in wwPDB.

polymer_type	String	
This flag denotes if the chemical component is a polymer or non-polymer in wwPDB.

standard_parent	String	
The standard chemical component defined in wwPDB.

functional_annotations	Object[]	
A list of functional annotations for the chemical component.

cross_links	Object[]	
Cross references for this chemical component from other resources.

resource	String	
The external resource name.

resource_id	String	
The external resource id.

synonyms	Object[]	
A list of synomyms for the chemical component from other sources.

origin	String	
The resource which provides synonym for the chemical component.

value	String	
The synonym provided by the resource.

phys_chem_properties	Object	
An object of physical chemical properties.

phys_chem_properties

Field	Type	Description
crippen_mr	Float	
Wildman-Crippen molar refractivity is a common descriptor accounting for molecular size and polarizability.

num_atom_stereo_centers	Integer	
Number of atoms with four attachments different from each other.

crippen_clog_p	Float	
Octanol/Water partition coeficient predicted using Wildman-Crippen method.

num_rings	Integer	
Number of rings.

num_rotatable_bonds	Integer	
Number of single bonds, not part of a ring bound to a nonterminal heavy atom.

num_heteroatoms	Integer	
Number of non oxygen and non carbon atoms.

fraction_csp3	Float	
Fraction of C atoms that are SP3 hybridized.

num_aromatic_rings	Integer	
Number of aromatic rings for the molecule.

exactmw	Float	
Total mass of the molecule.

num_spiro_atoms	Integer	
Atoms shared between rings that share exactly one atom.

num_heavy_atoms	Integer	
Number of non hydrogen atoms.

num_aliphatic_rings	Integer	
Number of aliphatic rings.

num_hbd	Integer	
Number of hydrogen bond donors.

num_saturated_heterocycles	Integer	
Number of saturated heterocycles.

tpsa	Float	
Topological surface area.

num_bridgehead_atoms	Integer	
Number of atoms shared between rings that share at least two bonds.

num_aromatic_heterocycles	Integer	
Number or aromatic rings with at least two different elements.

labute_asa	Float	
Accessible surface area accorging to the Labute' definition.

num_hba	Integer	
Number of hydrogen bond acceptors.

num_amide_bonds	Integer	
Number of amide bonds.

num_saturated_rings	Integer	
Number of saturated rings.

lipinski_hba	Float	
Number of hydrogen bond acceptors according to Lipinsky definition.

num_unspec_atom_stereo_centers	Integer	
Number of unsuspected stereocenters.

lipinski_hbd	Float	
Number of hydrogen bond donors according to Lipinsky definition.

num_heterocycles	Integer	
Number or rings with at least two different elements.

num_aliphatic_heterocycles	Integer	
Number of aliphatic heterocycles.

Example success response JSON:
{
    "ATP": [
        {
            "name": "ADENOSINE-5'-TRIPHOSPHATE",
            "released": true,
            "superseded_by": null,
            "formula": "C10 H16 N5 O13 P3",
            "inchi": "InChI=1S/C10H16N5O13P3/c11-8-5-9(13-2-12-8)15(3-14-5)10-7(17)6(16)4(26-10)1-25-30(21,22)28-31(23,24)27-29(18,19)20/h2-4,6-7,10,16-17H,1H2,(H,21,22)(H,23,24)(H2,11,12,13)(H2,18,19,20)/t4-,6-,7-,10-/m1/s1",
            "inchi_key": "ZKHQWZAMYRWXGA-KQYNXXCUSA-N",
            "smiles": "c1nc(c2c(n1)n(cn2)C3C(C(C(O3)COP(=O)(O)OP(=O)(O)OP(=O)(O)O)O)O)N",
            "ww_pdb_info": {
                "defined_at": "1999-07-08 00:00:00",
                "modified": "2011-06-04 00:00:00",
                "modification_flag": "N",
                "polymer_type": "NON-POLYMER",
                "standard_parent": null
            },
            "functional_annotations": [],
            "cross_links": [
                {
                    "resource": "BindingDb",
                    "resource_id": "50366480"
                },
                {
                    "resource": "MetaboLights",
                    "resource_id": "MTBLC15422"
                },
                {
                    "resource": "ChEBI",
                    "resource_id": "15422"
                }
            ],
            "synonyms": [
                {
                    "origin": "DrugBank",
                    "value": "Striadyne"
                },
                {
                    "origin": "DrugBank",
                    "value": "Adenosine 5'-triphosphate"
                }
            ],
            "phys_chem_properties": {
                "crippen_mr": 92.446,
                "num_atom_stereo_centers": 6,
                "crippen_clog_p": -2.438,
                "num_rings": 3,
                "num_rotatable_bonds": 15,
                "num_heteroatoms": 21,
                "fraction_csp3": 0.5,
                "num_aromatic_rings": 2,
                "exactmw": 506.996,
                "num_spiro_atoms": 0,
                "num_heavy_atoms": 31,
                "num_aliphatic_rings": 1,
                "num_hbd": 7,
                "num_saturated_heterocycles": 1,
                "tpsa": 279.13,
                "num_bridgehead_atoms": 0,
                "num_aromatic_heterocycles": 2,
                "labute_asa": 194.334,
                "num_hba": 18,
                "num_amide_bonds": 0,
                "num_saturated_rings": 1,
                "lipinski_hba": 18,
                "num_unspec_atom_stereo_centers": 0,
                "lipinski_hbd": 8,
                "num_heterocycles": 3,
                "num_aliphatic_heterocycles": 1
            }
        }
    ]
}
Send a Sample Request


	url
Parameters

hetcode
	String
Compounds - Get summary of Cofactors

This call provides a summary of the cofactor annotation in the PDB.

https://www.ebi.ac.uk/pdbe/graph-api/compound/cofactors/
Success 200

Field	Type	Description
EC	String[]	
A list of enzyme classes (ECs), where cofactors of this class play a biological role.

cofactors	String[]	
A list of het codes annotated as members of the cofactor class.

Example success response JSON:
{
    "Nicotinamide-adenine dinucleotide": [
        {
            "EC": [
                "6.5.1.1",
                "6.5.1.2"
            ],
            "cofactors": [
                "TXE",
                "TXP",
                "ZID"
            ]
        }
    ],
    "Dipyrromethane": [
        {
            "EC": [
                "2.5.1.61"
            ],
            "cofactors": [
                "18W",
                "29P",
                "DPM"
            ]
        }
    ],
    "Coenzyme M": [
        {
            "EC": [
                "2.8.4.1"
            ],
            "cofactors": [
                "COM"
            ]
        }
    ],
    "Factor F430": [
        {
            "EC": [
                "2.8.4.1"
            ],
            "cofactors": [
                "F43",
                "M43"
            ]
        }
    ],
    "Coenzyme B": [
        {
            "EC": [
                "2.8.4.1"
            ],
            "cofactors": [
                "SHT",
                "TP7",
                "TPZ",
                "TXZ",
                "XP8",
                "XP9"
            ]
        }
    ],
    "MIO": [
        {
            "EC": [
                "4.3.1.23",
                "4.3.1.24",
                "4.3.1.25",
                "5.4.3.6"
            ],
            "cofactors": [
                "MDO"
            ]
        }
    ]
}
Send a Sample Request


	url
PDB

PDB - Get FunPDBe annotations for an entity

Get FunPDBe annotations for an entity

https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/annotations/:pdbId/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

entityId	String	
PDB Entity

Success 200

Field	Type	Description
resourceUrl	String	
A URL where details on the resource can be seen.

sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "1a08": {
        "sequence": "MDSIQAEEWYFGKITRRESERLLLNAENPRGTFLVRESETTKGAYCLSVSDFDNAKGLNVKHYKIRKLDSGGFYITSRTQFNSLQQLVAYYSKHADGLCHRLTTVCP",
        "length": 107,
        "dataType": "ANNOTATIONS",
        "data": [
            {
                "name": "dynamine",
                "accession": "dynamine",
                "dataType": "dynamine",
                "residues": [
                    {
                        "startIndex": 1,
                        "endIndex": 1,
                        "indexType": "PDB",
                        "startCode": "MET",
                        "endCode": "MET",
                        "additionalData": {
                            "resourceUrl": "http://dynamine.ibsquare.be/",
                            "rawScore": 0.02,
                            "confidenceScore": 0.5,
                            "confidenceLevel": "null",
                            "groupLabel": "efoldmine",
                            "ordinalId": 3
                        }
                    },
                    {
                        "startIndex": 40,
                        "endIndex": 40,
                        "indexType": "PDB",
                        "startCode": "THR",
                        "endCode": "THR",
                        "additionalData": {
                            "resourceUrl": null,
                            "rawScore": 1,
                            "confidenceScore": 1,
                            "confidenceLevel": "high",
                            "groupLabel": "ligand_binding_site",
                            "ordinalId": 2
                        }
                    },
                    {
                        "startIndex": 41,
                        "endIndex": 41,
                        "indexType": "PDB",
                        "startCode": "THR",
                        "endCode": "THR",
                        "additionalData": {
                            "resourceUrl": null,
                            "rawScore": 1,
                            "confidenceScore": 1,
                            "confidenceLevel": "high",
                            "groupLabel": "ligand_binding_site",
                            "ordinalId": 2
                        }
                    }
                ],
                "additionalData": {
                    "bestChainId": "A",
                    "entityId": 1,
                    "shape": "chevron"
                }
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
PDB - Get FunPDBe resources for a PDB entry

This call provides details of all resources which have data for a PDB entry.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/funpdbe/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Send a Sample Request


	url
Parameters

pdbId
	String
PDB - Get PDB Complex details

Get list of participants and subcomplexes (if any) for any PDB Complex ID.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/complex/:pdbComplexId
Parameter

Field	Type	Description
pdbComplexId	String	
PDB Complex ID (eg. PDB-CPX-3815)

Success 200

Field	Type	Description
participants	Object[]	
A list of participants that take part in a complex.

accession	String	
A unique identifier for the component.

stoichiometry	Integer	
Relative quantity of the component that takes part in the complex.

taxonomy_id	Integer	
Unique identifier assigned by the NCBI to the source organism.

subcomplexes	String[]	
A list of complex IDs which are the subcomplex of the complex in query.

Example success response JSON:
{
    "PDB-CPX-3815": {
        "participants": [
            {
                "accession": "A2NHM3",
                "stoichiometry": 1,
                "taxonomy_id": 10090
            },
            {
                "accession": "P05067",
                "stoichiometry": 1,
                "taxonomy_id": 9606
            },
            {
                "accession": "P05067-10",
                "stoichiometry": 1,
                "taxonomy_id": 9606
            },
            {
                "accession": "P05067-9",
                "stoichiometry": 1,
                "taxonomy_id": 9606
            }
        ],
        "subcomplexes": [
            "PDB-CPX-66754"
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbComplexId
	String
PDB - Get Rfam domains for an entity

Get Rfam domains for an entity

https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/rfam/:pdbId/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

entityId	String	
PDB Entity

Success 200

Field	Type	Description
domainName	String	
Identifier for the accession.

domainId	String	
The mapping accession.

sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "1jj2": {
        "sequence": "UUGGCUACUAUGCCAGCUGGUGGAUUGCUCGGCUCAGGCGCUGAUGAAGGACGUGCCAAGCUGCGAUAAGCCAUGGGGAGCCGCACGGAGGCGAAGAACCAUGGAUUUCCGAAUGAGAAUCUCUCUAACAAUUGCUUCGCGCAAUGAGGAACCCCGAGAACUGAAACAUCUCAGUAUCGGGAGGAACAGAAAACGCAAUGUGAUGUCGUUAGUAACCGCGAGUGAACGCGAUACAGCCCAAACCGAAGCCCUCACGGGCAAUGUGGUGUCAGGGCUACCUCUCAUCAGCCGACCGUCUCGACGAAGUCUCUUGGAACAGAGCGUGAUACAGGGUGACAACCCCGUACUCGAGACCAGUACGACGUGCGGUAGUGCCAGAGUAGCGGGGGUUGGAUAUCCCUCGCGAAUAACGCAGGCAUCGACUGCGAAGGCUAAACACAACCUGAGACCGAUAGUGAACAAGUAGUGUGAACGAACGCUGCAAAGUACCCUCAGAAGGGAGGCGAAAUAGAGCAUGAAAUCAGUUGGCGAUCGAGCGACAGGGCAUACAAGGUCCCUCGACGAAUGACCGACGCGCGAGCGUCCAGUAAGACUCACGGGAAGCCGAUGUUCUGUCGUACGUUUUGAAAAACGAGCCAGGGAGUGUGUCUGCAUGGCAAGUCUAACCGGAGUAUCCGGGGAGGCACAGGGAAACCGACAUGGCCGCAGGGCUUUGCCCGAGGGCCGCCGUCUUCAAGGGCGGGGAGCCAUGUGGACACGACCCGAAUCCGGACGAUCUACGCAUGGACAAGAUGAAGCGUGCCGAAAGGCACGUGGAAGUCUGUUAGAGUUGGUGUCCUACAAUACCCUCUCGUGAUCUAUGUGUAGGGGUGAAAGGCCCAUCGAGUCCGGCAACAGCUGGUUCCAAUCGAAACAUGUCGAAGCAUGACCUCCGCCGAGGUAGUCUGUGAGGUAGAGCGACCGAUUGGUGUGUCCGCCUCCGAGAGGAGUCGGCACACCUGUCAAACUCCAAACUUACAGACGCCGUUUGACGCGGGGAUUCCGGUGCGCGGGGUAAGCCUGUGUACCAGGAGGGGAACAACCCAGAGAUAGGUUAAGGUCCCCAAGUGUGGAUUAAGUGUAAUCCUCUGAAGGUGGUCUCGAGCCCUAGACAGCCGGGAGGUGAGCUUAGAAGCAGCUACCCUCUAAGAAAAGCGUAACAGCUUACCGGCCGAGGUUUGAGGCGCCCAAAAUGAUCGGGACUCAAAUCCACCACCGAGACCUGUCCGUACCACUCAUACUGGUAAUCGAGUAGAUUGGCGCUCUAAUUGGAUGGAAGUAGGGGUGAAAACUCCUAUGGACCGAUUAGUGACGAAAAUCCUGGCCAUAGUAGCAGCGAUAGUCGGGUGAGAACCCCGACGGCCUAAUGGAUAAGGGUUCCUCAGCACUGCUGAUCAGCUGAGGGUUAGCCGGUCCUAAGUCAUACCGCAACUCGACUAUGACGAAAUGGGAAACGGGUUAAUAUUCCCGUGCCACUAUGCAGUGAAAGUUGACGCCCUGGGGUCGAUCACGCUGGGCAUUCGCCCAGUCGAACCGUCCAACUCCGUGGAAGCCGUAAUGGCAGGAAGCGGACGAACGGCGGCAUAGGGAAACGUGAUUCAACCUGGGGCCCAUGAAAAGACGAGCAUAGUGUCCGUACCGAGAACCGACACAGGUGUCCAUGGCGGCGAAAGCCAAGGCCUGUCGGGAGCAACCAACGUUAGGGAAUUCGGCAAGUUAGUCCCGUACCUUCGGAAGAAGGGAUGCCUGCUCCGGAACGGAGCAGGUCGCAGUGACUCGGAAGCUCGGACUGUCUAGUAACAACAUAGGUGACCGCAAAUCCGCAAGGACUCGUACGGUCACUGAAUCCUGCCCAGUGCAGGUAUCUGAACACCUCGUACAAGAGGACGAAGGACCUGUCAACGGCGGGGGUAACUAUGACCCUCUUAAGGUAGCGUAGUACCUUGCCGCAUCAGUAGCGGCUUGCAUGAAUGGAUUAACCAGAGCUUCACUGUCCCAACGUUGGGCCCGGUGAACUGUACAUUCCAGUGCGGAGUCUGGAGACACCCAGGGGGAAGCGAAGACCCUAUGGAGCUUUACUGCAGGCUGUCGCUGAGACGUGGUCGCCGAUGUGCAGCAUAGGUAGGAGACACUACACAGGUACCCGCGCUAGCGGGCCACCGAGUCAACAGUGAAAUACUACCCGUCGGUGACUGCGACUCUCACUCCGGGAGGAGGACACCGAUAGCCGGGCAGUUUGACUGGGGCGGUACGCGCUCGAAAAGAUAUCGAGCGCGCCCUAUGGCUAUCUCAGCCGGGACAGAGACCCGGCGAAGAGUGCAAGAGCAAAAGAUAGCUUGACAGUGUUCUUCCCAACGAGGAACGCUGACGCGAAAGCGUGGUCUAGCGAACCAAUUAGCCUGCUUGAUGCGGGCAAUUGAUGACAGAAAAGCUACCCUAGGGAUAACAGAGUCGUCACUCGCAAGAGCACAUAUCGACCGAGUGGCUUGCUACCUCGAUGUCGGUUCCCUCCAUCCUGCCCGUGCAGAAGCGGGCAAGGGUGAGGUUGUUCGCCUAUUAAAGGAGGUCGUGAGCUGGGUUUAGACCGUCGUGAGACAGGUCGGCUGCUAUCUACUGGGUGUGUAAUGGUGUCUGACAAGAACGACCGUAUAGUACGAGAGGAACUACGGUUGGUGGCCACUGGUGUACCGGUUGUUCGAGAGAGCACGUGCCGGGUAGCCACGCCACACGGGGUAAGAGCUGAACGCAUCUAAGCUCGAAACCCACUUGGAAAAGAGACACCGCCGAGGUCCCGCGUACAAGACGCGGUCGAUAGACUCGGGGUGUGCGCGUCGAGGUAACGAGACGUUAAGCCCACGAGCACUAACAGACCAAAGCCAUCAU",
        "length": 2922,
        "dataType": "RFAM",
        "data": [
            {
                "dataType": "Rfam",
                "accession": "Rfam domains",
                "name": "Rfam domains",
                "additionalData": {
                    "entityId": 1,
                    "bestChainId": "A"
                },
                "residues": [
                    {
                        "startIndex": 1,
                        "endIndex": 2922,
                        "startCode": "U",
                        "endCode": "U",
                        "indexType": "PDB",
                        "additionalData": {
                            "domainName": "Archaeal large subunit ribosomal RNA",
                            "domainId": "RF02540"
                        }
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
PDB - Get UniProt mapping for an entity

Get UniProt mapping for an entity

https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/uniprot_mapping/:pdbId/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

entityId	String	
PDB Entity

Success 200

Field	Type	Description
unpStartIndex	Integer	
Start residue number of UniProt.

unpEndIndex	Integer	
End residue number of UniProt.

sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "1wpg": {
        "sequence": "MEAAHSKSTEECLAYFGVSETTGLTPDQVKRHLEKYGHNELPAEEGKSLWELVIEQFEDLLVRILLLAACISFVLAWFEEGEETITAFVEPFVILLILIANAIVGVWQERNAENAIEALKEYEPEMGKVYRADRKSVQRIKARDIVPGDIVEVAVGDKVPADIRILSIKSTTLRVDQSILTGESVSVIKHTEPVPDPRAVNQDKKNMLFSGTNIAAGKALGIVATTGVSTEIGKIRDQMAATEQDKTPLQQKLDEFGEQLSKVISLICVAVWLINIGHFNDPVHGGSWIRGAIYYFKIAVALAVAAIPEGLPAVITTCLALGTRRMAKKNAIVRSLPSVETLGCTSVICSDKTGTLTTNQMSVCKMFIIDKVDGDFCSLNEFSITGSTYAPEGEVLKNDKPIRSGQFDGLVELATICALCNDSSLDFNETKGVYEKVGEATETALTTLVEKMNVFNTEVRNLSKVERANACNSVIRQLMKKEFTLEFSRDRKSMSVYCSPAKSSRAAVGNKMFVKGAPEGVIDRCNYVRVGTTRVPMTGPVKEKILSVIKEWGTGRDTLRCLALATRDTPPKREEMVLDDSSRFMEYETDLTFVGVVGMLDPPRKEVMGSIQLCRDAGIRVIMITGDNKGTAIAICRRIGIFGENEEVADRAYTGREFDDLPLAEQREACRRACCFARVEPSHKSKIVEYLQSYDEITAMTGDGVNDAPALKKAEIGIAMGSGTAVAKTASEMVLADDNFSTIVAAVEEGRAIYNNMKQFIRYLISSNVGEVVCIFLTAALGLPEALIPVQLLWVNLVTDGLPATALGFNPPDLDIMDRPPRSPKEPLISGWLFFRYMAIGGYVGAATVGAAAWWFMYAEDGPGVTYHQLTHFMQCTEDHPHFEGLDCEIFEAPEPMTMALSVLVTIEMCNALNSLSENQSLMRMPPWVNIWLLGSICLSMSLHFLILYVDPLPMIFKLKALDLTQWLMVLKISLPVIGLDEILKFIARNYLEG",
        "length": 994,
        "dataType": "UNIPROT MAPPING",
        "data": [
            {
                "dataType": "UniProt",
                "accession": "P04191",
                "name": "AT2A1_RABIT",
                "residues": [
                    {
                        "startIndex": 1,
                        "endIndex": 993,
                        "startCode": "MET",
                        "endCode": "GLU",
                        "unpStartIndex": 1,
                        "unpEndIndex": 993,
                        "indexType": "PDB"
                    }
                ],
                "additionalData": {
                    "bestChainId": "A",
                    "entityId": 1
                }
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
PDB - Get all FunPDBe annotations for a PDB entry from a specific resource

This call provides details of all FunPDBe annotations for a PDB entry from a specific resource.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/funpdbe_annotation/:origin/:pdbId
Parameter

Field	Type	Description
origin	String	
Origin/Resource

Allowed values: "cath-funsites", "14-3-3-pred", "3Dcomplex", "akid", "3dligandsite", "camkinet", "canSAR", "ChannelsDB", "depth", "dynamine", "FoldX", "MetalPDB", "M-CSA", "p2rank", "Missense3D", "POPScomp_PDBML", "ProKinO"

pdbId	String	
PDB Entry ID

Send a Sample Request


	url
Parameters

origin
	String
pdbId
	String
PDB - Get all FunPDBe annotations for a PDB entry

This call provides details of all FunPDBe annotations for a PDB entry.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/funpdbe_annotation/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Send a Sample Request


	url
Parameters

pdbId
	String
PDB - Get binding sites for a PDB entry

This call provides details on binding sites in the entry as per STRUCT_SITE records in PDB files (or mmcif equivalent thereof), such as ligand, residues in the site, description of the site, etc.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/binding_sites/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Send a Sample Request


	url
Parameters

pdbId
	String
PDB - Get binding sites for an entity

Get binding sites for an entity

https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/binding_sites/:pdbId/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

entityId	String	
PDB Entity

Success 200

Field	Type	Description
scaffoldId	String	
SMILES representation of the scaffold.

cofactorId	String	
Unique identifier for the cofactor.

residueCount	Integer	
Number of residues binding to the ligand.

boundMoleculeId	String	
Unique identifier for the bound molecule.

sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "1cbs": {
        "sequence": "PNFSGNWKIIRSENFEELLKVLGVNVMLRKIAVAAASKPAVEIKQEGDTFYIKTSTTVRTTEINFKVGEEFEEQTVDGRPCKSLVKWESENKMVCEQKLLKGEGPKTSWTRELTNDGELILTMTADDVVCTRVYVRE",
        "length": 137,
        "dataType": "LIGAND BINDING SITES",
        "data": [
            {
                "dataType": "Ligand",
                "accession": "REA",
                "additionalData": {
                    "bestChainId": "A",
                    "entityId": 1,
                    "scaffoldId": "C1=CCCCC1",
                    "cofactorId": "",
                    "residueCount": 18
                },
                "residues": [
                    {
                        "startIndex": 15,
                        "endIndex": 15,
                        "startCode": "PHE",
                        "endCode": "PHE",
                        "indexType": "PDB",
                        "additionalData": {
                            "boundMoleculeId": "bm1"
                        }
                    }
                ],
                "name": "RETINOIC ACID"
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
PDB - Get bound ligand interactions

Get interactions for a bound ligand found in the entry.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/bound_ligand_interactions/:pdbId/:chain/:seqId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID.

chain	String	
Chain id aka auth_asym_id.

seqId	Integer	
Residue id id aka auth_seq_id.

Success 200

Field	Type	Description
ligand	String	
A ligand object.

interactions	Object[]	
A list of interactions.

ligand_atoms	String[]	
A list of atoms.

interaction_class	String	
The class of interaction. It can be atom-atom, atom-plane, plane-plane, group-plane and group-group.

atom_names	String[]	
A list of atom names.

interaction_details	String[]	
A list of interaction types. More info can be found here

distance	Float	
Distance in ångströms between the components that take part in interaction.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": [
        {
            "ligand": {
                "author_residue_number": 200,
                "chain_id": "A",
                "chem_comp_id": "REA",
                "author_insertion_code": " "
            },
            "interactions": [
                {
                    "ligand_atoms": [
                        "C11"
                    ],
                    "end": {
                        "chain_id": "A",
                        "author_residue_number": 15,
                        "chem_comp_id": "PHE",
                        "atom_names": [
                            "CZ"
                        ],
                        "author_insertion_code": " "
                    },
                    "interaction_type": "atom-atom",
                    "interaction_details": [
                        "hydrophobic"
                    ],
                    "distance": 4.05
                }
            ]
        }
    ]
}
Send a Sample Request


	url
Parameters

pdbId
	String
chain
	String
seqId
	Integer
PDB - Get bound molecule interactions

Get composition and high-level interactions of the bound molecule in the given entry.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/bound_molecule_interactions/:pdbId/:bmid
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

bmid	String	
Bound molecule ID (can be obtained from the output of bound_molecules call).

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

bm_id	String	
Bound molecule ID (can be obtained from the output of bound_molecules call).

interactions	Object	
An interaction class object and each item is a list of different types of interactions.

ligands	Object[]	
A list of ligands.

composition	Object	
An object which denotes the composition of a bound molecule.

connections	String[][]	
This defines the connection between 2 ligands in a bound molecule. Each ligand is represented as a concatenation of chain_id and author_residue_number.

Example success response JSON:
{
    "3d12": [
        {
            "interactions": [
                {
                    "begin": {
                        "chain_id": "A",
                        "author_residue_number": 1361,
                        "chem_comp_id": "NGA",
                        "author_insertion_code": " "
                    },
                    "end": {
                        "chain_id": "A",
                        "author_residue_number": 1362,
                        "chem_comp_id": "LXZ",
                        "author_insertion_code": " "
                    },
                    "interactions": {
                        "atom_atom": [
                            "vdw_clash",
                            "covalent",
                            "weak_polar",
                            "polar",
                            "weak_hbond",
                            "vdw"
                        ],
                        "atom_plane": [],
                        "plane_plane": [],
                        "group_group": [],
                        "group_plane": []
                    }
                }
            ],
            "bm_id": "bm1",
            "composition": {
                "ligands": [
                    {
                        "chain_id": "A",
                        "author_residue_number": 1365,
                        "chem_comp_id": "GLC",
                        "author_insertion_code": " "
                    },
                    {
                        "chain_id": "A",
                        "author_residue_number": 1363,
                        "chem_comp_id": "GL0",
                        "author_insertion_code": " "
                    }
                ],
                "connections": [
                    [
                        "A1363",
                        "A1365"
                    ],
                    [
                        "A1363",
                        "A1364"
                    ],
                    [
                        "A1362",
                        "A1363"
                    ],
                    [
                        "A1361",
                        "A1362"
                    ],
                    [
                        "A1361",
                        "A1367"
                    ],
                    [
                        "A1361",
                        "A1366"
                    ]
                ]
            }
        }
    ]
}
Send a Sample Request


	url
Parameters

pdbId
	String
bmid
	String
PDB - Get bound molecules excluding carbohydrate polymers

Get definitions and internal connectivity of all non-carbohydrate-polymer bound molecules found in a given entry.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/bound_excluding_branched/:pdbId/
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Send a Sample Request


	url
Parameters

pdbId
	String
PDB - Get bound molecules

Get definitions and internal connectivity of all bound molecules found in a given entry.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/bound_molecules/:pdbId/
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

bm_id	String	
Bound molecule ID (can be obtained from the output of bound_molecules call).

interactions	Object	
An interaction class object and each item is a list of different types of interactions.

ligands	Object[]	
A list of ligands.

composition	Object	
An object which denotes the composition of a bound molecule.

connections	String[][]	
This defines the connection between 2 ligands in a bound molecule. Each ligand is represented as a concatenation of chain_id and author_residue_number.

Example success response JSON:
{
    "3d12": [
        {
            "bm_id": "bm1",
            "composition": {
                "ligands": [
                    {
                        "chain_id": "A",
                        "author_residue_number": 1365,
                        "chem_comp_id": "GLC",
                        "author_insertion_code": " "
                    },
                    {
                        "chain_id": "A",
                        "author_residue_number": 1363,
                        "chem_comp_id": "GL0",
                        "author_insertion_code": " "
                    }
                ],
                "connections": [
                    [
                        "A1363",
                        "A1365"
                    ],
                    [
                        "A1363",
                        "A1364"
                    ]
                ]
            }
        },
        {
            "bm_id": "bm10",
            "composition": {
                "ligands": [
                    {
                        "chain_id": "B",
                        "author_residue_number": 202,
                        "chem_comp_id": "SO4",
                        "author_insertion_code": " "
                    }
                ],
                "connections": []
            }
        },
        {
            "bm_id": "bm11",
            "composition": {
                "ligands": [
                    {
                        "chain_id": "B",
                        "author_residue_number": 203,
                        "chem_comp_id": "SO4",
                        "author_insertion_code": " "
                    }
                ],
                "connections": []
            }
        },
        {
            "bm_id": "bm2",
            "composition": {
                "ligands": [
                    {
                        "chain_id": "D-2",
                        "author_residue_number": 1463,
                        "chem_comp_id": "GL0",
                        "author_insertion_code": " "
                    }
                ],
                "connections": [
                    [
                        "D-21463",
                        "D-21464"
                    ],
                    [
                        "D-21462",
                        "D-21463"
                    ]
                ]
            }
        },
        {
            "bm_id": "bm20",
            "composition": {
                "ligands": [
                    {
                        "chain_id": "A",
                        "author_residue_number": 1376,
                        "chem_comp_id": "SO4",
                        "author_insertion_code": " "
                    }
                ],
                "connections": []
            }
        },
        {
            "bm_id": "bm21",
            "composition": {
                "ligands": [
                    {
                        "chain_id": "D-2",
                        "author_residue_number": 1468,
                        "chem_comp_id": "SO4",
                        "author_insertion_code": " "
                    }
                ],
                "connections": []
            }
        },
        {
            "bm_id": "bm6",
            "composition": {
                "ligands": [
                    {
                        "chain_id": "D-2",
                        "author_residue_number": 1414,
                        "chem_comp_id": "NAG",
                        "author_insertion_code": " "
                    },
                    {
                        "chain_id": "D-2",
                        "author_residue_number": 1413,
                        "chem_comp_id": "NAG",
                        "author_insertion_code": " "
                    }
                ],
                "connections": [
                    [
                        "D-21413",
                        "D-21414"
                    ]
                ]
            }
        }
    ]
}
Send a Sample Request


	url
Parameters

pdbId
	String
PDB - Get carbohydrate polymer interactions

Get composition and high-level interactions of the carbohydrate polymer in the given entry.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/carbohydrate_polymer_interactions/:pdbId/:bmid/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

bmid	String	
Bound molecule ID (can be obtained from the output of bound_molecules call).

entityId	String	
Entity ID (can be obtained from the output of bound_molecules call).

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

bm_id	String	
Bound molecule ID (can be obtained from the output of bound_molecules call).

interactions	Object	
An interaction class object and each item is a list of different types of interactions.

ligands	Object[]	
A list of ligands.

composition	Object	
An object which denotes the composition of a bound molecule.

connections	String[][]	
This defines the connection between 2 ligands in a bound molecule. Each ligand is represented as a concatenation of chain_id and author_residue_number.

Send a Sample Request


	url
Parameters

pdbId
	String
bmid
	String
entityId
	String
PDB - Get carbohydrate polymers

Get definitions and internal connectivity of all carbohydrate polymers found in a given entry.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/carbohydrate-polymer/:pdbId/
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Send a Sample Request


	url
Parameters

pdbId
	String
PDB - Get chain and quality information for an entity

Get chain and quality information for an entity

https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/chains/:pdbId/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

entityId	String	
PDB Entity

Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
PDB - Get interface residues for an entity

Get interface residues for an entity

https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/interfaces/:pdbId/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

entityId	String	
PDB Entity

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "2etx": {
        "sequence": "GHMTKLNQESTAPKVLFTGVVDARGERAVLALGGSLAGSAAEASHLVTDRIRRTVKFLCALGRGIPILSLDWLHQSRKAGFFLPPDEYVVTDPEQEKNFGFSLQDALSRARERRLLEGYEIYVTPGVQPPPPQMGEIISCCGGTYLPSMPRSYKPQRVVITCPQDFPHCSIPLRVGLPLLSPEFLLTGVLKQEAKPEAFVLSPLEMSST",
        "length": 209,
        "dataType": "INTERFACE RESIDUES",
        "data": [
            {
                "dataType": "UniProt",
                "accession": "Q14676",
                "name": "Mediator of DNA damage checkpoint protein 1",
                "additionalData": {
                    "bestChainId": "B",
                    "entityId": 1
                },
                "residues": [
                    {
                        "startIndex": 42,
                        "endIndex": 42,
                        "startCode": "GLU",
                        "endCode": "GLU",
                        "indexType": "PDB"
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
PDB - Get list of modelled instances of ligands

This call provides a list of modelled instances of ligands, i.e. 'bound' molecules that are not waters.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/ligand_monomers/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

chem_comp_name	String	
Name for the chemical component.

Example success response JSON:
{
    "3d12": [
        {
            "chem_comp_name": "N-ACETYL-D-GLUCOSAMINE",
            "entity_id": 3,
            "residue_number": "",
            "author_residue_number": 1310,
            "chain_id": "D",
            "alternate_conformers": 0,
            "author_insertion_code": "",
            "chem_comp_id": "NAG",
            "struct_asym_id": "QA"
        },
        {
            "chem_comp_name": "ALPHA-L-GALACTOPYRANOSE",
            "entity_id": 14,
            "residue_number": "",
            "author_residue_number": 1467,
            "chain_id": "D",
            "alternate_conformers": 0,
            "author_insertion_code": "",
            "chem_comp_id": "GXL",
            "struct_asym_id": "PA"
        }
    ]
}
Send a Sample Request


	url
Parameters

pdbId
	String
PDB - Get modified residues for PDB entry

This call provides a list of modelled instances of modified amino acids or nucleotides in protein, DNA or RNA chains.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/modified_AA_or_NA/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

Success 200

Field	Type	Description
chem_comp_id	String	
Chemical component identifier.

chem_comp_name	String	
Name for the chemical component.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "4v5j": [
        {
            "chem_comp_name": "3'-amino-3'-deoxyadenosine 5'-(dihydrogen phosphate)",
            "entity_id": 22,
            "residue_number": 76,
            "author_residue_number": 76,
            "chain_id": "CW",
            "alternate_conformers": 0,
            "author_insertion_code": "",
            "chem_comp_id": "8AN",
            "struct_asym_id": "DC"
        }
    ]
}
Send a Sample Request


	url
Parameters

pdbId
	String
PDB - Get mutated residues for PDB entry

This call provides a list of modelled instances of mutated amino acids in proteins in an entry. (Note that at present it does not provide information about mutated nucleotides in RNA or DNA chains, but it would do so in near future.)

https://www.ebi.ac.uk/pdbe/graph-api/pdb/mutated_AA_or_NA/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

Success 200

Field	Type	Description
mutation_details	String	
An object of mutation details.

type	String	
The type of mutation.

from	String	
One-letter-code of original residue.

to	String	
One-letter-code of residue that the original one was mutated to.

chem_comp_id	String	
Chemical component identifier.

chem_comp_name	String	
Name for the chemical component.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1bgj": [
        {
            "entity_id": 1,
            "residue_number": 116,
            "author_residue_number": "",
            "chain_id": "A",
            "author_insertion_code": "",
            "mutation_details": {
                "to": "S",
                "from": "C",
                "type": "Engineered mutation"
            },
            "chem_comp_id": "SER",
            "struct_asym_id": "A"
        },
        {
            "entity_id": 1,
            "residue_number": 162,
            "author_residue_number": "",
            "chain_id": "A",
            "author_insertion_code": "",
            "mutation_details": {
                "to": "R",
                "from": "H",
                "type": "Engineered mutation"
            },
            "chem_comp_id": "ARG",
            "struct_asym_id": "A"
        }
    ]
}
Send a Sample Request


	url
Parameters

pdbId
	String
PDB - Get secondary structures for a PDB entry

This call provides details about residue ranges of regular secondary structure (alpha helices and beta strands) found in protein chains of the entry. For strands, sheet id can be used to identify a beta sheet.

https://www.ebi.ac.uk/pdbe/graph-api/pdb/secondary_structure/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
molecules	Object[]	
List of molecules (i.e. mmcif entities).

helices	Object[]	
Description of alpha helices.

strands	Object[]	
Description of beta sheets and strands.

sheet_id	Integer	
Sheet identifier helpful in finding ranges that form a single beta sheet.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

chem_comp_name	String	
Name for the chemical component.

Example success response JSON:
{
    "1cbs": {
        "molecules": [
            {
                "entity_id": 1,
                "chains": [
                    {
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "secondary_structure": {
                            "helices": [
                                {
                                    "start": {
                                        "author_residue_number": 14,
                                        "author_insertion_code": null,
                                        "residue_number": 14
                                    },
                                    "end": {
                                        "author_residue_number": 22,
                                        "author_insertion_code": null,
                                        "residue_number": 22
                                    }
                                }
                            ],
                            "strands": [
                                {
                                    "start": {
                                        "author_residue_number": 5,
                                        "author_insertion_code": null,
                                        "residue_number": 5
                                    },
                                    "end": {
                                        "author_residue_number": 13,
                                        "author_insertion_code": null,
                                        "residue_number": 13
                                    },
                                    "sheet_id": 1
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
PDB - Get secondary structures for an entity

Get secondary structures for an entity

https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/secondary_structure/:pdbId/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

entityId	String	
PDB Entity

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "5bp8": {
        "sequence": "SNATPAPREAEAAALLAATVADPWGLVAPSVYDTARLVSLAPWLDGHRERLGYLAKEQNQDGSWGAPDGYGLVPTLSAVEALLTELARTDSGAPHLSPDDLAAACADGLGALRDGLLAGPVPDTIGVEFVAPSLLADINTRLAALTEQAPGKLGAWSGTTLTSPAPDLDGALLAGVRE*TEQAPLPEKLWHTLEAVTRDGTRGARPHEGAPPHNGSVGCSPAATAAWLGAAPDPAAPGVAYLRDVQARFGGPVPSITPIVYFEQAWVLNSLAASGLRYEAPAALLDSLEAGLTDEGIAAAPGLPSDSDDTAAVLFALAQHGRTHRPDSL*HFRRDGYFSCFGVERTPSTSTNAHILEALGHHVTVRPDDAGRYGAEIR*ISDWLLDNQLPDGSW*DKWHASPYYATACCALALAEFGGPSARAAVDRAAAWALATQRADGSWGRWQGTTEETAY*VQLL*RTRTPGSPGTVARSAARGCDALLAHDDPASYPGLWHDKDIYAPVTVIRAARLAALALGGAASA",
        "length": 523,
        "dataType": "SECONDARY STRUCTURES",
        "data": [
            {
                "dataType": "Helix",
                "accession": "Helix",
                "name": "Helix",
                "residues": [
                    {
                        "startIndex": 6,
                        "endIndex": 21,
                        "startCode": "ALA",
                        "endCode": "ALA",
                        "indexType": "PDB"
                    }
                ],
                "additionalData": {
                    "bestChainId": "A",
                    "entityId": 1
                }
            },
            {
                "dataType": "MobiDB",
                "accession": "MobiDB",
                "name": "MobiDB",
                "additionalData": {
                    "bestChainId": "A",
                    "entityId": 1
                },
                "residues": [
                    {
                        "startIndex": 199,
                        "endIndex": 218,
                        "startCode": "ASP",
                        "endCode": "GLY",
                        "indexType": "PDB"
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
PDB - Get sequence and structural domains for an entity

Get sequence and structural domains for an entity

https://www.ebi.ac.uk/pdbe/graph-api/pdbe_pages/domains/:pdbId/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

entityId	String	
PDB Entity

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "1cbs": {
        "sequence": "PNFSGNWKIIRSENFEELLKVLGVNVMLRKIAVAAASKPAVEIKQEGDTFYIKTSTTVRTTEINFKVGEEFEEQTVDGRPCKSLVKWESENKMVCEQKLLKGEGPKTSWTRELTNDGELILTMTADDVVCTRVYVRE",
        "length": 137,
        "dataType": "DOMAINS",
        "data": [
            {
                "dataType": "CATH",
                "accession": "CATH domains",
                "name": "CATH domains",
                "additionalData": {
                    "entityId": 1,
                    "bestChainId": "A"
                },
                "residues": [
                    {
                        "startIndex": 1,
                        "endIndex": 137,
                        "startCode": "PRO",
                        "endCode": "GLU",
                        "indexType": "PDB",
                        "additionalData": {
                            "domainName": "Cellular retinoic acid binding protein type ii. Chain:a. Engineered:yes",
                            "domainId": "2.40.128.20",
                            "domain": "1cbsA00"
                        }
                    }
                ]
            },
            {
                "dataType": "SCOP",
                "accession": "SCOP domains",
                "name": "SCOP domains",
                "additionalData": {
                    "entityId": 1,
                    "bestChainId": "A"
                },
                "residues": [
                    {
                        "startIndex": 1,
                        "endIndex": 137,
                        "startCode": "PRO",
                        "endCode": "GLU",
                        "indexType": "PDB",
                        "additionalData": {
                            "domainName": "Fatty acid binding protein-like",
                            "domainId": "50847",
                            "domain": "d1cbsa_"
                        }
                    }
                ]
            },
            {
                "dataType": "Pfam",
                "accession": "Pfam domains",
                "name": "Pfam domains",
                "additionalData": {
                    "entityId": 1,
                    "bestChainId": "A"
                },
                "residues": [
                    {
                        "startIndex": 4,
                        "endIndex": 137,
                        "startCode": "SER",
                        "endCode": "GLU",
                        "indexType": "PDB",
                        "additionalData": {
                            "domainName": "Lipocalin / cytosolic fatty-acid binding protein family",
                            "domainId": "PF00061"
                        }
                    }
                ]
            },
            {
                "dataType": "InterPro",
                "accession": "InterPro annotations",
                "name": "InterPro annotations",
                "additionalData": {
                    "entityId": 1,
                    "bestChainId": "A"
                },
                "residues": [
                    {
                        "startIndex": 1,
                        "endIndex": 137,
                        "startCode": "PRO",
                        "endCode": "GLU",
                        "indexType": "PDB",
                        "additionalData": {
                            "domainName": "Cellular retinoic acid-binding protein 2",
                            "domainId": "IPR031281"
                        }
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
PDB - Get sequence conservations for a PDB Entity

Get sequence conservations for a PDB Entity

https://www.ebi.ac.uk/pdbe/graph-api/pdb/sequence_conservation/:pdbId/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry

entityId	String	
PDB Entity

Success 200

Field	Type	Description
entity_id	Integer	
Entity id (molecule number in mmcif-speak).

length	Integer	
Length of entities, available for polymeric entities.

amino	Object[]	
List of amino acids.

letter	String	
Amino acid one-letter code.

proba	Float	
The probability score.

start	Integer	
mmcif-style residue index of the starting residue (within entity or struct_asym_id).

end	Integer	
mmcif-style residue index of the ending residue (within entity or struct_asym_id).

seqId	String	
An MD5 hash representation of the sequence.

Example success response JSON:
{
    "1cbs": {
        "entity_id": 1,
        "length": 137,
        "data": [
            {
                "start": 1,
                "end": 1,
                "conservation_score": 1,
                "tooltipContent": "Conservation score:1",
                "amino": [
                    {
                        "end": 1,
                        "letter": "P",
                        "proba": 0.428,
                        "start": 1,
                        "color": "#c0c000",
                        "tooltipContent": "Amino acid:PRO<br/>Probability:42.80%"
                    },
                    {
                        "end": 1,
                        "letter": "A",
                        "proba": 0.065,
                        "start": 1,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:ALA<br/>Probability:6.50%"
                    },
                    {
                        "end": 1,
                        "letter": "S",
                        "proba": 0.055,
                        "start": 1,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:SER<br/>Probability:5.50%"
                    },
                    {
                        "end": 1,
                        "letter": "E",
                        "proba": 0.042,
                        "start": 1,
                        "color": "#c048c0",
                        "tooltipContent": "Amino acid:GLU<br/>Probability:4.20%"
                    },
                    {
                        "end": 1,
                        "letter": "T",
                        "proba": 0.042,
                        "start": 1,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:THR<br/>Probability:4.20%"
                    },
                    {
                        "end": 1,
                        "letter": "G",
                        "proba": 0.041,
                        "start": 1,
                        "color": "#f09048",
                        "tooltipContent": "Amino acid:GLY<br/>Probability:4.10%"
                    },
                    {
                        "end": 1,
                        "letter": "K",
                        "proba": 0.039,
                        "start": 1,
                        "color": "#f01505",
                        "tooltipContent": "Amino acid:LYS<br/>Probability:3.90%"
                    },
                    {
                        "end": 1,
                        "letter": "D",
                        "proba": 0.035,
                        "start": 1,
                        "color": "#c048c0",
                        "tooltipContent": "Amino acid:ASP<br/>Probability:3.50%"
                    },
                    {
                        "end": 1,
                        "letter": "L",
                        "proba": 0.035,
                        "start": 1,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:LEU<br/>Probability:3.50%"
                    },
                    {
                        "end": 1,
                        "letter": "V",
                        "proba": 0.035,
                        "start": 1,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:VAL<br/>Probability:3.50%"
                    },
                    {
                        "end": 1,
                        "letter": "N",
                        "proba": 0.031,
                        "start": 1,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:ASN<br/>Probability:3.10%"
                    },
                    {
                        "end": 1,
                        "letter": "R",
                        "proba": 0.031,
                        "start": 1,
                        "color": "#f01505",
                        "tooltipContent": "Amino acid:ARG<br/>Probability:3.10%"
                    },
                    {
                        "end": 1,
                        "letter": "Q",
                        "proba": 0.027,
                        "start": 1,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:GLN<br/>Probability:2.70%"
                    },
                    {
                        "end": 1,
                        "letter": "I",
                        "proba": 0.024,
                        "start": 1,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:ILE<br/>Probability:2.40%"
                    },
                    {
                        "end": 1,
                        "letter": "F",
                        "proba": 0.015,
                        "start": 1,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:PHE<br/>Probability:1.50%"
                    },
                    {
                        "end": 1,
                        "letter": "H",
                        "proba": 0.014,
                        "start": 1,
                        "color": "#15a4a4",
                        "tooltipContent": "Amino acid:HIS<br/>Probability:1.40%"
                    },
                    {
                        "end": 1,
                        "letter": "Y",
                        "proba": 0.014,
                        "start": 1,
                        "color": "#15a4a4",
                        "tooltipContent": "Amino acid:TYR<br/>Probability:1.40%"
                    },
                    {
                        "end": 1,
                        "letter": "M",
                        "proba": 0.012,
                        "start": 1,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:MET<br/>Probability:1.20%"
                    },
                    {
                        "end": 1,
                        "letter": "C",
                        "proba": 0.011,
                        "start": 1,
                        "color": "#f08080",
                        "tooltipContent": "Amino acid:CYS<br/>Probability:1.10%"
                    },
                    {
                        "end": 1,
                        "letter": "W",
                        "proba": 0.005,
                        "start": 1,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:TRP<br/>Probability:0.50%"
                    }
                ],
                "labelColor": "rgb(211,211,211)"
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
Residue

Residue - Get FunPDBe annotations for a PDB Residue

Get FunPDBe annotations for a PDB Residue

https://www.ebi.ac.uk/pdbe/graph-api/residue_mapping/funpdbe_annotation/:pdbId/:entityId/:residueNumber
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

entityId	String	
PDB Entity ID

residueNumber	String	
PDB Residue Number

Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
residueNumber
	String
Residue - Get annotations for a PDB Residue range

Get mappings (as assigned by the SIFTS process) for a PDB Residue range to UniProt, Pfam, InterPro, CATH, SCOP, IntEnz, GO, Ensembl and HMMER accessions (and vice versa).

https://www.ebi.ac.uk/pdbe/graph-api/residue_mapping/:pdbId/:entityId/:residueStart/:residueEnd
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

entityId	String	
PDB Entity ID

residueStart	String	
Start PDB Residue Number

residueEnd	String	
End PDB Residue Number

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": [
        {
            "entity_id": 1,
            "chains": [
                {
                    "auth_asym_id": "A",
                    "struct_asym_id": "A",
                    "residues": [
                        {
                            "residue_number": 10,
                            "author_residue_number": 10,
                            "author_insertion_code": "",
                            "observed": "Y",
                            "features": {
                                "UniProt": {
                                    "P29373": {
                                        "identifier": "RABP2_HUMAN",
                                        "name": "RABP2_HUMAN",
                                        "unp_residue_number": 11,
                                        "unp_one_letter_code": "I",
                                        "pdb_one_letter_code": "I"
                                    }
                                },
                                "Pfam": {
                                    "PF00061": {
                                        "identifier": "Lipocalin",
                                        "name": "Lipocalin",
                                        "description": "Lipocalin / cytosolic fatty-acid binding protein family"
                                    }
                                },
                                "InterPro": {
                                    "IPR000463": {
                                        "identifier": "Cytosolic fatty-acid binding",
                                        "name": "Cytosolic fatty-acid binding"
                                    }
                                },
                                "CATH": {
                                    "2.40.128.20": {
                                        "homology": "Lipocalin",
                                        "topology": "Lipocalin",
                                        "architecture": "Beta Barrel",
                                        "identifier": "Lipocalin",
                                        "class": "Mainly Beta",
                                        "name": "Cellular retinoic acid binding protein type ii. Chain:a. Engineered:yes"
                                    }
                                },
                                "SCOP": {
                                    "50847": {
                                        "superfamily": {
                                            "sunid": "50814",
                                            "description": "Lipocalins"
                                        },
                                        "sccs": "b.60.1.2",
                                        "fold": {
                                            "sunid": "50813",
                                            "description": "Lipocalins"
                                        },
                                        "identifier": "Fatty acid binding protein-like",
                                        "class": {
                                            "sunid": "48724",
                                            "description": "All beta proteins"
                                        },
                                        "description": "Fatty acid binding protein-like",
                                        "mappings": [
                                            {
                                                "scop_id": "d1cbsa_",
                                                "chain_id": "A",
                                                "struct_asym_id": "A"
                                            }
                                        ]
                                    }
                                },
                                "binding_sites": {},
                                "FunPDBe": [
                                    {
                                        "origin": "3Dcomplex",
                                        "label": "Surface_residue",
                                        "url": "http://shmoo.weizmann.ac.il/elevy/3dcomplexV6/Home.cgi",
                                        "raw_score": null,
                                        "confidence_score": null,
                                        "confidence_classification": "curated",
                                        "evidence_codes": [
                                            "ECO_0000053",
                                            "ECO_0007194"
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    ]
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
residueStart
	String
residueEnd
	String
Residue - Get annotations for a PDB Residue

Get mappings (as assigned by the SIFTS process) for a PDB Residue to UniProt, Pfam, InterPro, CATH, SCOP, IntEnz, GO, Ensembl and HMMER accessions (and vice versa).

https://www.ebi.ac.uk/pdbe/graph-api/residue_mapping/:pdbId/:entityId/:residueNumber
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

entityId	String	
PDB Entity ID

residueNumber	String	
PDB Residue Number

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": [
        {
            "entity_id": 1,
            "chains": [
                {
                    "auth_asym_id": "A",
                    "struct_asym_id": "A",
                    "residues": [
                        {
                            "residue_number": 10,
                            "author_residue_number": 10,
                            "author_insertion_code": "",
                            "observed": "Y",
                            "features": {
                                "UniProt": {
                                    "P29373": {
                                        "identifier": "RABP2_HUMAN",
                                        "name": "RABP2_HUMAN",
                                        "unp_residue_number": 11,
                                        "unp_one_letter_code": "I",
                                        "pdb_one_letter_code": "I"
                                    }
                                },
                                "Pfam": {
                                    "PF00061": {
                                        "identifier": "Lipocalin",
                                        "name": "Lipocalin",
                                        "description": "Lipocalin / cytosolic fatty-acid binding protein family"
                                    }
                                },
                                "InterPro": {
                                    "IPR031281": {
                                        "identifier": "Cellular retinoic acid-binding protein 2",
                                        "name": "Cellular retinoic acid-binding protein 2"
                                    }
                                },
                                "CATH": {
                                    "2.40.128.20": {
                                        "homology": "Lipocalin",
                                        "topology": "Lipocalin",
                                        "architecture": "Beta Barrel",
                                        "identifier": "Lipocalin",
                                        "class": "Mainly Beta",
                                        "name": "Cellular retinoic acid binding protein type ii. Chain:a. Engineered:yes"
                                    }
                                },
                                "SCOP": {
                                    "50847": {
                                        "superfamily": {
                                            "sunid": "50814",
                                            "description": "Lipocalins"
                                        },
                                        "sccs": "b.60.1.2",
                                        "fold": {
                                            "sunid": "50813",
                                            "description": "Lipocalins"
                                        },
                                        "identifier": "Fatty acid binding protein-like",
                                        "class": {
                                            "sunid": "48724",
                                            "description": "All beta proteins"
                                        },
                                        "description": "Fatty acid binding protein-like",
                                        "mappings": [
                                            {
                                                "scop_id": "d1cbsa_",
                                                "chain_id": "A",
                                                "struct_asym_id": "A"
                                            }
                                        ]
                                    }
                                },
                                "binding_sites": {},
                                "FunPDBe": [
                                    {
                                        "origin": "3Dcomplex",
                                        "label": "Surface_residue",
                                        "url": "http://shmoo.weizmann.ac.il/elevy/3dcomplexV6/Home.cgi",
                                        "raw_score": null,
                                        "confidence_score": null,
                                        "confidence_classification": "curated",
                                        "evidence_codes": [
                                            "ECO_0000053",
                                            "ECO_0007194"
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    ]
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
residueNumber
	String
Residue - Get sequence conservations for a PDB Residue

Get sequence conservations for a PDB Residue

https://www.ebi.ac.uk/pdbe/graph-api/residue_mapping/sequence_conservation/:pdbId/:entityId/:residueNumber
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

entityId	String	
PDB Entity ID

residueNumber	String	
PDB Residue Number

Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
residueNumber
	String
SIFTS

SIFTS - Get Best Structures for a UniProt accession

Get the list of PDB structures mapping to a UniProt accession sorted by coverage of the protein and, if the same, resolution.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/best_structures/:accession
Parameter

Field	Type	Description
accession	String	
UniProt accession

Success 200

Field	Type	Description
end	Integer	
mmcif-style end residue.

chain_id	String	
PDB chain id.

pdb_id	String	
The PDB id.

start	Integer	
mmcif-style start residue.

unp_end	Integer	
Index of last residue in UniProt sequence mapped to this PDB entity.

unp_start	Integer	
Index of first residue in UniProt sequence mapped to this PDB entity.

coverage	Float	
The ratio of coverage of the UniProt protein [0-1].

resolution	Float	
The higher limit of resolution of crystallographic data as reported by depositors. Null if not available.

experimental_method	String	
The experimental method.

tax_id	Integer	
The taxonomy id.

Example success response JSON:
{
    "P07550": [
        {
            "end": 365,
            "entity_id": 1,
            "chain_id": "A",
            "pdb_id": "2r4r",
            "start": 1,
            "unp_end": 365,
            "coverage": 0.884,
            "unp_start": 1,
            "resolution": 3.4,
            "experimental_method": "X-ray diffraction",
            "tax_id": 9606,
            "preferred_assembly_id": 1
        },
        {
            "end": 366,
            "entity_id": 1,
            "chain_id": "A",
            "pdb_id": "3kj6",
            "start": 3,
            "unp_end": 365,
            "coverage": 0.881,
            "unp_start": 2,
            "resolution": 3.4,
            "experimental_method": "X-ray diffraction",
            "tax_id": 9606,
            "preferred_assembly_id": 1
        }
    ]
}
Send a Sample Request


	url
Parameters

accession
	String
SIFTS - Get CATH mappings for a PDB Entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to CATH.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/cath/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

homology	String	
CATH homology.

domain	String	
CATH domain.

segment_id	Integer	
The segment id (discontinus domains have same domain and different segment_id)

name	String	
The name for the CATH domain.

architecture	String	
The CATH architecture.

identifier	String	
An identifier for the accession.

class	String	
CATH class.

topology	String	
CATH topology.

Example success response JSON:
{
    "1cbs": {
        "CATH": {
            "2.40.128.20": {
                "homology": "Lipocalin",
                "name": "Cellular retinoic acid binding protein type ii. Chain:a. Engineered:yes",
                "class": "Mainly Beta",
                "architecture": "Beta Barrel",
                "identifier": "Lipocalin",
                "topology": "Lipocalin",
                "mappings": [
                    {
                        "domain": "1cbsA00",
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "segment_id": 1,
                        "entity_id": 1,
                        "chain_id": "A",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "struct_asym_id": "A"
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get EC mappings for a PDB Entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to EC.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/ec/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "3d12": {
        "EC": {
            "3.2.1.18": {
                "reaction": "Hydrolysis of alpha-(2->3)-,alpha-(2->6)-,alpha-(2->8)- glycosidic linkages of terminal sialic acid residues in oligosaccharides,glycoproteins,glycolipids,colominic acid and synthetic substrates.",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A"
                    },
                    {
                        "entity_id": 1,
                        "chain_id": "D",
                        "struct_asym_id": "C"
                    }
                ],
                "systematic_name": "Acetylneuraminyl hydrolase",
                "synonyms": [
                    "Acetylneuraminidase",
                    "Alpha-neuraminidase",
                    "N-acylneuraminate glycohydrolase",
                    "Neuraminidase",
                    "Sialidase"
                ],
                "identifier": "Exo-alpha-sialidase",
                "accepted_name": "Exo-alpha-sialidase"
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get GO mappings for a PDB Entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to GO.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/go/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
category	String	
The GO category.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "GO": {
            "GO:0042573": {
                "category": "Biological_process",
                "definition": "The chemical reactions and pathways involving retinoic acid,one of the three components that makes up vitamin A.",
                "identifier": "retinoic acid metabolic process",
                "name": "retinoic acid metabolic process",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A"
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get Interpro mappings for a PDB Entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to InterPro.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/interpro/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "InterPro": {
            "IPR031281": {
                "identifier": "Cellular retinoic acid-binding protein 2",
                "name": "Cellular retinoic acid-binding protein 2",
                "mappings": [
                    {
                        "entity_id": 1,
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "chain_id": "A",
                        "struct_asym_id": "A"
                    }
                ]
            },
            "IPR031259": {
                "identifier": "Intracellular lipid binding protein",
                "name": "Intracellular lipid binding protein",
                "mappings": [
                    {
                        "entity_id": 1,
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "chain_id": "A",
                        "struct_asym_id": "A"
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get Pfam mappings for a PDB Entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to Pfam.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/pfam/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "Pfam": {
            "PF00061": {
                "identifier": "Lipocalin / cytosolic fatty-acid binding protein family",
                "description": "Lipocalin / cytosolic fatty-acid binding protein family",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "start": {
                            "author_residue_number": 4,
                            "author_insertion_code": "",
                            "residue_number": 4
                        },
                        "coverage": 1
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get Pfam mappings for a UniProt accession

Get mappings (as assigned by the SIFTS process) from a UniProt accession to a Pfam accession with details of the Pfam protein family

https://www.ebi.ac.uk/pdbe/graph-api/mappings/uniprot_to_pfam/:accession
Parameter

Field	Type	Description
accession	String	
UniProt accession

Success 200

Field	Type	Description
unp_start	Integer	
Index of first residue in Uniprot sequence mapped to this PDB entity.

unp_end	Integer	
Index of last residue in Uniprot sequence mapped to this PDB entity.

Example success response JSON:
{
    "P07550": {
        "Pfam": {
            "PF00001": {
                "description": "7 transmembrane receptor (rhodopsin family)",
                "identifier": "7 transmembrane receptor (rhodopsin family)",
                "name": "7tm_1",
                "mappings": [
                    {
                        "unp_start": 50,
                        "unp_end": 326
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

accession
	String
SIFTS - Get SCOP mappings for a PDB Entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to SCOP.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/scop/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

superfamily	String	
SCOP superfamily.

segment_id	Integer	
The segment id (discontinus domains have same domain and different segment_id)

sunid	Integer	
SCOP sunid.

scop_id	String	
SCOP id.

fold	String	
SCOP fold.

class	String	
SCOP class.

Example success response JSON:
{
    "1cbs": {
        "SCOP": {
            "50847": {
                "superfamily": {
                    "sunid": 50814,
                    "description": "Lipocalins"
                },
                "sccs": "b.60.1.2",
                "fold": {
                    "sunid": 50813,
                    "description": "Lipocalins"
                },
                "identifier": "Fatty acid binding protein-like",
                "class": {
                    "sunid": 48724,
                    "description": "All beta proteins"
                },
                "description": "Fatty acid binding protein-like",
                "mappings": [
                    {
                        "entity_id": 1,
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "segment_id": 1,
                        "chain_id": "A",
                        "scop_id": "d1cbsa_",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "struct_asym_id": "A"
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get Uniprot mappings for a PDB Entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to UniProt.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/uniprot/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "UniProt": {
            "P29373": {
                "name": "RABP2_HUMAN",
                "identifier": "RABP2_HUMAN",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "unp_start": 2,
                        "unp_end": 138,
                        "pdb_start": 1,
                        "pdb_end": 137
                    }
                ],
                "description": "Cellular retinoic acid-binding protein 2"
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get Uniprot segment mappings for a PDB Entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to UniProt. The segments are calculated using the same rules as with the standard call but with the UniProt sequence as reference. The outcome is a set of segments that reflects discontinuities in the UniProt sequence.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/uniprot_segments/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "UniProt": {
            "P29373": {
                "name": "RABP2_HUMAN",
                "identifier": "RABP2_HUMAN",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "unp_start": 2,
                        "unp_end": 138
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get all isoforms for a PDB entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to UniProt. It returns the all isoforms found in UniProt.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/all_isoforms/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
unp_end	Integer	
Index of last residue in Uniprot sequence mapped to this PDB entity.

unp_start	Integer	
Index of first residue in Uniprot sequence mapped to this PDB entity.

identity	Float	
Identity of the alignment (from 0 to 1).

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "UniProt": {
            "P29373": {
                "name": "RABP2_HUMAN",
                "identifier": "RABP2_HUMAN",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "unp_start": 2,
                        "unp_end": 138,
                        "pdb_start": 1,
                        "pdb_end": 137,
                        "identity": 1
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get annotations for a PDB Entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to UniProt, Pfam, InterPro, CATH, SCOP, IntEnz, GO, Ensembl and HMMER accessions (and vice versa).

https://www.ebi.ac.uk/pdbe/graph-api/mappings/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
category	String	
The GO category.

unp_start	Integer	
Index of first residue in Uniprot sequence mapped to this PDB entity.

unp_end	Integer	
Index of last residue in Uniprot sequence mapped to this PDB entity.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

homology	String	
CATH homology.

domain	String	
CATH domain.

segment_id	Integer	
The segment id (discontinus domains have same domain and different segment_id)

name	String	
The name for the CATH domain.

architecture	String	
The CATH architecture.

identifier	String	
An identifier for the accession.

class	String	
CATH class.

topology	String	
CATH topology.

superfamily	String	
SCOP superfamily.

sunid	Integer	
SCOP sunid.

scop_id	String	
SCOP id.

fold	String	
SCOP fold.

translation_id	String	
Translation id from Ensembl.

ordinal	Integer	
When a mapping is discontinuous (i.e. the mapping to UniProt has a gap) the different produced segments have consecutive ordinal numbers.When a mapping is discontinuous (i.e. the mapping to UniProt has a gap) the different produced segments have consecutive ordinal numbers.

genome_end	Long	
Index of the last base mapped to this PDB entity.

genome_start	Long	
Index of the first base mapped to this PDB entity.

transcript_id	String	
Transcript id from Ensembl.

coverage	Float	
The coverage of the Ensembl id.

exon_id	String	
Exon id from Ensembl.

Example success response JSON:
{
    "1cbs": {
        "UniProt": {
            "P29373": {
                "name": "RABP2_HUMAN",
                "identifier": "RABP2_HUMAN",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "unp_start": 2,
                        "unp_end": 138,
                        "pdb_start": 1,
                        "pdb_end": 137
                    }
                ],
                "description": "Cellular retinoic acid-binding protein 2"
            }
        },
        "Pfam": {
            "PF00061": {
                "identifier": "Lipocalin / cytosolic fatty-acid binding protein family",
                "description": "Lipocalin / cytosolic fatty-acid binding protein family",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "start": {
                            "author_residue_number": 4,
                            "author_insertion_code": "",
                            "residue_number": 4
                        },
                        "coverage": 1
                    }
                ]
            }
        },
        "CATH": {
            "2.40.128.20": {
                "homology": "Lipocalin",
                "name": "Cellular retinoic acid binding protein type ii. Chain:a. Engineered:yes",
                "class": "Mainly Beta",
                "architecture": "Beta Barrel",
                "identifier": "Lipocalin",
                "topology": "Lipocalin",
                "mappings": [
                    {
                        "domain": "1cbsA00",
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "segment_id": 1,
                        "entity_id": 1,
                        "chain_id": "A",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "struct_asym_id": "A"
                    }
                ]
            }
        },
        "SCOP": {
            "50847": {
                "superfamily": {
                    "sunid": 50814,
                    "description": "Lipocalins"
                },
                "sccs": "b.60.1.2",
                "fold": {
                    "sunid": 50813,
                    "description": "Lipocalins"
                },
                "identifier": "Fatty acid binding protein-like",
                "class": {
                    "sunid": 48724,
                    "description": "All beta proteins"
                },
                "description": "Fatty acid binding protein-like",
                "mappings": [
                    {
                        "entity_id": 1,
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "segment_id": 1,
                        "chain_id": "A",
                        "scop_id": "d1cbsa_",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "struct_asym_id": "A"
                    }
                ]
            }
        },
        "InterPro": {
            "IPR031281": {
                "identifier": "Cellular retinoic acid-binding protein 2",
                "name": "Cellular retinoic acid-binding protein 2",
                "mappings": [
                    {
                        "entity_id": 1,
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "chain_id": "A",
                        "struct_asym_id": "A"
                    }
                ]
            }
        },
        "GO": {
            "GO:0008544": {
                "category": "Biological_process",
                "definition": "The process whose specific outcome is the progression of the epidermis over time,from its formation to the mature structure. The epidermis is the outer epithelial layer of an animal,it may be a single layer that produces an extracellular material (e.g. the cuticle of arthropods) or a complex stratified squamous epithelium,as in the case of many vertebrate species.",
                "identifier": "epidermis development",
                "name": "epidermis development",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A"
                    }
                ]
            }
        },
        "EC": {},
        "Ensembl": {
            "ENSG00000143320": {
                "identifier": "ENSG00000143320",
                "mappings": [
                    {
                        "entity_id": 1,
                        "accession": "P29373",
                        "translation_id": "ENSP00000357205",
                        "end": {
                            "author_residue_number": 23,
                            "author_insertion_code": "",
                            "residue_number": 23
                        },
                        "chain_id": "A",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "ordinal": 1,
                        "genome_end": 156705515,
                        "unp_end": 24,
                        "transcript_id": "ENST00000368222",
                        "coverage": 0.958,
                        "exon_id": "ENSE00001446616",
                        "genome_start": 156705449,
                        "unp_start": 2,
                        "struct_asym_id": "A"
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get best isoform for a PDB entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to UniProt. It returns the best isoform found in UniProt.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/isoforms/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
unp_end	Integer	
Index of last residue in Uniprot sequence mapped to this PDB entity.

unp_start	Integer	
Index of first residue in Uniprot sequence mapped to this PDB entity.

identity	Float	
Identity of the alignment (from 0 to 1).

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "UniProt": {
            "P29373": {
                "name": "RABP2_HUMAN",
                "identifier": "RABP2_HUMAN",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "unp_start": 2,
                        "unp_end": 138,
                        "pdb_start": 1,
                        "pdb_end": 137,
                        "identity": 1
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get ensembl mappings for a PDB entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to Ensembl

https://www.ebi.ac.uk/pdbe/graph-api/mappings/ensembl/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
unp_start	Integer	
Index of first residue in Uniprot sequence mapped to this PDB entity.

unp_end	Integer	
Index of last residue in Uniprot sequence mapped to this PDB entity.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

translation_id	String	
Translation id from Ensembl.

ordinal	Integer	
When a mapping is discontinuous (i.e. the mapping to UniProt has a gap) the different produced segments have consecutive ordinal numbers.When a mapping is discontinuous (i.e. the mapping to UniProt has a gap) the different produced segments have consecutive ordinal numbers.

genome_end	Long	
Index of the last base mapped to this PDB entity.

genome_start	Long	
Index of the first base mapped to this PDB entity.

transcript_id	String	
Transcript id from Ensembl.

coverage	Float	
The coverage of the Ensembl id.

exon_id	String	
Exon id from Ensembl.

Example success response JSON:
{
    "1cbs": {
        "Ensembl": {
            "ENSG00000143320": {
                "identifier": "ENSG00000143320",
                "mappings": [
                    {
                        "entity_id": 1,
                        "accession": "P29373",
                        "translation_id": "ENSP00000357205",
                        "end": {
                            "author_residue_number": 23,
                            "author_insertion_code": "",
                            "residue_number": 23
                        },
                        "chain_id": "A",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "ordinal": 1,
                        "genome_end": 156705515,
                        "unp_end": 24,
                        "transcript_id": "ENST00000368222",
                        "coverage": 0.958,
                        "exon_id": "ENSE00001446616",
                        "genome_start": 156705449,
                        "unp_start": 2,
                        "struct_asym_id": "A"
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get homologene for a PDB entity

Get homologene polypeptides for a given PDB entity

https://www.ebi.ac.uk/pdbe/graph-api/mappings/homologene/:pdbId/:entityId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

entityId	String	
PDB Entity ID

Success 200

Field	Type	Description
name	String	
Name of the polypeptide.

organism_scientific_name	String	
Scientific name of the organism.

homologus_pdb_id	String	
Homologus PDB id code.

homologus_pdb_entity_id	String	
Homologus PDB entity id for the PDB id.

Example success response JSON:
{
    "6uz7_44": {
        "Homologene": {
            "47964": {
                "identifier": 47964,
                "mappings": [
                    {
                        "homologus_pdb_id": "3j6x",
                        "homologus_pdb_entity_id": 45,
                        "name": "60S ribosomal protein L43-A",
                        "organism_scientific_name": "Saccharomyces cerevisiae W303",
                        "accession": "P0CX25"
                    },
                    {
                        "homologus_pdb_id": "5dge",
                        "homologus_pdb_entity_id": 79,
                        "name": "60S ribosomal protein L43-A",
                        "organism_scientific_name": "Saccharomyces cerevisiae S288C",
                        "accession": "P0CX25"
                    },
                    {
                        "homologus_pdb_id": "5dgf",
                        "homologus_pdb_entity_id": 79,
                        "name": "60S ribosomal protein L43-A",
                        "organism_scientific_name": "Saccharomyces cerevisiae S288C",
                        "accession": "P0CX25"
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
entityId
	String
SIFTS - Get sequence domains for a PDB entry ID

Get mappings from protein chains to both Pfam and InterPro as assigned by the SIFTS process.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/sequence_domains/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "InterPro": {
            "IPR031281": {
                "identifier": "Cellular retinoic acid-binding protein 2",
                "name": "Cellular retinoic acid-binding protein 2",
                "mappings": [
                    {
                        "entity_id": 1,
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "chain_id": "A",
                        "struct_asym_id": "A"
                    }
                ]
            }
        },
        "Pfam": {
            "PF00061": {
                "identifier": "Lipocalin / cytosolic fatty-acid binding protein family",
                "description": "Lipocalin / cytosolic fatty-acid binding protein family",
                "mappings": [
                    {
                        "entity_id": 1,
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "start": {
                            "author_residue_number": 4,
                            "author_insertion_code": "",
                            "residue_number": 4
                        },
                        "coverage": 1
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get structural domains for a PDB entry ID

Get mappings from protein chains to both SCOP and CATH as assigned by the SIFTS process.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/structural_domains/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "CATH": {
            "2.40.128.20": {
                "homology": "Lipocalin",
                "name": "Cellular retinoic acid binding protein type ii. Chain:a. Engineered:yes",
                "class": "Mainly Beta",
                "architecture": "Beta Barrel",
                "identifier": "Lipocalin",
                "topology": "Lipocalin",
                "mappings": [
                    {
                        "domain": "1cbsA00",
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "segment_id": 1,
                        "entity_id": 1,
                        "chain_id": "A",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "struct_asym_id": "A"
                    }
                ]
            }
        },
        "SCOP": {
            "50847": {
                "superfamily": {
                    "sunid": 50814,
                    "description": "Lipocalins"
                },
                "sccs": "b.60.1.2",
                "fold": {
                    "sunid": 50813,
                    "description": "Lipocalins"
                },
                "identifier": "Fatty acid binding protein-like",
                "class": {
                    "sunid": 48724,
                    "description": "All beta proteins"
                },
                "description": "Fatty acid binding protein-like",
                "mappings": [
                    {
                        "entity_id": 1,
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "segment_id": 1,
                        "chain_id": "A",
                        "scop_id": "d1cbsa_",
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "struct_asym_id": "A"
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get uniref90 mappings (Homologene) for a PDB entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to UniProt. It returns mappings to all the UniRef90 members of the UniProt accession which also belong to the same Homologene clusters.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/homologene_uniref90/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
unp_end	Integer	
Index of last residue in Uniprot sequence mapped to this PDB entity.

unp_start	Integer	
Index of first residue in Uniprot sequence mapped to this PDB entity.

identity	Float	
Identity of the alignment (from 0 to 1).

tax_id	Integer	
The taxonomy id.

organism_scientific_name	String	
The scientific name of the organism.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "UniProt": {
            "P29373": {
                "identifier": "RABP2_HUMAN",
                "name": "RABP2_HUMAN",
                "organism_scientific_name": "Homo sapiens (Human)",
                "tax_id": 9606,
                "mappings": [
                    {
                        "entity_id": 1,
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "chain_id": "A",
                        "pdb_start": 1,
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "unp_end": 138,
                        "pdb_end": 137,
                        "struct_asym_id": "A",
                        "unp_start": 2,
                        "identity": 1
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
SIFTS - Get uniref90 mappings for a PDB entry ID

Get mappings (as assigned by the SIFTS process) from PDB structures to UniProt. It returns mappings to all the UniRef90 members of the UniProt accession.

https://www.ebi.ac.uk/pdbe/graph-api/mappings/uniref90/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
unp_end	Integer	
Index of last residue in Uniprot sequence mapped to this PDB entity.

unp_start	Integer	
Index of first residue in Uniprot sequence mapped to this PDB entity.

identity	Float	
Identity of the alignment (from 0 to 1).

tax_id	Integer	
The taxonomy id.

organism_scientific_name	String	
The scientific name of the organism.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "UniProt": {
            "P29373": {
                "identifier": "RABP2_HUMAN",
                "name": "RABP2_HUMAN",
                "organism_scientific_name": "Homo sapiens (Human)",
                "tax_id": 9606,
                "mappings": [
                    {
                        "entity_id": 1,
                        "end": {
                            "author_residue_number": 137,
                            "author_insertion_code": "",
                            "residue_number": 137
                        },
                        "chain_id": "A",
                        "pdb_start": 1,
                        "start": {
                            "author_residue_number": 1,
                            "author_insertion_code": "",
                            "residue_number": 1
                        },
                        "unp_end": 138,
                        "pdb_end": 137,
                        "struct_asym_id": "A",
                        "unp_start": 2,
                        "identity": 1
                    }
                ]
            }
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
UniProt

UniProt - Get Best Structures for a UniProt residue range

Get the list of PDB structures mapping to a UniProt residue range sorted by coverage of the protein and, if the same, resolution.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/best_structures/:accession/:unpStart/:unpEnd
Parameter

Field	Type	Description
accession	String	
UniProt accession

unpStart	String	
UniProt residue start

unpEnd	String	
UniProt residue end

Success 200

Field	Type	Description
end	Integer	
mmcif-style end residue.

chain_id	String	
PDB chain id.

pdb_id	String	
The PDB id.

start	Integer	
mmcif-style start residue.

unp_end	Integer	
Index of last residue in UniProt sequence mapped to this PDB entity.

unp_start	Integer	
Index of first residue in UniProt sequence mapped to this PDB entity.

coverage	Float	
The ratio of coverage of the UniProt protein [0-1].

resolution	Float	
The higher limit of resolution of crystallographic data as reported by depositors. Null if not available.

experimental_method	String	
The experimental method.

tax_id	Integer	
The taxonomy id.

Example success response JSON:
{
    "P07550": [
        {
            "end": 17,
            "entity_id": 1,
            "chain_id": "A",
            "pdb_id": "2rh1",
            "start": 8,
            "unp_end": 10,
            "coverage": 1,
            "unp_start": 1,
            "resolution": 2.4,
            "experimental_method": "X-ray diffraction",
            "tax_id": 9606
        },
        {
            "end": 17,
            "entity_id": 1,
            "chain_id": "A",
            "pdb_id": "2rh1",
            "start": 8,
            "unp_end": 10,
            "coverage": 1,
            "unp_start": 1,
            "resolution": 2.4,
            "experimental_method": "X-ray diffraction",
            "tax_id": 10665
        }
    ]
}
Send a Sample Request


	url
Parameters

accession
	String
unpStart
	String
unpEnd
	String
UniProt - Get PDB structure mappings for a UniProt accession

This call provides details on mapped PDB structures for a UniProt accession.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/unipdb/:accession
Parameter

Field	Type	Description
accession	String	
UniProt Accession

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "P07550": {
        "sequence": "MGQPGNGSAFLLAPNGSHAPDHDVTQERDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIETLCVIAVDRYFAITSPFKYQSLLTKNKARVIILMVWIVSGLTSFLPIQMHWYRATHQEAINCYANETCCDFFTNQAYAIASSIVSFYVPLVIMVFVYSRVFQEAKRQLQKIDKSEGRFHVQNLSQVEQDGRTGHGLRRSSKFCLKEHKALKTLGIIMGTFTLCWLPFFIVNIVHVIQDNLIRKEVYILLNWIGYVNSGFNPLIYCRSPDFRIAFQELLCLRRSSLKAYGNGYSSNGNTGEQSGYHVEQEKENKLLCEDLPGTEDFVGHQGTVPSDNIDSQGRNCSTNDSLL",
        "length": 413,
        "dataType": "UNIPDB",
        "data": [
            {
                "name": "2rh1",
                "accession": "2rh1",
                "dataType": "bestChain",
                "entityId": 1,
                "bestChainId": "A",
                "residues": [
                    {
                        "startIndex": 1,
                        "endIndex": 28,
                        "startCode": "MET",
                        "endCode": "ARG",
                        "indexType": "UNIPROT",
                        "observed": "N"
                    }
                ],
                "additionalData": {
                    "resolution": 2.4,
                    "ligandCount": 8,
                    "entityCount": 1,
                    "experiment": "X-ray diffraction",
                    "title": "High resolution crystal structure of human B2-adrenergic G protein-coupled receptor.",
                    "residueCount": 281,
                    "nonPolyTypes": [],
                    "unobservedRegionsPresent": true,
                    "rankingScore": 17
                }
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get SIFTS mappings for a UniProt residue

Get mappings (as assigned by the SIFTS process) for a UniProt Residue to sequence and structural domains.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/:accession/:unpResidue
Parameter

Field	Type	Description
accession	String	
UniProt accession

unpResidue	String	
UniProt residue

Example success response JSON:
{
    "P07550": {
        "Pfam": {},
        "InterPro": {
            "IPR000332": {
                "identifier": "Beta 2 adrenoceptor",
                "name": "Beta 2 adrenoceptor"
            },
            "IPR000276": {
                "identifier": "G protein-coupled receptor,rhodopsin-like",
                "name": "G protein-coupled receptor,rhodopsin-like"
            }
        },
        "CATH": {
            "1.20.1070.10": {
                "homology": "Rhopdopsin 7-helix transmembrane proteins",
                "topology": "Rhopdopsin 7-helix transmembrane proteins",
                "architecture": "Up-down Bundle",
                "identifier": "Rhopdopsin 7-helix transmembrane proteins",
                "class": "Mainly Alpha",
                "name": "Guanine nucleotide-binding protein g(s) subunit alpha isoforms short."
            }
        },
        "SCOP": {}
    }
}
Send a Sample Request


	url
Parameters

accession
	String
unpResidue
	String
UniProt - Get all PDB structures for a UniProt accession

Get all PDB structures for a UniProt accession.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/:accession
Parameter

Field	Type	Description
accession	String	
UniProt accession

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "P07550": {
        "Pfam": {
            "identifier": "7tm_1",
            "name": "7tm_1",
            "description": "7 transmembrane receptor (rhodopsin family)",
            "unp_start": 50,
            "unp_end": 326
        },
        "mappings": [
            {
                "entry_id": "2r4r",
                "entity_id": 1,
                "segments": [
                    {
                        "chains": [
                            "A"
                        ],
                        "pdb_sequence": "MGQPGNGSAFLLAPNRSHAPDHDVTQQRDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIETLCVIAVDRYFAITSPFKYQSLLTKNKARVIILMVWIVSGLTSFLPIQMHWYRATHQEAINCYANETCCDFFTNQAYAIASSIVSFYVPLVIMVFVYSRVFQEAKRQLQKIDKSEGRFHVQNLSQVEQDGRTGHGLRRSSKFCLKEHKALKTLGIIMGTFTLCWLPFFIVNIVHVIQDNLIRKEVYILLNWIGYVNSGFNPLIYCRSPDFRIAFQELLCLRRSSLKAYGNGYSSNGNTGEQSG",
                        "unp_sequence": "MGQPGNGSAFLLAPNGSHAPDHDVTQERDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIETLCVIAVDRYFAITSPFKYQSLLTKNKARVIILMVWIVSGLTSFLPIQMHWYRATHQEAINCYANETCCDFFTNQAYAIASSIVSFYVPLVIMVFVYSRVFQEAKRQLQKIDKSEGRFHVQNLSQVEQDGRTGHGLRRSSKFCLKEHKALKTLGIIMGTFTLCWLPFFIVNIVHVIQDNLIRKEVYILLNWIGYVNSGFNPLIYCRSPDFRIAFQELLCLRRSSLKAYGNGYSSNGNTGEQSG",
                        "pdb_start": 1,
                        "pdb_end": 365,
                        "unp_start": 1,
                        "unp_end": 365
                    }
                ]
            },
            {
                "entry_id": "6ps6",
                "entity_id": 1,
                "segments": [
                    {
                        "chains": [
                            "A"
                        ],
                        "pdb_sequence": "MGQPGNGSAFLLAPNRSHAPDHDVTQQRDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIWTLCVIAVDRYFAITSPFKYQSLLTKNKARVIILMVWIVSGLTSFLPIQMHWYRATHQEAINCYAEETCCDFFTNQAYAIASSIVSFYVPLVIMVFVYSRVFQEAKRQL",
                        "unp_sequence": "MGQPGNGSAFLLAPNGSHAPDHDVTQERDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIETLCVIAVDRYFAITSPFKYQSLLTKNKARVIILMVWIVSGLTSFLPIQMHWYRATHQEAINCYANETCCDFFTNQAYAIASSIVSFYVPLVIMVFVYSRVFQEAKRQL",
                        "pdb_start": 25,
                        "pdb_end": 254,
                        "unp_start": 1,
                        "unp_end": 230
                    },
                    {
                        "chains": [
                            "A"
                        ],
                        "pdb_sequence": "FCLKEHKALKTLGIIMGTFTLCWLPFFIVNIVHVIQDNLIRKEVYILLNWIGYVNSGFNPLIYCRSPDFRIAFQELLCLRRSSLK",
                        "unp_sequence": "FCLKEHKALKTLGIIMGTFTLCWLPFFIVNIVHVIQDNLIRKEVYILLNWIGYVNSGFNPLIYCRSPDFRIAFQELLCLRRSSLK",
                        "pdb_start": 416,
                        "pdb_end": 500,
                        "unp_start": 264,
                        "unp_end": 348
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get annotations for a UniProt accession

This call provides details on annotations for a UniProt accession.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/annotations/:accession
Parameter

Field	Type	Description
accession	String	
UniProt Accession

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "P07550": {
        "sequence": "MGQPGNGSAFLLAPNGSHAPDHDVTQERDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIETLCVIAVDRYFAITSPFKYQSLLTKNKARVIILMVWIVSGLTSFLPIQMHWYRATHQEAINCYANETCCDFFTNQAYAIASSIVSFYVPLVIMVFVYSRVFQEAKRQLQKIDKSEGRFHVQNLSQVEQDGRTGHGLRRSSKFCLKEHKALKTLGIIMGTFTLCWLPFFIVNIVHVIQDNLIRKEVYILLNWIGYVNSGFNPLIYCRSPDFRIAFQELLCLRRSSLKAYGNGYSSNGNTGEQSGYHVEQEKENKLLCEDLPGTEDFVGHQGTVPSDNIDSQGRNCSTNDSLL",
        "length": 413,
        "dataType": "ANNOTATIONS",
        "data": [
            {
                "name": "canSAR",
                "accession": "canSAR",
                "dataType": "canSAR",
                "residues": [
                    {
                        "startIndex": 40,
                        "endIndex": 40,
                        "startCode": "MET",
                        "endCode": "MET",
                        "indexType": "UNIPROT",
                        "pdbEntries": [
                            {
                                "pdbId": "6e67",
                                "entityId": 1,
                                "chainIds": [
                                    "A"
                                ],
                                "additionalData": {
                                    "resourceUrl": "https://cansar.icr.ac.uk/black/#/target/A0A097J809/structural-druggability/6E67_A"
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get interface residues for a UniProt accession

This call provides details on interface residues for a UniProt accession.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/interface_residues/:accession
Parameter

Field	Type	Description
accession	String	
UniProt Accession

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "P07550": {
        "sequence": "MGQPGNGSAFLLAPNGSHAPDHDVTQERDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIETLCVIAVDRYFAITSPFKYQSLLTKNKARVIILMVWIVSGLTSFLPIQMHWYRATHQEAINCYANETCCDFFTNQAYAIASSIVSFYVPLVIMVFVYSRVFQEAKRQLQKIDKSEGRFHVQNLSQVEQDGRTGHGLRRSSKFCLKEHKALKTLGIIMGTFTLCWLPFFIVNIVHVIQDNLIRKEVYILLNWIGYVNSGFNPLIYCRSPDFRIAFQELLCLRRSSLKAYGNGYSSNGNTGEQSGYHVEQEKENKLLCEDLPGTEDFVGHQGTVPSDNIDSQGRNCSTNDSLL",
        "length": 413,
        "dataType": "INTERACTION INTERFACES",
        "data": [
            {
                "name": "Other",
                "accession": "Other",
                "residues": [
                    {
                        "startIndex": 131,
                        "endIndex": 131,
                        "startCode": "ARG",
                        "endCode": "ARG",
                        "indexType": "UNIPROT",
                        "interactingPDBEntries": [
                            {
                                "pdbId": "4ldl",
                                "entityId": 2,
                                "chainIds": "B"
                            }
                        ],
                        "allPDBEntries": []
                    },
                    {
                        "startIndex": 134,
                        "endIndex": 134,
                        "startCode": "ALA",
                        "endCode": "ALA",
                        "indexType": "UNIPROT",
                        "interactingPDBEntries": [
                            {
                                "pdbId": "6mxt",
                                "entityId": 2,
                                "chainIds": "N"
                            }
                        ],
                        "allPDBEntries": []
                    }
                ],
                "allPDBEntries": [
                    "4qkx",
                    "4ldo",
                    "2r4r",
                    "4lde",
                    "6mxt",
                    "4ldl",
                    "3p0g",
                    "2r4s"
                ]
            },
            {
                "name": "Guanine nucleotide-binding protein G(s) subunit alpha isoforms short",
                "accession": "P04896",
                "residues": [
                    {
                        "startIndex": 134,
                        "endIndex": 134,
                        "startCode": "ALA",
                        "endCode": "ALA",
                        "indexType": "UNIPROT",
                        "interactingPDBEntries": [
                            {
                                "pdbId": "3sn6",
                                "entityId": 1,
                                "chainIds": "A"
                            }
                        ],
                        "allPDBEntries": [
                            "3sn6"
                        ]
                    }
                ],
                "allPDBEntries": [
                    "3sn6"
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get ligand binding residues for a UniProt accession

This call provides details on ligand binding residues for a UniProt accession.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/ligand_sites/:accession
Parameter

Field	Type	Description
accession	String	
UniProt Accession

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "P07550": {
        "sequence": "MGQPGNGSAFLLAPNGSHAPDHDVTQERDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIETLCVIAVDRYFAITSPFKYQSLLTKNKARVIILMVWIVSGLTSFLPIQMHWYRATHQEAINCYANETCCDFFTNQAYAIASSIVSFYVPLVIMVFVYSRVFQEAKRQLQKIDKSEGRFHVQNLSQVEQDGRTGHGLRRSSKFCLKEHKALKTLGIIMGTFTLCWLPFFIVNIVHVIQDNLIRKEVYILLNWIGYVNSGFNPLIYCRSPDFRIAFQELLCLRRSSLKAYGNGYSSNGNTGEQSGYHVEQEKENKLLCEDLPGTEDFVGHQGTVPSDNIDSQGRNCSTNDSLL",
        "length": 413,
        "dataType": "LIGAND BINDING SITES",
        "data": [
            {
                "name": "(2S)-1-(tert-butylamino)-3-[(4-morpholin-4-yl-1,2,5-thiadiazol-3-yl)oxy]propan-2-ol",
                "accession": "TIM",
                "residues": [
                    {
                        "startIndex": 109,
                        "endIndex": 109,
                        "startCode": "TRP",
                        "endCode": "TRP",
                        "indexType": "UNIPROT",
                        "interactingPDBEntries": [
                            {
                                "pdbId": "3d4s",
                                "entityId": 1,
                                "chainIds": "A"
                            },
                            {
                                "pdbId": "6ps1",
                                "entityId": 1,
                                "chainIds": "A"
                            },
                            {
                                "pdbId": "6ps6",
                                "entityId": 1,
                                "chainIds": "A"
                            }
                        ],
                        "allPDBEntries": [
                            "6ps6",
                            "6ps1",
                            "3d4s"
                        ]
                    }
                ],
                "additionalData": {
                    "scaffoldId": "c1nsnc1N1CCOCC1",
                    "coFactorId": "",
                    "numAtoms": 21,
                    "targetUniProts": [
                        "P07550",
                        "P08588"
                    ],
                    "pdbEntries": [
                        "3d4s",
                        "6ps6",
                        "6ps1"
                    ]
                }
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get list of complexes in which the protein interacts

Get list of complexes in which the protein interacts along with other participants and subcomplexes if any.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/complex/:accession
Parameter

Field	Type	Description
accession	String	
UniProt accession

Success 200

Field	Type	Description
participants	Object[]	
A list of participants that take part in a complex.

accession	String	
A unique identifier for the component.

stoichiometry	Integer	
Relative quantity of the component that takes part in the complex.

taxonomy_id	Integer	
Unique identifier assigned by the NCBI to the source organism.

subcomplexes	String[]	
A list of complex IDs which are the subcomplex of the complex in query.

Example success response JSON:
{
    "P07550": [
        {
            "PDB-CPX-15022": {
                "participants": [
                    {
                        "accession": "P07550",
                        "stoichiometry": 1,
                        "taxonomy_id": 9606
                    }
                ],
                "subcomplexes": []
            }
        },
        {
            "PDB-CPX-15023": {
                "participants": [
                    {
                        "accession": "P07550",
                        "stoichiometry": 1,
                        "taxonomy_id": 9606
                    }
                ],
                "subcomplexes": []
            }
        },
        {
            "PDB-CPX-8342": {
                "participants": [
                    {
                        "accession": "D9IEF7",
                        "stoichiometry": 1,
                        "taxonomy_id": 10665
                    },
                    {
                        "accession": "P07550",
                        "stoichiometry": 1,
                        "taxonomy_id": 9606
                    }
                ],
                "subcomplexes": []
            }
        }
    ]
}
Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get non-overlapping structures for a UniProt accession

This call provides details on non-overlapping PDB chains with the highest number of observed residues for the UniProt accession.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/best_non_overlapping_structures/:accession
Parameter

Field	Type	Description
accession	String	
UniProt Accession

Success 200

Field	Type	Description
chain_id	String	
PDB chain id.

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

start	Integer	
Starting PDB residue number. mmcif-style residue index (within entity or struct_asym_id).

end	Integer	
Ending PDB residue number. mmcif-style residue index (within entity or struct_asym_id).

unp_start	Integer	
Starting UniProt residue number.

unp_end	Integer	
Ending UniProt residue number.

pdb_id	String	
Four letter PDB code.

Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get processed protein details for a UniProt accession

Get processed protein details for a UniProt accession

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/processed_proteins/:accession
Parameter

Field	Type	Description
accession	String	
UniProt accession

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "P0DTD1": [
        {
            "id": "PRO_0000449618",
            "name": null,
            "unp_length": 7096,
            "unp_start": 1,
            "unp_end": 7096,
            "summary_counts": {
                "pdbs": 129,
                "ligands": 124,
                "interactions": 3
            },
            "representative_pdb": {
                "pdb_id": "6wen",
                "best_chain": "A",
                "entity_id": 1,
                "unp_start": 1024,
                "unp_end": 1192
            }
        },
        {
            "id": "PRO_0000449619",
            "name": null,
            "unp_length": 7096,
            "unp_start": 1,
            "unp_end": 180,
            "summary_counts": {
                "pdbs": 0,
                "ligands": 0,
                "interactions": 0
            },
            "representative_pdb": null
        },
        {
            "id": "PRO_0000449620",
            "name": null,
            "unp_length": 7096,
            "unp_start": 181,
            "unp_end": 818,
            "summary_counts": {
                "pdbs": 0,
                "ligands": 0,
                "interactions": 0
            },
            "representative_pdb": null
        },
        {
            "id": "PRO_0000449621",
            "name": null,
            "unp_length": 7096,
            "unp_start": 819,
            "unp_end": 2763,
            "summary_counts": {
                "pdbs": 7,
                "ligands": 8,
                "interactions": 1
            },
            "representative_pdb": {
                "pdb_id": "6wen",
                "best_chain": "A",
                "entity_id": 1,
                "unp_start": 1024,
                "unp_end": 1192
            }
        },
        {
            "id": "PRO_0000449622",
            "name": null,
            "unp_length": 7096,
            "unp_start": 2764,
            "unp_end": 3263,
            "summary_counts": {
                "pdbs": 0,
                "ligands": 0,
                "interactions": 0
            },
            "representative_pdb": null
        },
        {
            "id": "PRO_0000449623",
            "name": null,
            "unp_length": 7096,
            "unp_start": 3264,
            "unp_end": 3569,
            "summary_counts": {
                "pdbs": 107,
                "ligands": 99,
                "interactions": 2
            },
            "representative_pdb": {
                "pdb_id": "6m2q",
                "best_chain": "A",
                "entity_id": 1,
                "unp_start": 3264,
                "unp_end": 3569
            }
        },
        {
            "id": "PRO_0000449624",
            "name": null,
            "unp_length": 7096,
            "unp_start": 3570,
            "unp_end": 3859,
            "summary_counts": {
                "pdbs": 0,
                "ligands": 0,
                "interactions": 0
            },
            "representative_pdb": null
        },
        {
            "id": "PRO_0000449625",
            "name": null,
            "unp_length": 7096,
            "unp_start": 3860,
            "unp_end": 3942,
            "summary_counts": {
                "pdbs": 3,
                "ligands": 1,
                "interactions": 1
            },
            "representative_pdb": {
                "pdb_id": "6wiq",
                "best_chain": "A",
                "entity_id": 1,
                "unp_start": 3860,
                "unp_end": 3942
            }
        },
        {
            "id": "PRO_0000449626",
            "name": null,
            "unp_length": 7096,
            "unp_start": 3943,
            "unp_end": 4140,
            "summary_counts": {
                "pdbs": 3,
                "ligands": 1,
                "interactions": 1
            },
            "representative_pdb": {
                "pdb_id": "6wiq",
                "best_chain": "B",
                "entity_id": 2,
                "unp_start": 4019,
                "unp_end": 4140
            }
        },
        {
            "id": "PRO_0000449627",
            "name": null,
            "unp_length": 7096,
            "unp_start": 4141,
            "unp_end": 4253,
            "summary_counts": {
                "pdbs": 1,
                "ligands": 1,
                "interactions": 1
            },
            "representative_pdb": {
                "pdb_id": "6w9q",
                "best_chain": "A",
                "entity_id": 1,
                "unp_start": 4141,
                "unp_end": 4253
            }
        },
        {
            "id": "PRO_0000449628",
            "name": null,
            "unp_length": 7096,
            "unp_start": 4254,
            "unp_end": 4392,
            "summary_counts": {
                "pdbs": 4,
                "ligands": 9,
                "interactions": 1
            },
            "representative_pdb": {
                "pdb_id": "6w61",
                "best_chain": "B",
                "entity_id": 2,
                "unp_start": 4271,
                "unp_end": 4392
            }
        },
        {
            "id": "PRO_0000449629",
            "name": null,
            "unp_length": 7096,
            "unp_start": 4393,
            "unp_end": 5324,
            "summary_counts": {
                "pdbs": 2,
                "ligands": 1,
                "interactions": 2
            },
            "representative_pdb": {
                "pdb_id": "6m71",
                "best_chain": "A",
                "entity_id": 1,
                "unp_start": 4393,
                "unp_end": 5324
            }
        },
        {
            "id": "PRO_0000449630",
            "name": null,
            "unp_length": 7096,
            "unp_start": 5325,
            "unp_end": 5925,
            "summary_counts": {
                "pdbs": 0,
                "ligands": 0,
                "interactions": 0
            },
            "representative_pdb": null
        },
        {
            "id": "PRO_0000449631",
            "name": null,
            "unp_length": 7096,
            "unp_start": 5926,
            "unp_end": 6452,
            "summary_counts": {
                "pdbs": 0,
                "ligands": 0,
                "interactions": 1
            },
            "representative_pdb": null
        },
        {
            "id": "PRO_0000449632",
            "name": null,
            "unp_length": 7096,
            "unp_start": 6453,
            "unp_end": 6798,
            "summary_counts": {
                "pdbs": 0,
                "ligands": 0,
                "interactions": 1
            },
            "representative_pdb": {
                "pdb_id": "6w01",
                "best_chain": "A",
                "entity_id": 1,
                "unp_start": 6798,
                "unp_end": 6798
            }
        },
        {
            "id": "PRO_0000449633",
            "name": null,
            "unp_length": 7096,
            "unp_start": 6799,
            "unp_end": 7096,
            "summary_counts": {
                "pdbs": 4,
                "ligands": 9,
                "interactions": 1
            },
            "representative_pdb": {
                "pdb_id": "6w4h",
                "best_chain": "A",
                "entity_id": 1,
                "unp_start": 6799,
                "unp_end": 7096
            }
        }
    ]
}
Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get secondary structure mappings for a UniProt accession

This call provides details on mapped secondary structures for a UniProt accession.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/secondary_structures/:accession
Parameter

Field	Type	Description
accession	String	
UniProt Accession

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "P07550": {
        "sequence": "MGQPGNGSAFLLAPNGSHAPDHDVTQERDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIETLCVIAVDRYFAITSPFKYQSLLTKNKARVIILMVWIVSGLTSFLPIQMHWYRATHQEAINCYANETCCDFFTNQAYAIASSIVSFYVPLVIMVFVYSRVFQEAKRQLQKIDKSEGRFHVQNLSQVEQDGRTGHGLRRSSKFCLKEHKALKTLGIIMGTFTLCWLPFFIVNIVHVIQDNLIRKEVYILLNWIGYVNSGFNPLIYCRSPDFRIAFQELLCLRRSSLKAYGNGYSSNGNTGEQSGYHVEQEKENKLLCEDLPGTEDFVGHQGTVPSDNIDSQGRNCSTNDSLL",
        "length": 413,
        "dataType": "SECONDARY STRUCTURES",
        "data": [
            {
                "name": "Helix",
                "accession": "1274",
                "dataType": "Helix",
                "residues": [
                    {
                        "startIndex": 30,
                        "endIndex": 61,
                        "pdbStartIndex": 37,
                        "pdbEndIndex": 68,
                        "startCode": "GLU",
                        "endCode": "PHE",
                        "indexType": "UNIPROT",
                        "pdbEntries": [
                            {
                                "pdbId": "2rh1",
                                "entityId": 1,
                                "chainIds": [
                                    "A"
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get sequence and structural domains for a UniProt accession

This call provides details on sequence and structural domains for a UniProt accession.

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/domains/:accession
Parameter

Field	Type	Description
accession	String	
UniProt Accession

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "P07550": {
        "sequence": "MGQPGNGSAFLLAPNGSHAPDHDVTQERDEVWVVGMGIVMSLIVLAIVFGNVLVITAIAKFERLQTVTNYFITSLACADLVMGLAVVPFGAAHILMKMWTFGNFWCEFWTSIDVLCVTASIETLCVIAVDRYFAITSPFKYQSLLTKNKARVIILMVWIVSGLTSFLPIQMHWYRATHQEAINCYANETCCDFFTNQAYAIASSIVSFYVPLVIMVFVYSRVFQEAKRQLQKIDKSEGRFHVQNLSQVEQDGRTGHGLRRSSKFCLKEHKALKTLGIIMGTFTLCWLPFFIVNIVHVIQDNLIRKEVYILLNWIGYVNSGFNPLIYCRSPDFRIAFQELLCLRRSSLKAYGNGYSSNGNTGEQSGYHVEQEKENKLLCEDLPGTEDFVGHQGTVPSDNIDSQGRNCSTNDSLL",
        "length": 413,
        "dataType": "DOMAINS",
        "data": [
            {
                "name": "7tm_1",
                "accession": "PF00001",
                "dataType": "Pfam",
                "residues": [
                    {
                        "startIndex": 50,
                        "endIndex": 326,
                        "startCode": "GLY",
                        "endCode": "TYR",
                        "indexType": "UNIPROT"
                    }
                ]
            },
            {
                "name": "Rhopdopsin 7-helix transmembrane proteins",
                "accession": "2rh1A01",
                "dataType": "CATH",
                "residues": [
                    {
                        "startIndex": 29,
                        "endIndex": 230,
                        "startCode": "ASP",
                        "endCode": "LEU",
                        "indexType": "UNIPROT",
                        "pdbStartIndex": 36,
                        "pdbEndIndex": 237,
                        "pdbEntries": [
                            {
                                "pdbId": "2rh1",
                                "entityId": 1,
                                "chainIds": [
                                    "A"
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get sequence conservations for a UniProt Residue

Get sequence conservations for a UniProt Residue

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/sequence_conservation/:accession/:residueNumber
Parameter

Field	Type	Description
accession	String	
UniProt accession

residueNumber	String	
UniProt Residue Number

Example success response JSON:
{
    "P07550": {
        "unp_length": 413,
        "residues": [
            {
                "residue_number": 10,
                "residue_conservation": {
                    "conservation_score": "0",
                    "proba_A": "0.091",
                    "proba_C": "0.015",
                    "proba_D": "0.032",
                    "proba_E": "0.058",
                    "proba_F": "0.077",
                    "proba_G": "0.032",
                    "proba_H": "0.024",
                    "proba_I": "0.069",
                    "proba_K": "0.058",
                    "proba_L": "0.095",
                    "proba_M": "0.038",
                    "proba_N": "0.038",
                    "proba_P": "0.022",
                    "proba_Q": "0.043",
                    "proba_R": "0.042",
                    "proba_S": "0.073",
                    "proba_T": "0.068",
                    "proba_V": "0.085",
                    "proba_W": "0.012",
                    "proba_Y": "0.030"
                }
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

accession
	String
residueNumber
	String
UniProt - Get sequence conservations for a UniProt accession

Get sequence conservations for a UniProt accession

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/sequence_conservation/:accession
Parameter

Field	Type	Description
accession	String	
UniProt accession

Example success response JSON:
{
    "P07550": {
        "length": 413,
        "data": [
            {
                "start": 411,
                "end": 411,
                "conservation_score": 0,
                "tooltipContent": "Conservation score:0",
                "amino": [
                    {
                        "end": 411,
                        "oneLetterCode": "S",
                        "threeLetterCode": "SER",
                        "probability": 0.125,
                        "start": 411,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:SER<br/>Probability:12.50%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "A",
                        "threeLetterCode": "ALA",
                        "probability": 0.117,
                        "start": 411,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:ALA<br/>Probability:11.70%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "V",
                        "threeLetterCode": "VAL",
                        "probability": 0.076,
                        "start": 411,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:VAL<br/>Probability:7.60%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "T",
                        "threeLetterCode": "THR",
                        "probability": 0.075,
                        "start": 411,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:THR<br/>Probability:7.50%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "L",
                        "threeLetterCode": "LEU",
                        "probability": 0.062,
                        "start": 411,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:LEU<br/>Probability:6.20%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "K",
                        "threeLetterCode": "LYS",
                        "probability": 0.06,
                        "start": 411,
                        "color": "#f01505",
                        "tooltipContent": "Amino acid:LYS<br/>Probability:6.00%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "E",
                        "threeLetterCode": "GLU",
                        "probability": 0.055,
                        "start": 411,
                        "color": "#c048c0",
                        "tooltipContent": "Amino acid:GLU<br/>Probability:5.50%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "G",
                        "threeLetterCode": "GLY",
                        "probability": 0.055,
                        "start": 411,
                        "color": "#f09048",
                        "tooltipContent": "Amino acid:GLY<br/>Probability:5.50%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "I",
                        "threeLetterCode": "ILE",
                        "probability": 0.054,
                        "start": 411,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:ILE<br/>Probability:5.40%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "R",
                        "threeLetterCode": "ARG",
                        "probability": 0.045,
                        "start": 411,
                        "color": "#f01505",
                        "tooltipContent": "Amino acid:ARG<br/>Probability:4.50%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "N",
                        "threeLetterCode": "ASN",
                        "probability": 0.043,
                        "start": 411,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:ASN<br/>Probability:4.30%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "Q",
                        "threeLetterCode": "GLN",
                        "probability": 0.04,
                        "start": 411,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:GLN<br/>Probability:4.00%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "D",
                        "threeLetterCode": "ASP",
                        "probability": 0.037,
                        "start": 411,
                        "color": "#c048c0",
                        "tooltipContent": "Amino acid:ASP<br/>Probability:3.70%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "C",
                        "threeLetterCode": "CYS",
                        "probability": 0.03,
                        "start": 411,
                        "color": "#f08080",
                        "tooltipContent": "Amino acid:CYS<br/>Probability:3.00%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "P",
                        "threeLetterCode": "PRO",
                        "probability": 0.028,
                        "start": 411,
                        "color": "#c0c000",
                        "tooltipContent": "Amino acid:PRO<br/>Probability:2.80%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "F",
                        "threeLetterCode": "PHE",
                        "probability": 0.026,
                        "start": 411,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:PHE<br/>Probability:2.60%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "M",
                        "threeLetterCode": "MET",
                        "probability": 0.024,
                        "start": 411,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:MET<br/>Probability:2.40%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "Y",
                        "threeLetterCode": "TYR",
                        "probability": 0.022,
                        "start": 411,
                        "color": "#15a4a4",
                        "tooltipContent": "Amino acid:TYR<br/>Probability:2.20%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "H",
                        "threeLetterCode": "HIS",
                        "probability": 0.02,
                        "start": 411,
                        "color": "#15a4a4",
                        "tooltipContent": "Amino acid:HIS<br/>Probability:2.00%"
                    },
                    {
                        "end": 411,
                        "oneLetterCode": "W",
                        "threeLetterCode": "TRP",
                        "probability": 0.006,
                        "start": 411,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:TRP<br/>Probability:0.60%"
                    }
                ],
                "labelColor": "rgb(211,211,211)"
            },
            {
                "start": 412,
                "end": 412,
                "conservation_score": 0,
                "tooltipContent": "Conservation score:0",
                "amino": [
                    {
                        "end": 412,
                        "oneLetterCode": "L",
                        "threeLetterCode": "LEU",
                        "probability": 0.171,
                        "start": 412,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:LEU<br/>Probability:17.10%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "V",
                        "threeLetterCode": "VAL",
                        "probability": 0.117,
                        "start": 412,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:VAL<br/>Probability:11.70%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "I",
                        "threeLetterCode": "ILE",
                        "probability": 0.104,
                        "start": 412,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:ILE<br/>Probability:10.40%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "A",
                        "threeLetterCode": "ALA",
                        "probability": 0.07,
                        "start": 412,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:ALA<br/>Probability:7.00%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "S",
                        "threeLetterCode": "SER",
                        "probability": 0.053,
                        "start": 412,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:SER<br/>Probability:5.30%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "K",
                        "threeLetterCode": "LYS",
                        "probability": 0.052,
                        "start": 412,
                        "color": "#f01505",
                        "tooltipContent": "Amino acid:LYS<br/>Probability:5.20%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "T",
                        "threeLetterCode": "THR",
                        "probability": 0.05,
                        "start": 412,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:THR<br/>Probability:5.00%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "F",
                        "threeLetterCode": "PHE",
                        "probability": 0.047,
                        "start": 412,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:PHE<br/>Probability:4.70%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "R",
                        "threeLetterCode": "ARG",
                        "probability": 0.041,
                        "start": 412,
                        "color": "#f01505",
                        "tooltipContent": "Amino acid:ARG<br/>Probability:4.10%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "E",
                        "threeLetterCode": "GLU",
                        "probability": 0.04,
                        "start": 412,
                        "color": "#c048c0",
                        "tooltipContent": "Amino acid:GLU<br/>Probability:4.00%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "M",
                        "threeLetterCode": "MET",
                        "probability": 0.04,
                        "start": 412,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:MET<br/>Probability:4.00%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "Y",
                        "threeLetterCode": "TYR",
                        "probability": 0.034,
                        "start": 412,
                        "color": "#15a4a4",
                        "tooltipContent": "Amino acid:TYR<br/>Probability:3.40%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "Q",
                        "threeLetterCode": "GLN",
                        "probability": 0.033,
                        "start": 412,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:GLN<br/>Probability:3.30%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "G",
                        "threeLetterCode": "GLY",
                        "probability": 0.031,
                        "start": 412,
                        "color": "#f09048",
                        "tooltipContent": "Amino acid:GLY<br/>Probability:3.10%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "N",
                        "threeLetterCode": "ASN",
                        "probability": 0.03,
                        "start": 412,
                        "color": "#15c015",
                        "tooltipContent": "Amino acid:ASN<br/>Probability:3.00%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "D",
                        "threeLetterCode": "ASP",
                        "probability": 0.029,
                        "start": 412,
                        "color": "#c048c0",
                        "tooltipContent": "Amino acid:ASP<br/>Probability:2.90%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "H",
                        "threeLetterCode": "HIS",
                        "probability": 0.018,
                        "start": 412,
                        "color": "#15a4a4",
                        "tooltipContent": "Amino acid:HIS<br/>Probability:1.80%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "P",
                        "threeLetterCode": "PRO",
                        "probability": 0.018,
                        "start": 412,
                        "color": "#c0c000",
                        "tooltipContent": "Amino acid:PRO<br/>Probability:1.80%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "C",
                        "threeLetterCode": "CYS",
                        "probability": 0.013,
                        "start": 412,
                        "color": "#f08080",
                        "tooltipContent": "Amino acid:CYS<br/>Probability:1.30%"
                    },
                    {
                        "end": 412,
                        "oneLetterCode": "W",
                        "threeLetterCode": "TRP",
                        "probability": 0.008,
                        "start": 412,
                        "color": "#80a0f0",
                        "tooltipContent": "Amino acid:TRP<br/>Probability:0.80%"
                    }
                ],
                "labelColor": "rgb(211,211,211)"
            }
        ],
        "labelColor": "rgb(128,128,128)",
        "seqId": "3e9d25347d93e5c2b71f7d8151dd1e9c"
    }
}
Send a Sample Request


	url
Parameters

accession
	String
UniProt - Get similar proteins for a UniProt accession for a given sequence identity

Get similar proteins for a UniProt accession for a given sequence identity

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/similar_proteins/:accession/:identity
Parameter

Field	Type	Description
accession	String	
UniProt accession

identity	String	
Sequence identity

Example success response JSON:
{
    "P0DTD1": [
        {
            "mapped_segment": [
                {
                    "pdb_id": "2op9",
                    "best_chain": "A",
                    "unp_start": 724,
                    "unp_end": 1024,
                    "entity_id": 1
                },
                {
                    "pdb_id": "2gtb",
                    "best_chain": "A",
                    "unp_start": 724,
                    "unp_end": 1026,
                    "entity_id": 1
                }
            ],
            "unp_length": 1026,
            "species": "SARS coronavirus CUHK-L2",
            "taxid": 260550,
            "name": "Q6T1E9_CVHSA",
            "description": "Orf1ab polyprotein (Fragment)",
            "uniprot_id": "Q6T1E9",
            "sequence_identity": 95
        },
        {
            "mapped_segment": [
                {
                    "pdb_id": "4hi3",
                    "best_chain": "B",
                    "unp_start": 3240,
                    "unp_end": 3546,
                    "entity_id": 1
                },
                {
                    "pdb_id": "2amq",
                    "best_chain": "A",
                    "unp_start": 3241,
                    "unp_end": 3546,
                    "entity_id": 1
                }
            ],
            "unp_length": 4382,
            "species": "Severe acute respiratory syndrome-related coronavirus",
            "taxid": 694009,
            "name": "R1A_CVHSA",
            "description": "Replicase polyprotein 1a",
            "uniprot_id": "P0C6U8",
            "sequence_identity": 95
        }
    ]
}
Send a Sample Request


	url
Parameters

accession
	String
identity
	String
UniProt - Get superposition details for a UniProt accession

Get superposition details for a UniProt accession

https://www.ebi.ac.uk/pdbe/graph-api/uniprot/superposition/:accession
Parameter

Field	Type	Description
accession	String	
UniProt accession

Success 200

Field	Type	Description
sequence	String	
Sequence of the entity - available for polymeric entities only. Usually there is one character per sequence position, but not if single-letter-code is actually multiple characters - so this string might be longer the length field suggests.

length	Integer	
Length of entities, available for polymeric entities.

dataType	String	
A string denoting the type of data provided in the section.

data	Object[]	
A list of objects which contains the data for the corresponding data type.

name	String	
Name of the resource, annotation, etc.

accession	String	
A unique identifier for the resource, annotation, etc.

residues	Object[]	
A list of residue objects.

startIndex	Integer	
Starting residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

endIndex	Integer	
Ending residue number. mmcif-style residue index (within entity or struct_asym_id) in case of PDB.

indexType	String	
Type of index, can be PDB or UNP.

startCode	String	
Amino acid three-letter code for the residue in startIndex.

endCode	String	
Amino acid three-letter code for the residue in endIndex.

additionalData	Object	
An object which holds additional data related to the resource/annotation.

bestChainId	String	
The PDB Chain ID (auth_asym_id) of the best chain.

entityId	Integer	
Entity id (molecule number in mmcif-speak).

Example success response JSON:
{
    "P0DTD1": [
        {
            "segment_start": 1024,
            "segment_end": 1192,
            "clusters": [
                [
                    {
                        "pdb_id": "6wcf",
                        "auth_asym_id": "A",
                        "struct_asym_id": "A",
                        "entity_id": 1,
                        "is_representative": true
                    },
                    {
                        "pdb_id": "6w6y",
                        "auth_asym_id": "B",
                        "struct_asym_id": "B",
                        "entity_id": 1,
                        "is_representative": false
                    }
                ]
            ]
        },
        {
            "segment_start": 1564,
            "segment_end": 1878,
            "clusters": [
                [
                    {
                        "pdb_id": "6w9c",
                        "auth_asym_id": "A",
                        "struct_asym_id": "A",
                        "entity_id": 1,
                        "is_representative": true
                    },
                    {
                        "pdb_id": "6w9c",
                        "auth_asym_id": "C",
                        "struct_asym_id": "C",
                        "entity_id": 1,
                        "is_representative": false
                    },
                    {
                        "pdb_id": "6w9c",
                        "auth_asym_id": "B",
                        "struct_asym_id": "B",
                        "entity_id": 1,
                        "is_representative": false
                    }
                ]
            ]
        },
        {
            "segment_start": 3264,
            "segment_end": 3569,
            "clusters": [
                [
                    {
                        "pdb_id": "6m2q",
                        "auth_asym_id": "A",
                        "struct_asym_id": "A",
                        "entity_id": 1,
                        "is_representative": true
                    },
                    {
                        "pdb_id": "5rf9",
                        "auth_asym_id": "A",
                        "struct_asym_id": "A",
                        "entity_id": 1,
                        "is_representative": false
                    }
                ]
            ]
        },
        {
            "segment_start": 3942,
            "segment_end": 4142,
            "clusters": [
                [
                    {
                        "pdb_id": "6m71",
                        "auth_asym_id": "D",
                        "struct_asym_id": "C",
                        "entity_id": 3,
                        "is_representative": true
                    }
                ],
                [
                    {
                        "pdb_id": "6wiq",
                        "auth_asym_id": "B",
                        "struct_asym_id": "B",
                        "entity_id": 2,
                        "is_representative": true
                    },
                    {
                        "pdb_id": "6m71",
                        "auth_asym_id": "B",
                        "struct_asym_id": "D",
                        "entity_id": 3,
                        "is_representative": false
                    }
                ]
            ]
        }
    ]
}
Send a Sample Request


	url
Parameters

accession
	String
Validation

Validation - Get Entry-wide validation metrics

Metrics here are the ones recommended by validation task force. Global is against whole PDB archive and relative is against entries of comparable resolution.

https://www.ebi.ac.uk/pdbe/graph-api/validation/global-percentiles/entry/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
percent-RSRZ-outliers	Object	
Percentile based on percent RSRZ outliers (calculated on standard amino acid residues or nucleotides in protein, DNA, RNA chains).

relative	Float	
This percentile is based on entries in the PDB archive that are comparable to the entry, e.g. similar resolution for X-ray entries.

rawvalue	Float	
The raw value of the metric.

absolute	Float	
This percentile is based on all possible entries in the PDB archive.

clashscore	Object	
Percentile based on clash score calculated by Molpropbity component of the wwPDB validation pipeline.

percent-rota-outliers	Object	
Percentile based on percent sidechain outliers calculated by Molpropbity component of the wwPDB validation pipeline.

percent-rama-outliers	Object	
Percentile based on percent Ramachandran outliers calculated by Molpropbity component of the wwPDB validation pipeline.

DCC_Rfree	Object	
Percentile based on Rfree calculated by DCC package running with EDS component of the wwPDB validation pipeline.

Example success response JSON:
{
    "3j8g": {
        "clashscore": {
            "relative": 41.9,
            "rawvalue": 15.46,
            "absolute": 18.7
        },
        "percent-rota-outliers": {
            "relative": 17.1,
            "rawvalue": 10.66,
            "absolute": 11.1
        },
        "percent-rama-outliers": {
            "relative": 4.6,
            "rawvalue": 10.17,
            "absolute": 1.3
        },
        "RNAsuiteness": {
            "relative": 72.1,
            "rawvalue": 0.49,
            "absolute": 48.1
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
Validation - Get Ramachandran status for a PDB Entry ID

This call returns Ramachandran status (favoured, outlier, etc.), phi-psi values, sidechain status (rotamer name or outlier) as reported by Molprobity component of the wwPDB validation pipeline.

https://www.ebi.ac.uk/pdbe/graph-api/validation/rama_sidechain_listing/entry/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
psi	Float	
Protein backbone dihedral angle psi.

phi	Float	
Protein backbone dihedral angle phi.

cis_peptide	String	
Cis isomerization of the peptide bond.as

rama	String	
Sidechain status (OUTLIER or rotamer name) of the residue.

rota	String	
Ramachandran status (Allowed, Favored, OUTLIER etc.) of the residue.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

alt_code	String	
Alternate location indicator of the outlier residue.

Example success response JSON:
{
    "1cbs": {
        "molecules": [
            {
                "entity_id": 1,
                "chains": [
                    {
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "models": [
                            {
                                "model_id": 1,
                                "residues": [
                                    {
                                        "psi": null,
                                        "cis_peptide": null,
                                        "residue_number": 1,
                                        "author_residue_number": 1,
                                        "rama": null,
                                        "phi": null,
                                        "author_insertion_code": "",
                                        "residue_name": "PRO",
                                        "rota": "Cg_endo"
                                    },
                                    {
                                        "psi": null,
                                        "cis_peptide": null,
                                        "residue_number": 137,
                                        "author_residue_number": 137,
                                        "rama": null,
                                        "phi": null,
                                        "author_insertion_code": "",
                                        "residue_name": "GLU",
                                        "rota": "mt-10"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
Validation - Get SIFTS backbone and sidechain outliers for a PDB Entry ID

This call returns backbone and sidechain outliers in protein chains, as calculated by Molprobity as part of wwPDB validation pipeline.

https://www.ebi.ac.uk/pdbe/graph-api/validation/protein-ramachandran-sidechain-outliers/entry/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
ramachandran_outliers	Object[]	
Protein backbone outliers.

sidechain_outliers	Object[]	
Protein sidechain outliers.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

alt_code	String	
Alternate location indicator of the outlier residue.

Example success response JSON:
{
    "1cbs": {
        "ramachandran_outliers": [],
        "sidechain_outliers": [
            {
                "model_id": 1,
                "entity_id": 1,
                "residue_number": 14,
                "author_residue_number": 14,
                "chain_id": "A",
                "author_insertion_code": "",
                "alt_code": "",
                "struct_asym_id": "A"
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
Validation - Get Suite and pucker outliers in RNA chains

This call returns RNA backbone outliers, i.e. non-rotameric suites and unusual puckers, as calculated by Molprobity as part of wwPDB validation pipeline.

https://www.ebi.ac.uk/pdbe/graph-api/validation/RNA_pucker_suite_outliers/entry/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
pucker_outliers	Object[]	
RNA sugar pucker outliers.

author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

alt_code	String	
Alternate location indicator of the outlier residue.

Example success response JSON:
{
    "3j8g": {
        "pucker_outliers": [
            {
                "model_id": 1,
                "entity_id": 1,
                "residue_number": 12,
                "author_residue_number": 13,
                "chain_id": "A",
                "author_insertion_code": "",
                "alt_code": null,
                "struct_asym_id": "A"
            },
            {
                "model_id": 1,
                "entity_id": 1,
                "residue_number": 13,
                "author_residue_number": 14,
                "chain_id": "A",
                "author_insertion_code": "",
                "alt_code": null,
                "struct_asym_id": "A"
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
Validation - Get X-Ray refine data stats

Get X-Ray refine data stats.

https://www.ebi.ac.uk/pdbe/graph-api/validation/xray_refine_data_stats/entry/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
source	String	
Source of this property, e.g. depositor or software.

value	String/Float/Integer	
Value of this property.

EDS_R	Object	
R factor calculated by EDS step of wwPDB validation pipeline.

EDS_resolution_low	Object	
Resolution calculated by EDS, the lower cutoff.

IoverSigma	Object	
Signal to noise ratio for highest resolution shell.

acentric_outliers	Object	
Number of acentric outliers.

TransNCS	Object	
A statement on translational NCS.

TwinL	Object	
L and L2 are metrics calculated by Xtriage as part of L-test for twinning.

DCC_Rfree	Object	
Free R factor recalculated by DCC software.

DataCompleteness	Object	
Completeness of data, determined by EDS step of wwPDB validation pipeline.

TwinL2	Object	
L and L2 are metrics calculated by Xtriage as part of L-test for twinning.

DCC_refinement_program	Object	
Refinement program used by depositor.

bulk_solvent_b	Object	
Bulk solvent B.

bulk_solvent_k	Object	
Bulk solvent K.

precent-free-reflections	Object	
Percentage of total reflections that are part of the free set, i.e. not used in refinement.

Fo_Fc_correlation	Object	
Correlation between Fo and Fc structure factor amplitudes.

centric_outliers	Object	
Number of centric outliers.

DCC_R	Object	
R factor recalculated by DCC software.

WilsonBestimate	Object	
The Wilson B factor.

numMillerIndices	Object	
Number of structure factors recorded in the dataset used for refinement.

EDS_resolution	Object	
Resolution calculated by EDS, the higher cutoff.

Example success response JSON:
{
    "1cbs": {
        "DataCompleteness": {
            "source": "EDS",
            "value": 90.54
        },
        "num-free-reflections": {
            "source": "EDS",
            "value": 1496
        },
        "numMillerIndices": {
            "source": "Xtriage(Phenix)",
            "value": 14678
        },
        "TransNCS": {
            "source": "Xtriage(Phenix)",
            "value": "The largest off-origin peak in the Patterson function is 9.26% of the height of the origin peak. No significant pseudotranslation is detected."
        },
        "DCC_refinement_program": {
            "source": "DCC",
            "value": "CNS"
        },
        "centric_outliers": {
            "source": "Xtriage(Phenix)",
            "value": 0
        },
        "TwinL": {
            "source": "Xtriage(Phenix)",
            "value": 0.515
        },
        "EDS_R": {
            "source": "EDS",
            "value": 0.18
        },
        "DCC_Rfree": {
            "source": "DCC",
            "value": 0.19
        },
        "percent-free-reflections": {
            "source": "EDS",
            "value": 10.19
        },
        "acentric_outliers": {
            "source": "Xtriage(Phenix)",
            "value": 1
        },
        "DCC_R": {
            "source": "DCC",
            "value": 0.18
        },
        "EDS_resolution_low": {
            "source": "EDS",
            "value": 14.93
        },
        "WilsonBestimate": {
            "source": "Xtriage(Phenix)",
            "value": 14.785
        },
        "bulk_solvent_k": {
            "source": "EDS",
            "value": 0.401
        },
        "EDS_resolution": {
            "source": "EDS",
            "value": 1.8
        },
        "Fo_Fc_correlation": {
            "source": "EDS",
            "value": 0.956
        },
        "IoverSigma": {
            "source": "Xtriage(Phenix)",
            "value": "3.77(1.79A)"
        },
        "TwinL2": {
            "source": "Xtriage(Phenix)",
            "value": 0.357
        },
        "bulk_solvent_b": {
            "source": "EDS",
            "value": 72.956
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
Validation - Get a list of outlier types found in residues

A residue can have many types of geometric or experimental-data-based outliers. This call lists all kinds of outliers found in a residue. For residues with no recorded outlier, there is no information returned.

https://www.ebi.ac.uk/pdbe/graph-api/validation/residuewise_outlier_summary/entry/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "molecules": [
            {
                "entity_id": 1,
                "chains": [
                    {
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "models": [
                            {
                                "model_id": 1,
                                "residues": [
                                    {
                                        "author_insertion_code": "",
                                        "author_residue_number": 1,
                                        "alt_code": "",
                                        "outlier_types": [
                                            "clashes"
                                        ],
                                        "residue_number": 1
                                    },
                                    {
                                        "author_insertion_code": "",
                                        "author_residue_number": 127,
                                        "alt_code": "",
                                        "outlier_types": [
                                            "sidechain_outliers"
                                        ],
                                        "residue_number": 127
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
Validation - Get key validation stats

This is still a very high level summary, but covers metrics of interest not included in percentiles, or a little more detail than just percentile.

https://www.ebi.ac.uk/pdbe/graph-api/validation/key_validation_stats/entry/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
protein_ramachandran	Object	
Information about Ramachandran outliers.

bonds	Object	
Information about bond length outliers in protein, RNA and DNA chains.

RSRZ	Object	
Information about outlier residues according to the RSRZ criterion which measures the fit between model and electron density.

rna_pucker	Object	
Information about RNA sugar pucker outliers.

angles	Object	
Information about bond angle outliers in protein, RNA, DNA chains.

protein_sidechains	Object	
Information about protein sidechain outliers.

rna_suite	Object	
Information about RNA backbone rotamericity outliers.

num_outliers	Integer	
Number of outliers.

num_checked	Integer	
Number of residues checked for being outliers.

percent_outliers	Float	
Percentage of outliers with respect to number of residues checked.

Example success response JSON:
{
    "3j8g": {
        "bonds": {
            "rmsz": 3.21,
            "num_checked": 102957,
            "percent_outliers": 0.36,
            "num_outliers": 367
        },
        "angles": {
            "rmsz": 3.42,
            "num_checked": 153778,
            "percent_outliers": 0.61,
            "num_outliers": 943
        },
        "rna_suite": {
            "num_checked": 2989,
            "num_outliers": 600,
            "percent_outliers": "20.07"
        },
        "rna_pucker": {
            "num_checked": 2989,
            "num_outliers": 126,
            "percent_outliers": "4.22"
        },
        "protein_ramachandran": {
            "num_checked": 3894,
            "num_outliers": 396,
            "percent_outliers": "10.17"
        },
        "RSRZ": {
            "num_checked": 0,
            "num_outliers": 0,
            "percent_outliers": null
        },
        "protein_sidechains": {
            "num_checked": 3209,
            "num_outliers": 342,
            "percent_outliers": "10.66"
        }
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
Validation - Get residues with geometric outliers in protein, DNA, RNA chains

Lists residues in protein, DNA, RNA chains that contain various types of geometry outliers.

https://www.ebi.ac.uk/pdbe/graph-api/validation/protein-RNA-DNA-geometry-outlier-residues/entry/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
author_residue_number	Integer	
Residue number (in PDB-style residue addressing scheme).

author_insertion_code	String	
Residue insertion code.

residue_number	Integer	
mmcif-style residue index (within entity or struct_asym_id).

chain_id	String	
PDB chain id.

struct_asym_id	String	
struct_asym_id (chain id in mmcif-speak).

entity_id	Integer	
Entity id (molecule number in mmcif-speak).

chem_comp_id	String	
For entities represented as single molecules, the identifier corresponding to the chemical definition for the molecule.

begin	Object	
Denotes a residue object where a mapping starts.

end	Object	
Denotes a residue object where a mapping ends.

alternate_conformers	Integer	
Number of alternate conformers modelled for this residue.

Example success response JSON:
{
    "1cbs": {
        "molecules": [
            {
                "entity_id": 1,
                "chains": [
                    {
                        "chain_id": "A",
                        "struct_asym_id": "A",
                        "models": [
                            {
                                "model_id": 1,
                                "outlier_types": {
                                    "clashes": [
                                        {
                                            "author_insertion_code": "",
                                            "author_residue_number": 1,
                                            "alt_code": null,
                                            "residue_number": 1
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
Validation - Get summary of global absolute percentiles

These scores are harmonic means of absolute percentiles of geometric metrics (e.g. ramachandran, clashscore, sidechains), reflections-based metrics (Rfree, RSRZ) and both these kinds of metrics taken together. Wherever a constitutent percentile is 0, the harmonic mean is defined to be 0. When constituent percentiles are all unavailable, the harmonic mean is null.

https://www.ebi.ac.uk/pdbe/graph-api/validation/summary_quality_scores/entry/:pdbId
Parameter

Field	Type	Description
pdbId	String	
PDB Entry ID

Success 200

Field	Type	Description
overall_quality	Float	
Harmonic mean of all absolute validation percentile metrics.

geometry_quality	Float	
Harmonic mean of absolute percentiles related to model geometry.

data_quality	Float	
Harmonic mean of absolute percentiles related to experimental data and its fit to the model.

experiment_data_available	Boolean	
Sometimes data quality is absent due to unavailability of experimental data itself. This flag tells whether the data are available.

Example success response JSON:
{
    "3j8g": {
        "overall_quality": 4.28,
        "geometry_quality": 4.28,
        "experiment_data_available": "unknown",
        "data_quality": null
    }
}
Send a Sample Request


	url
Parameters

pdbId
	String
Generated with apidoc 0.20.1 - 2025-05-20T10:45:10.205Z
Top
EMBL-EBI Intranet for staff
Services
Data resources and tools
Data submission
Help & Support
Licensing
Research
Publications
Research groups
Postdocs & PhDs
Training
Live training
On-demand training
Support for trainers
Contact organisers
Industry
Members Area
Contact Industry team
About
Contact us
Events
Jobs
News
People & groups
EMBL-EBI, Wellcome Genome Campus, Hinxton, Cambridgeshire, CB10 1SD, UK. +44 (0)1223 49 44 44
Copyright © EMBL 2025 | EMBL-EBI is part of the European Molecular Biology Laboratory | Terms of use
This website requires cookies, and the limited processing of your personal data in order to function. By using the site you are agreeing to this as outlined in our Privacy Notice and Terms of Use.I agree, dismiss this banner
An error occurred
Please try again later
Contact SupportClose
Full-text Access 