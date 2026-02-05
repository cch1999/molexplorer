import { useEffect, useRef, useState } from 'react';
import ApiService from '../../utils/apiService';
import PropertyCalculator from '../../utils/propertyCalculator';
import { ResponsiveOverlay } from '../overlay';
import { useAppStore } from '../../stores/useAppStore';
import { useMoleculeStore } from '../../stores/useMoleculeStore';

const AMINO_ACIDS = new Set(['ALA','ARG','ASN','ASP','CYS','GLN','GLU','GLY','HIS','ILE','LEU','LYS','MET','PHE','PRO','SER','THR','TRP','TYR','VAL']);

export function LigandDetailsModal() {
  const isOpen = useAppStore((s) => s.isOverlayOpen('ligand-details'));
  const currentItem = useAppStore((s) => s.currentItem);
  const closeOverlay = useAppStore((s) => s.closeOverlay);
  const getMolecule = useMoleculeStore((s) => s.getMolecule);

  const viewerRef = useRef(null);
  const [properties, setProperties] = useState(null);
  const [loadingProps, setLoadingProps] = useState(false);

  const code = currentItem?.code;
  const molecule = code ? getMolecule(code) : null;
  const sdfData = currentItem?.sdfData ?? molecule?.sdf;
  const isInstance = molecule?.pdbId && molecule?.chainId && molecule?.authorResidueNumber;
  const isAminoAcid = code ? AMINO_ACIDS.has(code) : false;

  useEffect(() => {
    if (!isOpen || !code) return;
    setLoadingProps(true);
    setProperties(null);
    Promise.all([
      PropertyCalculator.getProperties(code).catch(() => null),
      ApiService.getPubChemMetadata(code).catch(() => null),
    ])
      .then(([calcProps, meta]) => {
        if (!calcProps && !meta) {
          setProperties('Properties unavailable');
          return;
        }
        const weight = meta?.properties?.MolecularWeight ?? calcProps?.molecularWeight;
        const formula = meta?.properties?.MolecularFormula ?? calcProps?.formula;
        const lines = [];
        if (weight != null || formula) {
          lines.push(`Molecular Weight: ${weight ?? 'N/A'}`);
          lines.push(`Formula: ${formula ?? 'N/A'}`);
        }
        if (calcProps?.atomCount != null) lines.push(`Atom Count: ${calcProps.atomCount}`);
        if (calcProps?.heavyAtomCount != null) lines.push(`Heavy Atom Count: ${calcProps.heavyAtomCount}`);
        if (calcProps?.aromaticBondCount != null) lines.push(`Aromatic Bond Count: ${calcProps.aromaticBondCount}`);
        if (meta?.properties?.IUPACName) lines.push(`IUPAC Name: ${meta.properties.IUPACName}`);
        if (meta?.synonyms?.length) lines.push(`Synonyms: ${meta.synonyms.slice(0, 5).join(', ')}`);
        setProperties(lines.length ? lines : 'Properties unavailable');
      })
      .catch(() => setProperties('Properties unavailable'))
      .finally(() => setLoadingProps(false));
  }, [isOpen, code]);

  useEffect(() => {
    if (!isOpen || !viewerRef.current || !code) return;
    const container = viewerRef.current;
    if (isInstance && molecule) {
      ApiService.getPdbFile(molecule.pdbId)
        .then((pdbData) => {
          if (!container) return;
          try {
            const viewer = window.$3Dmol?.createViewer(container, { backgroundColor: '0x1a1a1f', width: '100%', height: '100%' });
            container.viewer = viewer;
            viewer.addModel(pdbData, 'pdb');
            viewer.setStyle({}, { cartoon: { color: 'lightgrey' } });
            const ligandSel = { chain: molecule.chainId, resi: parseInt(molecule.authorResidueNumber, 10) };
            const pocketSel = { within: { distance: 5, sel: ligandSel } };
            viewer.setStyle(pocketSel, { stick: { radius: 0.15, colorscheme: 'element' } });
            viewer.setStyle(ligandSel, { stick: { radius: 0.2, colorscheme: 'element' }, sphere: { scale: 0.3, colorscheme: 'element' } });
            viewer.zoomTo(ligandSel);
            viewer.render();
          } catch (e) {
            console.error('Error initializing PDB viewer', e);
            container.innerHTML = '<p style="color:var(--color-text-muted)">Structure rendering error</p>';
          }
        })
        .catch(() => { if (container) container.innerHTML = '<p style="color:var(--color-text-muted)">Structure data not available</p>'; });
    } else if (sdfData && window.$3Dmol) {
      try {
        const viewer = window.$3Dmol.createViewer(container, { backgroundColor: '0x1a1a1f', width: '100%', height: '100%' });
        container.viewer = viewer;
        viewer.addModel(sdfData, 'sdf');
        viewer.setStyle({}, { stick: { radius: 0.2, colorscheme: 'element' }, sphere: { scale: 0.3, colorscheme: 'element' } });
        viewer.setStyle({ elem: 'H' }, {});
        viewer.zoomTo();
        viewer.render();
      } catch (e) {
        console.error('Error initializing details viewer', e);
        container.innerHTML = '<p style="color:var(--color-text-muted)">Structure rendering error</p>';
      }
    } else {
      container.innerHTML = '<p style="color:var(--color-text-muted)">Loading structure...</p>';
      if (!sdfData && code) {
        ApiService.getCcdSdf(code).then((sdf) => {
          if (!sdf || !container || !window.$3Dmol) return;
          try {
            container.innerHTML = '';
            const viewer = window.$3Dmol.createViewer(container, { backgroundColor: '0x1a1a1f', width: '100%', height: '100%' });
            viewer.addModel(sdf, 'sdf');
            viewer.setStyle({}, { stick: { radius: 0.2, colorscheme: 'element' } });
            viewer.setStyle({ elem: 'H' }, {});
            viewer.zoomTo();
            viewer.render();
          } catch (err) {
            container.innerHTML = '<p style="color:var(--color-text-muted)">Structure rendering error</p>';
          }
        }).catch(() => { if (container) container.innerHTML = '<p style="color:var(--color-text-muted)">Structure data not available</p>'; });
      }
    }
    return () => {
      if (container?.viewer) {
        try { container.viewer.clear(); } catch (_) {}
        container.viewer = null;
      }
      if (container) container.innerHTML = '';
    };
  }, [isOpen, code, sdfData, isInstance, molecule]);

  if (!code) return null;

  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={() => closeOverlay('ligand-details')}
      title={`Molecule Details: ${code}`}
      maxWidth="900px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div className="panel" style={{ padding: 'var(--space-3)' }}>
          <h4 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Basic Information</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>
            <div><strong>CCD Code:</strong> {code}</div>
            <div><strong>Source:</strong> {isAminoAcid ? 'building_blocks' : 'reagents'}</div>
            <div><strong>Type:</strong> {isAminoAcid ? 'building_block' : 'reagent'}</div>
            <div><strong>Structure:</strong> {isInstance ? 'PDB instance' : 'Ideal CCD SDF'}</div>
            {isInstance && molecule && (
              <>
                <div><strong>PDB ID:</strong> {molecule.pdbId}</div>
                <div><strong>Chain:</strong> {molecule.chainId}</div>
                <div><strong>Residue No.:</strong> {molecule.authorResidueNumber}</div>
              </>
            )}
          </div>
        </div>
        <div>
          <h4 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Interactive Molecular Structure</h4>
          <div ref={viewerRef} className="viewer-container" style={{ width: '100%', height: 300 }} />
        </div>
        <div>
          <h4 style={{ marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Molecular Properties</h4>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-dim)' }}>
            {loadingProps ? 'Loading properties...' : Array.isArray(properties) ? properties.map((line, i) => <div key={i}>{line}</div>) : properties}
          </div>
        </div>
      </div>
    </ResponsiveOverlay>
  );
}
