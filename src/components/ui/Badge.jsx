export function Badge({ children, variant = 'default', className = '' }) {
  const variantClass =
    variant === 'warning'
      ? 'badge-warning'
      : variant === 'success'
        ? 'badge-success'
        : variant === 'error'
          ? 'badge-error'
          : '';
  return (
    <span className={`badge ${variantClass} ${className}`.trim()}>
      {children}
    </span>
  );
}
