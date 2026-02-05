import { useEffect, useRef } from 'react';
import { ResponsiveOverlay } from '../overlay';
import { useAppStore } from '../../stores/useAppStore';
import { useMoleculeStore } from '../../stores/useMoleculeStore';

function alignModels(model1, model2) {
  if (!model1?.selectedAtoms || !model2?.selectedAtoms) return;
  const atoms1 = model1.selectedAtoms({});
  const atoms2 = model2.selectedAtoms({});
  if (!atoms1.length || !atoms2.length) return;
  const center = (atoms) => {
    let cx = 0, cy = 0, cz = 0;
    for (const a of atoms) {
      cx += a.x;
      cy += a.y;
      cz += a.z;
    }
    return { x: cx / atoms.length, y: cy / atoms.length, z: cz / atoms.length };
  };
  const c1 = center(atoms1);
  const c2 = center(atoms2);
  const dx = c1.x - c2.x, dy = c1.y - c2.y, dz = c1.z - c2.z;
  for (const atom of atoms2) {
    atom.x += dx;
    atom.y += dy;
    atom.z += dz;
  }
}

export function ComparisonModal() {
  const isOpen = useAppStore((s) => s.isOverlayOpen('comparison'));
  const compareQueue = useAppStore((s) => s.compareQueue);
  const closeOverlay = useAppStore((s) => s.closeOverlay);
  const clearCompareQueue = useAppStore((s) => s.clearCompareQueue);
  const getMolecule = useMoleculeStore((s) => s.getMolecule);
  const viewerRef = useRef(null);

  const [codeA, codeB] = compareQueue;
  const molA = codeA ? getMolecule(codeA) : null;
  const molB = codeB ? getMolecule(codeB) : null;
  const canShow = isOpen && codeA && codeB && molA?.sdf && molB?.sdf;

  useEffect(() => {
    if (!canShow || !viewerRef.current || !window.$3Dmol) return;
    const container = viewerRef.current;
    try {
      const viewer = window.$3Dmol.createViewer(container, { backgroundColor: '0x1a1a1f', width: '100%', height: '100%' });
      container.viewer = viewer;
      const model1 = viewer.addModel(molA.sdf, 'sdf');
      const model2 = viewer.addModel(molB.sdf, 'sdf');
      model1.setStyle({}, { stick: { colorscheme: 'cyanCarbon' } });
      model2.setStyle({}, { stick: { colorscheme: 'magentaCarbon' } });
      alignModels(model1, model2);
      viewer.zoomTo();
      viewer.render();
    } catch (e) {
      console.error('Error rendering comparison viewer', e);
      container.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:20px">Render error</p>';
    }
    return () => {
      if (container?.viewer) {
        try { container.viewer.clear(); } catch (_) {}
        container.viewer = null;
      }
      if (container) container.innerHTML = '';
    };
  }, [canShow, molA?.sdf, molB?.sdf]);

  const handleClose = () => {
    clearCompareQueue();
    closeOverlay('comparison');
  };

  if (!codeA || !codeB) return null;

  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={handleClose}
      title={`${codeA} vs ${codeB}`}
      maxWidth="600px"
    >
      <div ref={viewerRef} style={{ width: '100%', height: 400, position: 'relative', background: 'var(--color-background-alt)', borderRadius: 'var(--radius-md)' }} />
      {(!molA?.sdf || !molB?.sdf) && (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>Both molecules must be loaded before comparison.</p>
      )}
    </ResponsiveOverlay>
  );
}
