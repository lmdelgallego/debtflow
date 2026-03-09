'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Wallet, ArrowUp, ArrowDown, CreditCard, Layers } from 'lucide-react';

interface CashFlowCardProps {
  /** Ingresos del mes actual */
  monthlyIncomes: number;
  /** Gastos del mes actual */
  monthlyExpenses: number;
  /** Suma de pagos mínimos de deudas activas */
  monthlyDebtPayments: number;
  /** Nombre del mes actual, ej. "Marzo 2026" */
  monthLabel: string;
  index?: number;
}

function fmt(n: number) {
  return n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function CashFlowCard({
  monthlyIncomes,
  monthlyExpenses,
  monthlyDebtPayments,
  monthLabel,
  index = 0,
}: CashFlowCardProps) {
  const grossFlow = monthlyIncomes - monthlyExpenses;
  // Disponible real es el principal ahora
  const availableFlow = grossFlow - monthlyDebtPayments;
  
  const isAvailablePositive = availableFlow >= 0;
  const hasDebts = monthlyDebtPayments > 0;

  return (
    <Card
      className={cn(
        'border-t-2 card-hover animate-fade-in-up p-6 overflow-hidden relative',
        `stagger-${index + 1}`,
        isAvailablePositive ? 'border-t-[var(--primary)]' : 'border-t-[var(--expense)]',
      )}
    >
      {/* Subtle background glow */}
      <div
        className={cn(
          'absolute inset-0 opacity-[0.04] pointer-events-none',
          isAvailablePositive
            ? 'bg-gradient-to-br from-[var(--primary)] to-transparent'
            : 'bg-gradient-to-br from-[var(--expense)] to-transparent',
        )}
      />

      {/* Header row */}
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Flujo Disponible
            </p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {monthLabel}
            </span>
          </div>

          {/* Main value (Available Flow) */}
          <p
            className={cn(
              'text-4xl font-semibold font-mono animate-count-up',
              isAvailablePositive ? 'text-income' : 'text-expense',
            )}
          >
            {isAvailablePositive ? '+' : '-'}${fmt(Math.abs(availableFlow))}
          </p>

          {/* Trend label */}
          <p className="text-xs text-muted-foreground">
            Tu dinero real después de mínimos mensuales
          </p>
        </div>

        {/* Icon */}
        <div
          className={cn(
            'h-12 w-12 flex shrink-0 items-center justify-center rounded-lg',
            isAvailablePositive ? 'bg-primary/10 text-primary' : 'bg-expense/10 text-expense',
          )}
        >
          <Wallet size={22} />
        </div>
      </div>

      {/* Breakdown row */}
      <div className="mt-5 pt-4 border-t border-border/60 relative z-10">
        {/* Usamos grid-cols-2 o grid-cols-3 dependiendo de si hay deudas */}
        <div className={cn("grid gap-2 text-sm", hasDebts ? "grid-cols-3" : "grid-cols-2")}>
          
          {/* Incomes */}
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-income/10 shrink-0">
              <ArrowUp size={12} className="text-income" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Ingresos</p>
              <p className="font-mono font-semibold text-income text-[13px] truncate">
                ${fmt(monthlyIncomes)}
              </p>
            </div>
          </div>

          {/* Expenses */}
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-expense/10 shrink-0">
              <ArrowDown size={12} className="text-expense" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Gastos</p>
              <p className="font-mono font-semibold text-expense text-[13px] truncate">
                ${fmt(monthlyExpenses)}
              </p>
            </div>
          </div>

          {/* Debt payments (optional third column) */}
          {hasDebts && (
            <div className="flex items-center gap-2 border-l border-border/40 pl-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-debt/10 shrink-0">
                <CreditCard size={12} className="text-debt" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Mínimos</p>
                <p className="font-mono font-semibold text-debt text-[13px] truncate">
                  -${fmt(monthlyDebtPayments)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Optional: Show gross flow context if debts exist */}
        {hasDebts && (
          <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between gap-3 opacity-80">
            <div className="flex items-center gap-2 text-sm flex-1 min-w-0">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground shrink-0">
                <Layers size={10} />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground leading-none mb-0.5">Flujo Bruto (Sin deudas)</p>
                <p className={cn("font-mono font-medium text-xs truncate", grossFlow >= 0 ? 'text-income' : 'text-expense')}>
                  {grossFlow >= 0 ? '+' : '-'}${fmt(Math.abs(grossFlow))}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
