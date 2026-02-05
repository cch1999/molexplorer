import { useState, useEffect } from 'react';
import ApiService from '../../utils/apiService';
import { useRDKit } from '../../hooks/useRDKit';
import { useMoleculeStore } from '../../stores/useMoleculeStore';
import { useFragmentStore } from '../../stores/useFragmentStore';
import { useAppStore } from '../../stores/useAppStore';
import { useToast } from '../../contexts/ToastContext';
import { Panel, Button } from '../ui';
import { FragmentCard } from './FragmentCard';

function parseTsv(tsvData) {
  const rows = tsvData.split('\n').slice(1);
  return rows
    .map((row, index) => {
      const columns = row.split('\t');
      if (columns.length < 10) return null;
      return {
        id: columns[0] || String(index),
        name: columns[1],
        kind: columns[2],
        query: columns[3],
        description: columns[4],
        comment: columns[5],
        url: columns[6],
        source: columns[7],
        ccd: columns[8],
        in_ccd: columns[9].trim() === 'True',
      };
    })
    .filter(Boolean);
}

export function FragmentLibrary() {
  const [loadedFragments, setLoadedFragments] = useState([]);
  const customFragments = useFragmentStore((s) => s.customFragments);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [onlyInCCD, setOnlyInCCD] = useState(true);
  const [loading, setLoading] = useState(true);
  const rdkit = useRDKit();
  const getMolecule = useMoleculeStore((s) => s.getMolecule);
  const addMolecule = useMoleculeStore((s) => s.addMolecule);
  const openOverlay = useAppStore((s) => s.openOverlay);
  const setCurrentItem = useAppStore((s) => s.setCurrentItem);
  const { toast } = useToast();

  const fragments = [...customFragments, ...loadedFragments];

  useEffect(() => {
    let cancelled = false;
    ApiService.getFragmentLibraryTsv()
      .then((tsvData) => {
        if (!cancelled) setLoadedFragments(parseTsv(tsvData));
      })
      .catch((err) => {
        console.error('Failed to load fragment library:', err);
        if (!cancelled) setLoadedFragments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filtered = fragments.filter((f) => {
    const nameMatch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const sourceMatch = sourceFilter === 'all' || f.source === sourceFilter;
    const ccdMatch = !onlyInCCD || f.in_ccd;
    return nameMatch && sourceMatch && ccdMatch;
  });

  const handleAddToLibrary = (ccdCode) => {
    const added = addMolecule(ccdCode);
    if (added) {
      toast(`Adding molecule ${ccdCode} to library...`, 'success');
    } else {
      toast(`Molecule ${ccdCode} already in library.`, 'info');
    }
  };

  const handleShowDetails = (ccdCode) => {
    setCurrentItem({ code: ccdCode });
    openOverlay('ligand-details');
  };

  return (
    <Panel
      title="Fragment Library"
      headerAction={
        <Button variant="primary" onClick={() => openOverlay('add-fragment')} title="Add new fragment">
          +
        </Button>
      }
    >
      <div className="fragment-controls" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <input
          type="text"
          className="input"
          placeholder="Search fragments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 200 }}
        />
        <select
          className="select"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="all">All Sources</option>
          <option value="PDBe">PDBe</option>
          <option value="ENAMINE">ENAMINE</option>
          <option value="DSI">DSI</option>
        </select>
        <div className="toggle-switch">
          <input
            id="fragment-ccd-toggle"
            type="checkbox"
            className="toggle-switch-checkbox"
            checked={onlyInCCD}
            onChange={(e) => setOnlyInCCD(e.target.checked)}
          />
          <label className="toggle-switch-label" htmlFor="fragment-ccd-toggle" />
          <span>Only in CCD</span>
        </div>
      </div>
      {loading ? (
        <p style={{ color: 'var(--color-text-dim)' }}>Loading fragments...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--color-text-dim)' }}>No fragments match your criteria.</p>
      ) : (
        <div className="molecule-grid">
          {filtered.map((fragment) => (
            <FragmentCard
              key={fragment.id}
              fragment={fragment}
              rdkit={rdkit}
              onAddToLibrary={handleAddToLibrary}
              onShowDetails={handleShowDetails}
              getMolecule={getMolecule}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
