'use client';
import { useState, useCallback } from 'react';
import { X, Check, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

// Context
import { createContext, useContext } from 'react';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false);
  const duration = toast.duration || 4000;

  const getProgressColor = () => {
    switch (toast.type) {
      case 'success': return 'bg-income';
      case 'error': return 'bg-debt';
      case 'warning': return 'bg-expense';
      case 'info':
      default: return 'bg-primary';
    }
  };

  const getStyles = () => {
    const baseStyles = 'flex flex-col rounded-lg border animate-in slide-in-from-right-5 duration-200 bg-card overflow-hidden';

    switch (toast.type) {
      case 'success':
        return `${baseStyles} border-income/30 text-income`;
      case 'error':
        return `${baseStyles} border-debt/30 text-debt`;
      case 'warning':
        return `${baseStyles} border-expense/30 text-expense`;
      case 'info':
      default:
        return `${baseStyles} border-primary/30 text-primary`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <Check size={20} className="text-income flex-shrink-0" />;
      case 'error':
        return <AlertCircle size={20} className="text-debt flex-shrink-0" />;
      case 'warning':
        return <AlertCircle size={20} className="text-expense flex-shrink-0" />;
      case 'info':
      default:
        return <Info size={20} className="text-primary flex-shrink-0" />;
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 150);
  };

  return (
    <div
      className={`${getStyles()} ${isClosing ? 'animate-out slide-out-to-right-5 duration-150' : ''}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {getIcon()}
        <p className="flex-1 text-sm font-medium text-foreground">{toast.message}</p>
        <button
          aria-label="Cerrar notificación"
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground transition-opacity flex-shrink-0"
          type="button"
        >
          <X size={18} />
        </button>
      </div>
      {duration > 0 && (
        <div className="h-0.5 w-full bg-muted/30">
          <div
            className={`h-full ${getProgressColor()} origin-left`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}
