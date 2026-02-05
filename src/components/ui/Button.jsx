export function Button({
  children,
  variant = 'default',
  size = 'default',
  type = 'button',
  className = '',
  disabled,
  ...props
}) {
  const classes = [
    'btn',
    variant === 'primary' && 'btn-primary',
    variant === 'ghost' && 'btn-ghost',
    size === 'sm' && 'btn-sm',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type={type}
      className={`${classes} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
