'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface MonthCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  monthLabel: string;
  incomes: number;
  expenses: number;
  minimums: number;
  availableFlow: number;
  activeDebts: number;
  alreadyClosed: boolean;
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-MX', { maximumFractionDigits: 0 });
}

export function MonthCloseDialog({
  open,
  onOpenChange,
  onConfirm,
  monthLabel,
  incomes,
  expenses,
  minimums,
  availableFlow,
  activeDebts,
  alreadyClosed,
}: MonthCloseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cerrar {monthLabel}</DialogTitle>
          <DialogDescription>
            Se guardara una fotografia del mes para comparar avances y evitar cambios accidentales de periodo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md border bg-muted/40 p-2.5">
            <p className="text-[11px] text-muted-foreground">Ingresos</p>
            <p className="font-mono font-semibold text-income">${formatCurrency(incomes)}</p>
          </div>
          <div className="rounded-md border bg-muted/40 p-2.5">
            <p className="text-[11px] text-muted-foreground">Gastos</p>
            <p className="font-mono font-semibold text-expense">${formatCurrency(expenses)}</p>
          </div>
          <div className="rounded-md border bg-muted/40 p-2.5">
            <p className="text-[11px] text-muted-foreground">Minimos deuda</p>
            <p className="font-mono font-semibold text-debt">${formatCurrency(minimums)}</p>
          </div>
          <div className="rounded-md border bg-muted/40 p-2.5">
            <p className="text-[11px] text-muted-foreground">Flujo disponible</p>
            <p className={`font-mono font-semibold ${availableFlow >= 0 ? 'text-income' : 'text-expense'}`}>
              {availableFlow >= 0 ? '+' : '-'}${formatCurrency(Math.abs(availableFlow))}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Deudas activas en este cierre: <span className="font-medium text-foreground">{activeDebts}</span>
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={alreadyClosed}>
            {alreadyClosed ? 'Mes ya cerrado' : 'Confirmar cierre'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
