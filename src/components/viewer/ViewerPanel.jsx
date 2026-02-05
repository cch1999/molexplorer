import { useRef, useEffect, useState, useCallback } from 'react';
import ApiService from '../../utils/apiService';
import { Panel, Button } from '../ui';
import { useToast } from '../../contexts/ToastContext';

const ION_RESIDUES = ['NA', 'CL', 'MG', 'K', 'CA', 'ZN', 'MN', 'FE', 'CU', 'NI', 'CO', 'CD', 'SR', 'CS'];
const SOLVENT_RESIDUES = ['HOH', 'WAT', 'DOD'];

function applyStylesToViewer(viewer, opts) {
  if (!viewer || typeof window === 'undefined' || !window.$3Dmol) return;
  const {
    showCartoon,
    showSticks,
    showSurface,
    surfaceOpacity,
    colorScheme,
    hideSolvent,
    hideIons,
  } = opts;

  viewer.setStyle({}, {});
  viewer.removeAllSurfaces?.();

  const polymerSel = { hetflag: false };
  const hetSel = { hetflag: true };
  const notList = [];
  if (hideSolvent) notList.push(...SOLVENT_RESIDUES);
  if (hideIons) notList.push(...ION_RESIDUES);
  const hetSelection = notList.length ? { ...hetSel, not: { resn: notList } } : hetSel;

  const scheme = colorScheme || 'chain';
  if (showCartoon) {
    const cartoonScheme = scheme === 'spectrum' ? 'spectrum' : 'chain';
    viewer.setStyle(polymerSel, { cartoon: { colorscheme: cartoonScheme } });
  }
  if (showSticks) {
    viewer.setStyle(hetSelection, { stick: { radius: 0.25, colorscheme: 'element' } });
  }
  if (showSurface) {
    const opacity = Number(surfaceOpacity) || 0.5;
    viewer.addSurface(window.$3Dmol.SurfaceType.MS, { opacity, color: 'white' }, polymerSel);
  }
  viewer.render();
}

export function ViewerPanel() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const { toast } = useToast();

  const [pdbId, setPdbId] = useState('');
  const [colorScheme, setColorScheme] = useState('chain');
  const [hideSolvent, setHideSolvent] = useState(true);
  const [hideIons, setHideIons] = useState(true);
  const [spin, setSpin] = useState(false);
  const [showCartoon, setShowCartoon] = useState(true);
  const [showSticks, setShowSticks] = useState(true);
  const [showSurface, setShowSurface] = useState(false);
  const [surfaceOpacity, setSurfaceOpacity] = useState(0.5);
  const [currentPdbId, setCurrentPdbId] = useState(null);

  const styleOpts = {
    showCartoon,
    showSticks,
    showSurface,
    surfaceOpacity,
    colorScheme,
    hideSolvent,
    hideIons,
  };

  const resizeViewer = useCallback(() => {
    if (!containerRef.current) return;
    try {
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 20;
      let available = window.innerHeight - rect.top - padding;
      if (available < 200) available = 200;
      containerRef.current.style.height = `${Math.floor(available)}px`;
      if (viewerRef.current?.resize) {
        viewerRef.current.resize();
        viewerRef.current.render();
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(resizeViewer);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [resizeViewer]);

  useEffect(() => {
    if (viewerRef.current && currentPdbId) {
      applyStylesToViewer(viewerRef.current, styleOpts);
    }
  }, [currentPdbId, styleOpts.showCartoon, styleOpts.showSticks, styleOpts.showSurface, styleOpts.surfaceOpacity, styleOpts.colorScheme, styleOpts.hideSolvent, styleOpts.hideIons]);

  useEffect(() => {
    if (!viewerRef.current) return;
    if (spin) viewerRef.current.spin('y');
    else viewerRef.current.spin(false);
  }, [spin, currentPdbId]);

  const loadPdb = async () => {
    const id = pdbId.trim().toUpperCase();
    if (!id) {
      toast('Enter a PDB ID to load', 'info');
      return;
    }
    try {
      if (!containerRef.current || !window.$3Dmol) return;
      if (!viewerRef.current) {
        viewerRef.current = window.$3Dmol.createViewer(containerRef.current, {
          backgroundColor: '0x1a1a1f',
          width: '100%',
          height: '100%',
        });
        containerRef.current.viewer = viewerRef.current;
      }
      resizeViewer();
      const pdb = await ApiService.getPdbFile(id);
      viewerRef.current.clear();
      viewerRef.current.addModel(pdb, 'pdb');
      setCurrentPdbId(id);
      applyStylesToViewer(viewerRef.current, styleOpts);
      viewerRef.current.zoomTo();
      viewerRef.current.render();
      toast(`Loaded ${id}`, 'success');
    } catch (e) {
      console.error('Failed to load PDB', e);
      toast('Failed to load PDB', 'error');
    }
  };

  const zoomLigands = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo({ hetflag: true });
      viewerRef.current.render();
    }
  };

  const resetView = () => {
    if (viewerRef.current) {
      viewerRef.current.zoomTo();
      viewerRef.current.render();
    }
  };

  return (
    <Panel title="3D Viewer">
      <div className="protein-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <input
          type="text"
          className="input"
          placeholder="Enter PDB ID (e.g., 1CBS)"
          value={pdbId}
          onChange={(e) => setPdbId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadPdb()}
          style={{ width: 140 }}
        />
        <Button variant="primary" onClick={loadPdb}>Load</Button>
        <select
          className="select"
          title="Color scheme"
          value={colorScheme}
          onChange={(e) => setColorScheme(e.target.value)}
        >
          <option value="chain">Color: Chain</option>
          <option value="spectrum">Color: Spectrum</option>
          <option value="element">Color: Element</option>
        </select>
        <div className="toggle-switch">
          <input id="viewer-hide-solvent" type="checkbox" className="toggle-switch-checkbox" checked={hideSolvent} onChange={(e) => setHideSolvent(e.target.checked)} />
          <label className="toggle-switch-label" htmlFor="viewer-hide-solvent" />
          <span>Hide Solvent</span>
        </div>
        <div className="toggle-switch">
          <input id="viewer-hide-ions" type="checkbox" className="toggle-switch-checkbox" checked={hideIons} onChange={(e) => setHideIons(e.target.checked)} />
          <label className="toggle-switch-label" htmlFor="viewer-hide-ions" />
          <span>Hide Ions</span>
        </div>
        <div className="toggle-switch">
          <input id="viewer-spin" type="checkbox" className="toggle-switch-checkbox" checked={spin} onChange={(e) => setSpin(e.target.checked)} />
          <label className="toggle-switch-label" htmlFor="viewer-spin" />
          <span>Spin</span>
        </div>
      </div>
      <div className="protein-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div className="toggle-switch">
          <input id="viewer-cartoon" type="checkbox" className="toggle-switch-checkbox" checked={showCartoon} onChange={(e) => setShowCartoon(e.target.checked)} />
          <label className="toggle-switch-label" htmlFor="viewer-cartoon" />
          <span>Cartoon</span>
        </div>
        <div className="toggle-switch">
          <input id="viewer-sticks" type="checkbox" className="toggle-switch-checkbox" checked={showSticks} onChange={(e) => setShowSticks(e.target.checked)} />
          <label className="toggle-switch-label" htmlFor="viewer-sticks" />
          <span>Ligand Sticks</span>
        </div>
        <div className="toggle-switch">
          <input id="viewer-surface" type="checkbox" className="toggle-switch-checkbox" checked={showSurface} onChange={(e) => setShowSurface(e.target.checked)} />
          <label className="toggle-switch-label" htmlFor="viewer-surface" />
          <span>Surface</span>
        </div>
        <label htmlFor="viewer-surface-opacity" style={{ fontSize: 'var(--text-sm)' }}>Surface opacity</label>
        <input
          id="viewer-surface-opacity"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={surfaceOpacity}
          onChange={(e) => setSurfaceOpacity(parseFloat(e.target.value))}
        />
        <Button onClick={zoomLigands}>Zoom Ligands</Button>
        <Button onClick={resetView}>Reset View</Button>
      </div>
      <div
        ref={containerRef}
        className="details-viewer"
        style={{ width: '100%', minHeight: 300, background: 'var(--color-background-alt)', borderRadius: 'var(--radius-md)' }}
      >
        {!currentPdbId && <p style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Load a PDB to begin...</p>}
      </div>
    </Panel>
  );
}
