import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { animated, useSpring } from '@react-spring/web';

export function Modal({ isOpen, onClose, title, children, maxWidth }) {
  const backdropSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    config: { duration: 150 },
  });

  const contentSpring = useSpring({
    opacity: isOpen ? 1 : 0,
    scale: isOpen ? 1 : 0.95,
    config: { tension: 300, friction: 25 },
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <animated.div
      className="overlay-backdrop"
      style={{ ...backdropSpring, pointerEvents: isOpen ? 'auto' : 'none' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <animated.div
        className="overlay-content"
        style={{
          opacity: contentSpring.opacity,
          transform: contentSpring.scale.to((s) => `translate(-50%, -50%) scale(${s})`),
          maxWidth: maxWidth || undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className="panel-header" style={{ marginBottom: 'var(--space-3)' }}>
            {title && (
              <h3 id="modal-title">{title}</h3>
            )}
            {onClose && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={onClose}
                aria-label="Close"
              >
                &times;
              </button>
            )}
          </div>
        )}
        {children}
      </animated.div>
    </animated.div>
  );

  return createPortal(content, document.body);
}
