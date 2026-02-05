import { AppShell } from './components/layout/AppShell';
import { Panel, Button } from './components/ui';
import { MoleculeGrid } from './components/molecules';
import { FragmentLibrary } from './components/fragments';
import { ViewerPanel } from './components/viewer/ViewerPanel';
import { ProteinBrowser } from './components/proteins/ProteinBrowser';
import { AddMoleculeModal } from './components/modals/AddMoleculeModal';
import { LigandDetailsModal } from './components/modals/LigandDetailsModal';
import { ComparisonModal } from './components/modals/ComparisonModal';
import { AddFragmentModal } from './components/modals/AddFragmentModal';
import { useAppStore } from './stores/useAppStore';
import { useMoleculeStore } from './stores/useMoleculeStore';
import { useToast } from './contexts/ToastContext';

function MoleculesPanel() {
  const deleteAllMolecules = useMoleculeStore((s) => s.deleteAllMolecules);
  const exportToSdf = useMoleculeStore((s) => s.exportToSdf);
  const openOverlay = useAppStore((s) => s.openOverlay);
  const { toast } = useToast();

  const handleDeleteAll = () => {
    if (typeof window !== 'undefined' && window.confirm('Delete all molecules?')) {
      deleteAllMolecules();
      toast('All molecules deleted.', 'info');
    }
  };

  const handleExport = () => {
    const sdf = exportToSdf({ removeHydrogens: false });
    if (!sdf) {
      toast('No molecules to export.', 'warning');
      return;
    }
    const blob = new Blob([sdf], { type: 'chemical/x-mdl-sdfile' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'molecules.sdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('Exported molecules to SDF.', 'success');
  };

  const setCurrentItem = useAppStore((s) => s.setCurrentItem);
  const addToCompareQueue = useAppStore((s) => s.addToCompareQueue);
  const clearCompareQueue = useAppStore((s) => s.clearCompareQueue);
  const getMolecule = useMoleculeStore((s) => s.getMolecule);

  const handleShowDetails = (code, sdfData) => {
    setCurrentItem({ code, sdfData });
    openOverlay('ligand-details');
  };

  const handleCompare = (code) => {
    addToCompareQueue(code);
    const q = useAppStore.getState().compareQueue;
    if (q.length === 2) {
      const [c1, c2] = q;
      const mol1 = getMolecule(c1);
      const mol2 = getMolecule(c2);
      if (mol1?.sdf && mol2?.sdf) {
        openOverlay('comparison');
      } else {
        toast('Both molecules must be loaded before comparison', 'error');
        clearCompareQueue();
      }
    } else {
      toast('Select another molecule to compare', 'info');
    }
  };

  return (
    <Panel
      title="Molecular Database"
      headerAction={
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button variant="primary" onClick={() => openOverlay('add-molecule')} title="Add new molecule">
            +
          </Button>
          <Button onClick={handleDeleteAll} title="Delete all molecules">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
          </Button>
          <Button onClick={handleExport} title="Export all molecules">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7Z" />
            </svg>
          </Button>
        </div>
      }
    >
      <MoleculeGrid onShowDetails={handleShowDetails} onCompare={handleCompare} />
    </Panel>
  );
}

function PlaceholderPanel({ title }) {
  return (
    <Panel title={title}>
      <p style={{ color: 'var(--color-text-dim)' }}>Loading...</p>
    </Panel>
  );
}

export default function App() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const theme = useAppStore((s) => s.theme);

  const children = {
    molecules: <MoleculesPanel />,
    fragments: <FragmentLibrary />,
    proteins: <ProteinBrowser />,
    viewer: <ViewerPanel />,
  };

  return (
    <div data-theme={theme}>
      <AppShell activeTab={activeTab} onTabChange={setActiveTab} children={children} />
      <AddMoleculeModal />
      <LigandDetailsModal />
      <ComparisonModal />
      <AddFragmentModal />
    </div>
  );
}
