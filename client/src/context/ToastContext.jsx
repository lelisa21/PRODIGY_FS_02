import  { createContext, useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/common/Toast';
import { useContext } from 'react';

export const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const error = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const warning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const info = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  const value = useMemo(() => ({
    showToast: addToast,
    success,
    error,
    warning,
    info,
    removeToast,
  }), [addToast, success, error, warning, info, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
