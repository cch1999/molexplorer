export function Header() {
  return (
    <header className="app-header" role="banner">
      <div>
        <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', margin: 0 }}>
          Ligand Surfer
        </h1>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', margin: '2px 0 0' }}>
          Interactive exploration of ligands, fragments, and proteins
        </p>
      </div>
      <p className="author" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
        By Charlie Harris
      </p>
    </header>
  );
}
