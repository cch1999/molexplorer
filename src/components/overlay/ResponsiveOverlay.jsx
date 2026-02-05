import { Modal } from './Modal';
import { BottomSheet } from './BottomSheet';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const isTouchDevice = '(hover: none) and (pointer: coarse)';

export function ResponsiveOverlay({ isOpen, onClose, title, children, maxWidth }) {
  const isMobile = useMediaQuery(isTouchDevice);

  if (isMobile) {
    return (
      <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
        {children}
      </BottomSheet>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
      {children}
    </Modal>
  );
}
