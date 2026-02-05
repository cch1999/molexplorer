import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { animated, useSpring } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

const CLOSE_THRESHOLD = 80;

export function BottomSheet({ isOpen, onClose, title, children }) {
  const [{ y }, api] = useSpring(() => ({ y: 100 }));

  useEffect(() => {
    api.start({ y: isOpen ? 0 : 100 });
  }, [isOpen, api]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const bind = useDrag(
    ({ movement: [, my], velocity: [, vy], direction: [, dy], down }) => {
      if (!down) {
        const shouldClose = my > CLOSE_THRESHOLD || (dy > 0 && vy > 0.1);
        api.start({ y: shouldClose ? 100 : 0, config: { tension: 300, friction: 30 } });
        if (shouldClose) onClose();
      } else {
        const vh = Math.min(100, (my / 200) * 100);
        api.start({ y: vh, immediate: true });
      }
    },
    {
      axis: 'y',
      pointer: { touch: true },
      from: () => [0, y.get()],
      filterTaps: true,
    }
  );

  if (!isOpen) return null;

  const content = (
    <div
      className="bottom-sheet__backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'bottomsheet-title' : undefined}
    >
      <animated.div
        className="bottom-sheet__container"
        style={{
          transform: y.to((v) => `translateY(${v}vh)`),
          touchAction: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bottom-sheet__handle" {...bind()} aria-hidden />
        {(title || onClose) && (
          <div className="panel-header" style={{ padding: '0 var(--space-4) var(--space-3)' }}>
            {title && <h3 id="bottomsheet-title">{title}</h3>}
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
        <div style={{ padding: '0 var(--space-4) var(--space-6)', maxHeight: '85vh', overflow: 'auto' }}>
          {children}
        </div>
      </animated.div>
    </div>
  );

  return createPortal(content, document.body);
}
