import { useEffect, useRef } from 'react';
import ApiService from '../utils/apiService';
import { useMoleculeStore } from '../stores/useMoleculeStore';

async function findMoleculeInLocalTsv(code) {
  try {
    const tsvContent = await ApiService.getFragmentLibraryTsv();
    const lines = tsvContent.split('\n');
    for (const line of lines) {
      const columns = line.split('\t');
      if (columns.length > 8 && columns[8] === code) {
        return columns[3];
      }
    }
    return null;
  } catch (e) {
    console.error('Error searching fragment library TSV:', e);
    return null;
  }
}

export function useMoleculeLoader() {
  const updateMoleculeStatus = useMoleculeStore((s) => s.updateMoleculeStatus);
  const updateMolecule = useMoleculeStore((s) => s.updateMolecule);
  
  // Track which molecules we've processed (persists across renders)
  const processedRef = useRef(new Set());
  const initRef = useRef(false);

  useEffect(() => {
    // Only run initial load once
    if (initRef.current) return;
    initRef.current = true;

    const molecules = useMoleculeStore.getState().molecules;
    const pending = molecules.filter((m) => m.status === 'pending');
    const toLoad = pending.filter((m) => !processedRef.current.has(m.id));
    
    if (toLoad.length === 0) return;

    console.log('[MoleculeLoader] Initial load for', toLoad.length, 'molecules:', toLoad.map(m => m.code).join(', '));

    async function loadMolecule(molecule) {
      const { code, pdbId, chainId, authorResidueNumber } = molecule;
      
      // Skip if already processed
      if (processedRef.current.has(molecule.id)) {
        return;
      }
      processedRef.current.add(molecule.id);
      
      const hasInstanceDetails = pdbId && chainId && authorResidueNumber;

      console.log('[MoleculeLoader] Loading', code, hasInstanceDetails ? '(PDB instance)' : '(CCD)');
      updateMoleculeStatus(code, 'loading');

      try {
        if (!hasInstanceDetails) {
          const smilesData = await findMoleculeInLocalTsv(code);
          if (smilesData) {
            console.log('[MoleculeLoader] Found SMILES for', code);
            updateMoleculeStatus(code, 'loaded');
            updateMolecule(code, { smiles: smilesData });
            return;
          }
        }

        let sdfData;
        if (hasInstanceDetails) {
          console.log('[MoleculeLoader] Fetching instance SDF for', code, 'from', pdbId);
          sdfData = await ApiService.getInstanceSdf(pdbId, chainId, authorResidueNumber);
        } else {
          console.log('[MoleculeLoader] Fetching CCD SDF for', code);
          sdfData = await ApiService.getCcdSdf(code);
        }
        
        if (!sdfData || sdfData.trim() === '' || sdfData.toLowerCase().includes('<html')) {
          throw new Error('Received empty or invalid SDF data.');
        }

        console.log('[MoleculeLoader] Successfully loaded SDF for', code, '- length:', sdfData.length);
        updateMoleculeStatus(code, 'loaded');
        updateMolecule(code, { sdf: sdfData });
      } catch (error) {
        console.error('[MoleculeLoader] Error loading', code, ':', error.message);
        updateMoleculeStatus(code, 'error');
        updateMolecule(code, { errorMessage: error?.message || 'Failed to load' });
      }
    }

    // Load all pending molecules (don't await - let them load in parallel)
    toLoad.forEach((mol) => {
      loadMolecule(mol);
    });
  }, []); // Empty deps - only run once on mount

  // Handle new molecules being added later
  const molecules = useMoleculeStore((s) => s.molecules);
  const pendingCount = molecules.filter((m) => m.status === 'pending').length;
  const totalCount = molecules.length;
  
  useEffect(() => {
    if (!initRef.current) return; // Wait for initial load
    
    const pending = molecules.filter((m) => m.status === 'pending');
    const toLoad = pending.filter((m) => !processedRef.current.has(m.id));
    
    if (toLoad.length === 0) return;
    
    console.log('[MoleculeLoader] New molecules detected:', toLoad.map(m => m.code).join(', '));
    
    toLoad.forEach((mol) => {
      const { code, pdbId, chainId, authorResidueNumber } = mol;
      if (processedRef.current.has(mol.id)) return;
      processedRef.current.add(mol.id);
      
      const hasInstanceDetails = pdbId && chainId && authorResidueNumber;
      updateMoleculeStatus(code, 'loading');
      
      (async () => {
        try {
          if (!hasInstanceDetails) {
            const smilesData = await findMoleculeInLocalTsv(code);
            if (smilesData) {
              updateMoleculeStatus(code, 'loaded');
              updateMolecule(code, { smiles: smilesData });
              return;
            }
          }
          const sdfData = hasInstanceDetails
            ? await ApiService.getInstanceSdf(pdbId, chainId, authorResidueNumber)
            : await ApiService.getCcdSdf(code);
          if (!sdfData || sdfData.trim() === '' || sdfData.toLowerCase().includes('<html')) {
            throw new Error('Received empty or invalid SDF data.');
          }
          updateMoleculeStatus(code, 'loaded');
          updateMolecule(code, { sdf: sdfData });
        } catch (error) {
          updateMoleculeStatus(code, 'error');
          updateMolecule(code, { errorMessage: error?.message || 'Failed to load' });
        }
      })();
    });
  }, [totalCount, pendingCount, updateMoleculeStatus, updateMolecule]); // Re-run when molecule count changes
}
