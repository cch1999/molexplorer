export function Panel({ title, headerAction, children, className = '' }) {
  return (
    <div className={`panel ${className}`.trim()}>
      {(title || headerAction) && (
        <div className="panel-header">
          {title && <h3>{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
