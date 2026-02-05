import { useState, useEffect } from 'react';
import { useMoleculeStore } from '../../stores/useMoleculeStore';
import { useMoleculeLoader } from '../../hooks/useMoleculeLoader';
import { MoleculeCard } from './MoleculeCard';

export function MoleculeGrid({ onShowDetails, onCompare }) {
  const molecules = useMoleculeStore((s) => s.molecules);
  const removeMolecule = useMoleculeStore((s) => s.removeMolecule);
  const reorderMolecules = useMoleculeStore((s) => s.reorderMolecules);
  useMoleculeLoader();

  // Debug: log molecules on mount/update
  useEffect(() => {
    console.log('[MoleculeGrid] Molecules:', molecules.length, molecules.map(m => `${m.code}(${m.status})`).join(', '));
  }, [molecules]);

  const [draggedId, setDraggedId] = useState(null);

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetId) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;
    const fromIndex = molecules.findIndex((m) => m.id === sourceId);
    const toIndex = molecules.findIndex((m) => m.id === targetId);
    if (fromIndex !== -1 && toIndex !== -1) {
      reorderMolecules(fromIndex, toIndex);
    }
    setDraggedId(null);
  };

  return (
    <div className="molecule-grid">
      {molecules.map((molecule) => (
        <MoleculeCard
          key={molecule.id}
          molecule={molecule}
          onDelete={removeMolecule}
          onShowDetails={onShowDetails}
          onCompare={onCompare}
          onDragStart={(e) => handleDragStart(e, molecule.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, molecule.id)}
          onDragEnd={handleDragEnd}
          isDragging={draggedId === molecule.id}
        />
      ))}
    </div>
  );
}
