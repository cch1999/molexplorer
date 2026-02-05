import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;
const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, variant = 'info', duration = DEFAULT_DURATION) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, variant }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, options = {}) => {
      const { variant = 'info', duration = DEFAULT_DURATION } =
        typeof options === 'number' ? { duration: options } : options;
      return addToast(message, variant, duration);
    },
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(({ id, message, variant }) => (
        <div
          key={id}
          className={`toast-item toast-item--${variant}`}
          role="alert"
          aria-live="polite"
        >
          {message}
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: () => {},
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return ctx;
}
