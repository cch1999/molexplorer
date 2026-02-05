import { useRef, useEffect } from 'react';
import ApiService from '../../utils/apiService';

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7Z" />
  </svg>
);

export function MoleculeCard({
  molecule,
  onDelete,
  onShowDetails,
  onCompare,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}) {
  const viewerRef = useRef(null);
  const { id, code, status, sdf, smiles } = molecule;

  useEffect(() => {
    if (status !== 'loaded' || !sdf || !viewerRef.current || typeof window === 'undefined' || !window.$3Dmol) return;
    const container = viewerRef.current;
    try {
      const viewer = window.$3Dmol.createViewer(container, { backgroundColor: '0x1a1a1f' });
      viewer.addModel(sdf, 'sdf');
      viewer.setStyle({}, { stick: {} });
      viewer.setStyle({ elem: 'H' }, {});
      viewer.zoomTo();
      viewer.render();
      container.viewer = viewer;
      return () => {
        if (container.viewer) container.viewer = null;
      };
    } catch (e) {
      console.error('Error initializing 3Dmol viewer for', code, e);
    }
  }, [code, status, sdf]);

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      let data = sdf;
      if (!data) data = await ApiService.getCcdSdf(code);
      if (!data) throw new Error('No SDF data available');
      const blob = new Blob([data], { type: 'chemical/x-mdl-sdfile' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${code}.sdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download SDF for', code, err);
    }
  };

  if (status === 'pending' || status === 'loading') {
    return (
      <div className="molecule-card" data-molecule-id={id} data-molecule-code={code}>
        <div className="skeleton" style={{ height: 200, marginTop: 32 }} />
        <div className="skeleton" style={{ height: 16, width: '60%', marginTop: 8 }} />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="molecule-card" data-molecule-id={id} data-molecule-code={code}>
        <div className="drag-handle" draggable onDragStart={onDragStart} onDragEnd={onDragEnd}>⋯</div>
        <button type="button" className="delete-btn" onClick={() => onDelete(code)} title={`Delete ${code}`} aria-label={`Delete ${code}`}>
          <DeleteIcon />
        </button>
        <div className="not-found-content">
          <h3>{code}</h3>
          <p>{molecule.errorMessage || 'Not found'}</p>
        </div>
      </div>
    );
  }

  const showDetails = () => {
    if (onShowDetails) onShowDetails(code, sdf || smiles, sdf ? 'sdf' : 'smiles');
  };

  return (
    <div
      className={`molecule-card ${isDragging ? 'dragging' : ''}`}
      data-molecule-id={id}
      data-molecule-code={code}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className="drag-handle">⋯</div>
      <button type="button" className="delete-btn" onClick={(e) => { e.stopPropagation(); onDelete(code); }} title={`Delete ${code}`} aria-label={`Delete ${code}`}>
        <DeleteIcon />
      </button>
      <button type="button" className="download-btn" onClick={handleDownload} title={`Download ${code} as SDF`} aria-label={`Download ${code}`}>
        <DownloadIcon />
      </button>
      <button type="button" className="compare-btn" onClick={(e) => { e.stopPropagation(); onCompare && onCompare(code); }} title={`Compare ${code}`} aria-label={`Compare ${code}`}>
        ⇆
      </button>
      {smiles && !sdf ? (
        <>
          <div className="molecule-code">{code}</div>
          <div className="viewer-container molecule-viewer" ref={viewerRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background-alt)' }}>
            <div style={{ textAlign: 'center', padding: 10, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>SMILES</div>
          </div>
          <div className="smiles-label" style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: 5 }}>SMILES: {smiles}</div>
        </>
      ) : (
        <>
          <h3 className="molecule-code" onClick={showDetails} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && showDetails()}>{code}</h3>
          <div className="viewer-container" ref={viewerRef} />
        </>
      )}
    </div>
  );
}
