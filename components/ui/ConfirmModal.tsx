import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  }, [onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex gap-3">
          {isDangerous && (
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold mb-2">{title}</h2>
            <p className="text-sm text-muted-foreground mb-6">{message}</p>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className={isDangerous ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {isProcessing ? 'Procesando...' : confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
