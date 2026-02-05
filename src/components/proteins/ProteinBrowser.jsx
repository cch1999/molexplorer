import { useState, useCallback, useEffect } from 'react';
import ApiService from '../../utils/apiService';
import {
  CRYSTALLIZATION_AIDS,
  ION_LIGANDS,
  RCSB_STRUCTURE_IMAGE_BASE_URL,
  RCSB_STRUCTURE_BASE_URL,
  PD_BE_ENTRY_BASE_URL,
  PD_BE_STATIC_IMAGE_BASE_URL,
} from '../../utils/constants';
import { Panel, Button } from '../ui';
import { useProteinStore } from '../../stores/useProteinStore';
import { useMoleculeStore } from '../../stores/useMoleculeStore';
import { useAppStore } from '../../stores/useAppStore';
import { useToast } from '../../contexts/ToastContext';

const SUGGESTED_GROUPS = [
  { value: 'G_1002155', label: 'mPro (Main Protease)' },
  { value: 'G_1002164', label: 'NSP13 (Helicase)' },
  { value: 'G_1002003', label: 'PLpro (Papain-like Protease)' },
  { value: 'G_1002165', label: 'NSP15 (Endoribonuclease)' },
  { value: 'G_1002166', label: 'NSP16 (2\'-O-Methyltransferase)' },
  { value: 'B1MDI3', label: 'TrmD (tRNA methyltransferase)' },
  { value: 'O60885', label: 'BRD4 (Bromodomain-containing protein 4)' },
  { value: 'P07900', label: 'Hsp90 (Heat Shock Protein 90)' },
  { value: 'P00918', label: 'Carbonic Anhydrase II' },
  { value: 'P24941', label: 'CDK2 (Cyclin-Dependent Kinase 2)' },
];

async function fetchMemberDetails(pdbIds, limit, offset) {
  const limitedIds = pdbIds.slice(offset, offset + limit);
  const promises = limitedIds.map((id) =>
    ApiService.getRcsbEntry(id).catch(() => ({ rcsb_id: id, error: 'Failed to fetch details' }))
  );
  return Promise.all(promises);
}

async function fetchBoundLigands(pdbId) {
  try {
    const data = await ApiService.getLigandMonomers(pdbId);
    return data[pdbId.toLowerCase()] || [];
  } catch {
    return [];
  }
}

export function ProteinBrowser() {
  const [queryId, setQueryId] = useState('G_1002155');
  const proteinDetails = useProteinStore((s) => s.proteinDetails);
  const allPdbIds = useProteinStore((s) => s.allPdbIds);
  const totalResults = useProteinStore((s) => s.totalResults);
  const offset = useProteinStore((s) => s.offset);
  const limit = useProteinStore((s) => s.limit);
  const hideAids = useProteinStore((s) => s.hideAids);
  const hideIons = useProteinStore((s) => s.hideIons);
  const isLoading = useProteinStore((s) => s.isLoading);
  const error = useProteinStore((s) => s.error);

  const setProteinResults = useProteinStore((s) => s.setProteinResults);
  const appendResults = useProteinStore((s) => s.appendResults);
  const setLoading = useProteinStore((s) => s.setLoading);
  const setError = useProteinStore((s) => s.setError);
  const setHideAids = useProteinStore((s) => s.setHideAids);
  const setHideIons = useProteinStore((s) => s.setHideIons);
  const addMolecule = useMoleculeStore((s) => s.addMolecule);
  const openOverlay = useAppStore((s) => s.openOverlay);
  const setCurrentItem = useAppStore((s) => s.setCurrentItem);
  const { toast } = useToast();

  const search = useCallback(async () => {
    const id = queryId.trim();
    if (!id) {
      toast('Please enter a Group ID or UniProt ID.', 'info');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let pdbIds = [];
      if (id.toUpperCase().startsWith('G_')) {
        const data = await ApiService.getProteinGroup(id);
        pdbIds = data.rcsb_group_container_identifiers.group_member_ids || [];
      } else {
        pdbIds = await ApiService.getPdbEntriesForUniprot(id);
      }
      const details = await fetchMemberDetails(pdbIds, limit, 0);
      setProteinResults(details, pdbIds, pdbIds.length);
    } catch (err) {
      console.error('Error fetching protein entries:', err);
      setError(err?.message || 'Failed to fetch data');
      toast(err?.message || 'Failed to fetch protein data', 'error');
    } finally {
      setLoading(false);
    }
  }, [queryId, limit, setLoading, setError, setProteinResults, toast]);

  const loadMore = useCallback(async () => {
    if (offset >= totalResults) return;
    setLoading(true);
    try {
      const details = await fetchMemberDetails(allPdbIds, limit, offset);
      appendResults(details, allPdbIds);
    } catch (err) {
      toast('Failed to load more protein entries.', 'error');
    } finally {
      setLoading(false);
    }
  }, [offset, totalResults, allPdbIds, limit, appendResults, setLoading, toast]);

  const handlePdbClick = (pdbId) => {
    setCurrentItem({ pdbId });
    openOverlay('pdb-details');
  };

  return (
    <Panel title="Protein Structure Browser">
      <div className="protein-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <select
          className="select"
          value=""
          onChange={(e) => {
            const v = e.target.value;
            if (v) setQueryId(v);
          }}
          style={{ minWidth: 220 }}
        >
          <option value="">Choose a common protein...</option>
          {SUGGESTED_GROUPS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
        <input
          type="text"
          className="input"
          placeholder="Enter RCSB Group ID or UniProt ID..."
          value={queryId}
          onChange={(e) => setQueryId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          style={{ width: 280 }}
        />
        <Button variant="primary" onClick={search}>Search</Button>
        <div className="toggle-switch">
          <input
            id="hide-aids"
            type="checkbox"
            className="toggle-switch-checkbox"
            checked={hideAids}
            onChange={(e) => setHideAids(e.target.checked)}
          />
          <label className="toggle-switch-label" htmlFor="hide-aids" />
          <span>Hide Crystallization Aids</span>
        </div>
        <div className="toggle-switch">
          <input
            id="hide-ions"
            type="checkbox"
            className="toggle-switch-checkbox"
            checked={hideIons}
            onChange={(e) => setHideIons(e.target.checked)}
          />
          <label className="toggle-switch-label" htmlFor="hide-ions" />
          <span>Hide Ions</span>
        </div>
      </div>

      {isLoading && !proteinDetails.length && (
        <p style={{ color: 'var(--color-text-dim)' }}>Loading protein data...</p>
      )}
      {error && !proteinDetails.length && (
        <p style={{ color: 'var(--color-error)' }}>{error}</p>
      )}
      {proteinDetails.length > 0 && (
        <>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)', marginBottom: 'var(--space-2)' }}>
            Showing {Math.min(offset, totalResults)} of {totalResults} results.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="pdb-entries-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>PDB ID</th>
                  <th>Title</th>
                  <th>Resolution (Å)</th>
                  <th>Release Date</th>
                  <th>Publication</th>
                  <th>Bound Ligands</th>
                  <th>View Structure</th>
                </tr>
              </thead>
              <tbody>
                {proteinDetails.map((detail) => (
                  <ProteinRow
                    key={detail.rcsb_id}
                    detail={detail}
                    hideAids={hideAids}
                    hideIons={hideIons}
                    onPdbClick={handlePdbClick}
                    onAddLigand={(payload) => {
                      const ok = addMolecule(payload);
                      if (ok) toast(`Adding molecule ${payload.code}...`, 'success');
                      else toast(`Molecule ${payload.code} already in library`, 'info');
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {offset < totalResults && (
            <Button onClick={loadMore} style={{ marginTop: 'var(--space-4)' }}>Load more</Button>
          )}
        </>
      )}
      {!isLoading && !error && proteinDetails.length === 0 && queryId && (
        <p style={{ color: 'var(--color-text-dim)' }}>No results found.</p>
      )}
    </Panel>
  );
}

function ProteinRow({ detail, hideAids, hideIons, onPdbClick, onAddLigand }) {
  const [rawLigands, setRawLigands] = useState([]);
  const pdbId = detail.rcsb_id;

  useEffect(() => {
    fetchBoundLigands(pdbId).then(setRawLigands);
  }, [pdbId]);

  const ligands = rawLigands.filter((l) => {
    if (hideAids && CRYSTALLIZATION_AIDS.includes(l.chem_comp_id)) return false;
    if (hideIons && ION_LIGANDS.includes(l.chem_comp_id)) return false;
    return true;
  });

  const title = detail.struct?.title || 'N/A';
  const resolution = detail.rcsb_entry_info?.resolution_combined?.[0]?.toFixed(2) || 'N/A';
  const releaseDate = detail.rcsb_accession_info?.initial_release_date
    ? new Date(detail.rcsb_accession_info.initial_release_date).toLocaleDateString()
    : 'N/A';
  const citation = detail.rcsb_primary_citation;
  const citationTitle = citation?.title || 'N/A';
  const citationUrl = citation?.pdbx_database_id_doi
    ? `https://doi.org/${citation.pdbx_database_id_doi}`
    : citation?.pdbx_database_id_PubMed
      ? `https://pubmed.ncbi.nlm.nih.gov/${citation.pdbx_database_id_PubMed}/`
      : null;
  const imageUrl = `${RCSB_STRUCTURE_IMAGE_BASE_URL}/${pdbId.toLowerCase()}_assembly-1.jpeg`;

  return (
    <tr>
      <td><img src={imageUrl} alt={`${pdbId} thumbnail`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} /></td>
      <td>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPdbClick(pdbId)}>
          {pdbId}
        </button>
      </td>
      <td>{title}</td>
      <td>{resolution}</td>
      <td>{releaseDate}</td>
      <td>
        {citationUrl ? (
          <a href={citationUrl} target="_blank" rel="noopener noreferrer">{citationTitle}</a>
        ) : (
          citationTitle
        )}
      </td>
      <td>
        <BoundLigandsCell ligands={ligands} pdbId={pdbId} onAdd={onAddLigand} />
      </td>
      <td>
        <a href={`${RCSB_STRUCTURE_BASE_URL}/${pdbId}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm" style={{ marginRight: 4 }}>RCSB</a>
        <a href={`https://www.ebi.ac.uk/pdbe/entry/pdb/${pdbId.toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm">PDBe</a>
      </td>
    </tr>
  );
}

function BoundLigandsCell({ ligands, pdbId, onAdd }) {
  const display = ligands.slice(0, 5);
  const more = ligands.length > 5 ? ligands.length - 5 : 0;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
      {display.map((lig) => (
        <div key={`${lig.chain_id}-${lig.author_residue_number}`} style={{ position: 'relative' }}>
          <img
            src={`${PD_BE_STATIC_IMAGE_BASE_URL}/${lig.chem_comp_id}_200.svg`}
            alt={lig.chem_comp_id}
            title={`${lig.chem_comp_id}: ${lig.chem_comp_name}`}
            style={{ width: 32, height: 32 }}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ position: 'absolute', bottom: -4, right: -4, minWidth: 20, minHeight: 20, padding: 2, fontSize: 10 }}
            onClick={() => onAdd({
              code: lig.chem_comp_id,
              pdbId,
              chainId: lig.chain_id,
              authorResidueNumber: String(lig.author_residue_number),
            })}
          >
            +
          </button>
        </div>
      ))}
      {more > 0 && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>+{more}</span>}
    </div>
  );
}
