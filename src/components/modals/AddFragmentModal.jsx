import { useState } from 'react';
import { ResponsiveOverlay } from '../overlay';
import { Button } from '../ui';
import { useAppStore } from '../../stores/useAppStore';
import { useFragmentStore } from '../../stores/useFragmentStore';
import { useToast } from '../../contexts/ToastContext';

export function AddFragmentModal() {
  const isOpen = useAppStore((s) => s.isOverlayOpen('add-fragment'));
  const closeOverlay = useAppStore((s) => s.closeOverlay);
  const addCustomFragment = useFragmentStore((s) => s.addCustomFragment);
  const customFragments = useFragmentStore((s) => s.customFragments);
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('custom');
  const [description, setDescription] = useState('');

  const close = () => {
    setName('');
    setQuery('');
    setSource('custom');
    setDescription('');
    closeOverlay('add-fragment');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !query.trim()) {
      toast('Fragment name and SMILES/SMARTS query are required.', 'error');
      return;
    }
    const duplicate = customFragments.some(
      (f) => f.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      toast(`Fragment "${name}" already exists.`, 'error');
      return;
    }
    addCustomFragment({ name: name.trim(), query: query.trim(), source: source.trim() || 'custom', description: description.trim(), kind: 'SMILES' });
    toast(`Fragment "${name}" added successfully!`, 'success');
    close();
  };

  return (
    <ResponsiveOverlay isOpen={isOpen} onClose={close} title="Add New Fragment" maxWidth="480px">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <label htmlFor="fragment-name" style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>Fragment Name:</label>
          <input
            id="fragment-name"
            type="text"
            className="input"
            placeholder="e.g., My Custom Fragment"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="fragment-query" style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>SMILES/SMARTS:</label>
          <input
            id="fragment-query"
            type="text"
            className="input"
            placeholder="e.g., c1ccccc1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="fragment-source" style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>Source:</label>
          <input
            id="fragment-source"
            type="text"
            className="input"
            placeholder="e.g., My Library"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="fragment-description" style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>Description:</label>
          <textarea
            id="fragment-description"
            className="input"
            placeholder="Enter a short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
          <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
          <Button type="submit" variant="primary">Add Fragment</Button>
        </div>
      </form>
    </ResponsiveOverlay>
  );
}
