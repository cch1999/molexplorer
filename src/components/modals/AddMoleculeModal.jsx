import { useState } from 'react';
import { ResponsiveOverlay } from '../overlay';
import { Button } from '../ui';
import { useAppStore } from '../../stores/useAppStore';
import { useMoleculeStore } from '../../stores/useMoleculeStore';
import { useToast } from '../../contexts/ToastContext';

const LUCKY_CODES = ['ATP', 'NAG', 'FAD', 'HEM', 'NAD', 'ADP', 'SAM', 'FMN', 'GDP', 'GTP'];

export function AddMoleculeModal() {
  const isOpen = useAppStore((s) => s.isOverlayOpen('add-molecule'));
  const closeOverlay = useAppStore((s) => s.closeOverlay);
  const addMolecule = useMoleculeStore((s) => s.addMolecule);
  const getMolecule = useMoleculeStore((s) => s.getMolecule);
  const { toast } = useToast();

  const [code, setCode] = useState('');
  const [pdbId, setPdbId] = useState('');
  const [authorResidueNumber, setAuthorResidueNumber] = useState('');
  const [chainId, setChainId] = useState('');
  const [codeError, setCodeError] = useState('');
  const [instanceError, setInstanceError] = useState('');

  const isValidCode = /^[A-Z0-9]{3}$/.test(code);
  const hasInstance = pdbId.trim() || authorResidueNumber.trim() || chainId.trim();
  const validInstance = pdbId.trim() && authorResidueNumber.trim() && chainId.trim();
  const canSubmit = isValidCode && (!hasInstance || validInstance);

  const close = () => {
    setCode('');
    setPdbId('');
    setAuthorResidueNumber('');
    setChainId('');
    setCodeError('');
    setInstanceError('');
    closeOverlay('add-molecule');
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().slice(0, 3);
    setCode(value);
    setCodeError(value ? (/^[A-Z0-9]{3}$/.test(value) ? '' : 'Code must be 3 alphanumeric characters.') : '');
  };

  const handleLucky = () => {
    let attempts = 0;
    let chosen;
    do {
      chosen = LUCKY_CODES[Math.floor(Math.random() * LUCKY_CODES.length)];
      attempts++;
    } while (getMolecule(chosen) && attempts < 10);
    const success = addMolecule(chosen);
    if (success) toast(`Adding molecule ${chosen}...`, 'success');
    else toast(`Molecule ${chosen} already exists`, 'info');
    close();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setInstanceError('');
    const codeVal = code.toUpperCase();
    const pdbVal = pdbId.trim().toUpperCase();
    const chainVal = chainId.trim().toUpperCase();
    const resVal = authorResidueNumber.trim();

    if (hasInstance) {
      if (!validInstance) {
        setInstanceError('PDB ID, residue number and chain are required.');
        return;
      }
      const success = addMolecule({
        code: codeVal,
        pdbId: pdbVal,
        chainId: chainVal,
        authorResidueNumber: resVal,
      });
      if (success) toast(`Adding ligand ${codeVal} from ${pdbVal}...`, 'success');
      else toast(`Ligand ${codeVal} instance already exists`, 'info');
    } else {
      const success = addMolecule(codeVal);
      if (success) toast(`Adding molecule ${codeVal}...`, 'success');
      else toast(`Molecule ${codeVal} already exists`, 'info');
    }
    close();
  };

  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={close}
      title="Add New Molecule"
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <label htmlFor="molecule-code" style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>CCD Code:</label>
          <input
            id="molecule-code"
            type="text"
            className="input"
            placeholder="e.g. ATP"
            maxLength={3}
            value={code}
            onChange={handleCodeChange}
          />
          <p className="help-text" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Enter a Chemical Component Dictionary (CCD) code</p>
          {codeError && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 'var(--space-1)' }}>{codeError}</p>}
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontSize: 'var(--text-sm)' }}>PDB Instance:</label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input"
              placeholder="PDB ID"
              maxLength={4}
              value={pdbId}
              onChange={(e) => { setPdbId(e.target.value); setInstanceError(''); }}
            />
            <input
              type="text"
              className="input"
              placeholder="Residue #"
              value={authorResidueNumber}
              onChange={(e) => { setAuthorResidueNumber(e.target.value); setInstanceError(''); }}
            />
            <input
              type="text"
              className="input"
              placeholder="Chain"
              maxLength={2}
              value={chainId}
              onChange={(e) => { setChainId(e.target.value); setInstanceError(''); }}
            />
          </div>
          <p className="help-text" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>Optional: specify PDB ID, residue number and chain to add a bound ligand</p>
          {instanceError && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 'var(--space-1)' }}>{instanceError}</p>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button type="button" variant="ghost" onClick={handleLucky}>I'm Feeling Lucky</Button>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button type="button" variant="ghost" onClick={close}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={!canSubmit}>Add Molecule</Button>
          </div>
        </div>
      </form>
    </ResponsiveOverlay>
  );
}
