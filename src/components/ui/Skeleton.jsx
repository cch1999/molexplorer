export function Skeleton({ width, height, className = '' }) {
  const style = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;
  return <div className={`skeleton ${className}`.trim()} style={style} />;
}
