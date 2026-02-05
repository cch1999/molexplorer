import { useState, useEffect } from 'react';

export function useRDKit() {
  const [rdkit, setRdkit] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.initRDKitModule) return;
    window
      .initRDKitModule()
      .then(setRdkit)
      .catch((e) => console.error('RDKit init failed:', e));
  }, []);

  return rdkit;
}
