import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from '../Icons';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastItem = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 4500;
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, [dismissToast]);

  const success = useCallback((message: string, title?: string) => {
    showToast({ type: 'success', message, title });
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast({ type: 'error', message, title, duration: 6000 });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast({ type: 'warning', message, title });
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast({ type: 'info', message, title });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, dismissToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          maxWidth: '420px',
          width: 'calc(100vw - 3rem)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => {
          const config = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className="toast-enter"
              style={{
                pointerEvents: 'auto',
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: `1.5px solid ${config.borderColor}`,
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                padding: '1rem 1.15rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                borderLeft: `5px solid ${config.accentColor}`,
                transition: 'all 0.2s ease'
              }}
              role="alert"
            >
              <div style={{ color: config.accentColor, flexShrink: 0, marginTop: '1px' }}>
                {config.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      marginBottom: '0.15rem'
                    }}
                  >
                    {toast.title}
                  </div>
                )}
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: '#334155',
                    lineHeight: 1.45,
                    wordBreak: 'break-word'
                  }}
                >
                  {toast.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Close notification"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                className="interactive-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
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

function getToastStyles(type: ToastType) {
  switch (type) {
    case 'success':
      return {
        accentColor: '#16a34a',
        borderColor: '#bbf7d0',
        icon: <CheckCircle2 className="w-5 h-5" />
      };
    case 'error':
      return {
        accentColor: '#dc2626',
        borderColor: '#fecaca',
        icon: <XCircle className="w-5 h-5" />
      };
    case 'warning':
      return {
        accentColor: '#d97706',
        borderColor: '#fde68a',
        icon: <AlertCircle className="w-5 h-5" />
      };
    case 'info':
    default:
      return {
        accentColor: '#2563eb',
        borderColor: '#bfdbfe',
        icon: <Info className="w-5 h-5" />
      };
  }
}
