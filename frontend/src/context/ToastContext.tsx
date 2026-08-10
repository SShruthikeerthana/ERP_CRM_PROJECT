import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  details?: any;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: ToastType, details?: any) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string, details?: any) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (title: string, message?: string, type: ToastType = 'info', details: any = null) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, title, message, type, details };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const showSuccess = (title: string, message?: string) => {
    showToast(title, message, 'success');
  };

  const showError = (title: string, message?: string, details: any = null) => {
    showToast(title, message, 'error', details);
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, showSuccess, showError, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
