import { useRef, useEffect } from 'react';
import { Button } from '../ui';

function sanitizeSMILES(smiles) {
  if (!smiles) return '';
  return smiles.replace(/[^A-Za-z0-9()\[\].\-=#$:@/\\]/g, '');
}

export function FragmentCard({ fragment, rdkit, onAddToLibrary, onShowDetails, getMolecule }) {
  const canvasRef = useRef(null);
  const { name, kind, query, source, ccd, in_ccd } = fragment;

  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    if (kind !== 'SMILES' && kind !== 'SMARTS') {
      container.innerHTML = `<p class="render-error">Cannot render type: ${kind || 'N/A'}</p>`;
      return;
    }
    if (!query) return;
    if (!rdkit) {
      container.innerHTML = '<p class="render-error">RDKit not available</p>';
      return;
    }
    try {
      const sanitized = sanitizeSMILES(query);
      const mol = rdkit.get_mol(sanitized);
      const svg = mol.get_svg(200, 150);
      mol.delete();
      container.innerHTML = svg;
    } catch (err) {
      console.error('Error rendering SMILES for', name, err);
      container.innerHTML = `<p class="render-error">Render error for query: ${query}</p>`;
    }
  }, [fragment.id, name, kind, query, rdkit]);

  const ccdCode = in_ccd && ccd ? ccd.split(',')[0].trim() : null;
  const alreadyInLibrary = ccdCode && getMolecule(ccdCode);

  return (
    <div className="molecule-card fragment-card">
      <h3>{name}</h3>
      <div className="viewer-container" ref={canvasRef} />
      <div className="fragment-info">
        <p><strong>Source:</strong> {source}</p>
        <p>
          <strong>In CCD:</strong>{' '}
          {in_ccd && ccdCode ? (
            <>Yes (<a
              href="#"
              className="ccd-link"
              onClick={(e) => {
                e.preventDefault();
                onShowDetails(ccdCode);
              }}
            >
              {ccdCode}
            </a>)</>
          ) : (
            'No'
          )}
        </p>
        <p><strong>Type:</strong> {kind}</p>
      </div>
      {in_ccd && ccdCode && (
        <Button
          variant="primary"
          size="sm"
          disabled={!!alreadyInLibrary}
          onClick={() => onAddToLibrary(ccdCode)}
          style={{ width: '100%', marginTop: 'var(--space-2)' }}
        >
          {alreadyInLibrary ? 'In library' : 'Add to library'}
        </Button>
      )}
    </div>
  );
}
