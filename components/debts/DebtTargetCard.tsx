'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  TrendingDown,
  Layers,
  Target,
  AlertTriangle,
  XCircle,
  Flame,
  Snowflake,
} from 'lucide-react';
import type { Debt } from '@/lib/actions/debts.action';

// ─── Types ──────────────────────────────────────────────────────────────────

type PayoffMethod = 'avalanche' | 'snowball';

interface TargetResult {
  debt: Debt;
  rank: number;
  totalDebts: number;
  extraBudget: number;
  mode: 'NORMAL' | 'CRISIS' | 'NO_BUDGET';
}

// ─── Logic ──────────────────────────────────────────────────────────────────

function computeTarget(
  debts: Debt[],
  method: PayoffMethod,
  totalIncome: number,
  totalExpenses: number,
): TargetResult | null {
  const active = debts.filter((d) => d.balance > 0);
  if (active.length === 0) return null;

  const sorted =
    method === 'avalanche'
      ? [...active].sort((a, b) =>
          b.interest_rate !== a.interest_rate
            ? b.interest_rate - a.interest_rate
            : a.balance - b.balance,
        )
      : [...active].sort((a, b) =>
          a.balance !== b.balance
            ? a.balance - b.balance
            : b.interest_rate - a.interest_rate,
        );

  const budget = Math.max(0, totalIncome - totalExpenses);
  const sumMinimums = sorted.reduce((s, d) => s + d.minimum_payment, 0);

  let mode: TargetResult['mode'];
  if (budget === 0) mode = 'NO_BUDGET';
  else if (budget < sumMinimums) mode = 'CRISIS';
  else mode = 'NORMAL';

  const extra = mode === 'NORMAL' ? budget - sumMinimums : 0;

  return {
    debt: sorted[0],
    rank: 1,
    totalDebts: sorted.length,
    extraBudget: extra,
    mode,
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function MethodTab({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  value: PayoffMethod;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'bg-card text-foreground shadow-sm border border-border'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface DebtTargetCardProps {
  debts: Debt[];
  /** Needed to compute free budget. Pass 0 if unknown. */
  totalIncome?: number;
  totalExpenses?: number;
}

export function DebtTargetCard({
  debts,
  totalIncome = 0,
  totalExpenses = 0,
}: DebtTargetCardProps) {
  const [method, setMethod] = useState<PayoffMethod>('avalanche');

  const result = computeTarget(debts, method, totalIncome, totalExpenses);
  const activeDebts = debts.filter((d) => d.balance > 0);

  return (
    <Card className="border-t-2 border-t-debt card-hover animate-fade-in-up stagger-1 overflow-hidden">
      {/* Header strip */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-debt/10 text-debt">
            <Target size={20} />
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Próxima Deuda a Atacar
            </p>
            {activeDebts.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {activeDebts.length} deuda{activeDebts.length === 1 ? '' : 's'} activa
                {activeDebts.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>

        {/* Method selector */}
        <div
          className="flex items-center gap-1 bg-muted/60 rounded-lg p-1"
          role="group"
          aria-label="Método de pago"
        >
          <MethodTab
            value="avalanche"
            label="Avalancha"
            icon={Flame}
            active={method === 'avalanche'}
            onClick={() => setMethod('avalanche')}
          />
          <MethodTab
            value="snowball"
            label="Snowball"
            icon={Snowflake}
            active={method === 'snowball'}
            onClick={() => setMethod('snowball')}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-border" />

      {/* Body */}
      <div className="px-5 pb-5 pt-4">
        {!result ? (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
            <Layers size={32} className="text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Sin deudas activas para atacar
            </p>
          </div>
        ) : (
          <>
            {/* Target debt info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Name & badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-debt/15 text-debt border border-debt/20">
                    <TrendingDown size={11} />
                    {method === 'avalanche' ? 'Mayor interés' : 'Menor saldo'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    #{result.rank} de {result.totalDebts}
                  </span>
                </div>
                <h3 className="text-xl font-semibold leading-tight truncate">
                  {result.debt.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {method === 'avalanche'
                    ? 'Tasa más alta — ahorra más en intereses'
                    : 'Saldo más pequeño — elimínala más rápido'}
                </p>
              </div>

              {/* Key number */}
              <div className="text-right shrink-0">
                <p className="text-3xl font-semibold font-mono text-debt">
                  ${result.debt.balance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">saldo restante</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Interés
                </p>
                <p className="mt-1 font-mono text-base font-semibold text-debt">
                  {result.debt.interest_rate}%
                </p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Pago mín.
                </p>
                <p className="mt-1 font-mono text-base font-semibold">
                  ${result.debt.minimum_payment.toLocaleString()}
                </p>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Día de pago
                </p>
                <p className="mt-1 font-mono text-base font-semibold">
                  {result.debt.payment_day}
                </p>
              </div>
            </div>

            {/* Budget status */}
            {result.mode === 'NO_BUDGET' && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                <XCircle size={14} className="shrink-0 mt-0.5" />
                <span>
                  Sin presupuesto disponible — tus gastos igualan o superan tus ingresos.
                </span>
              </div>
            )}
            {result.mode === 'CRISIS' && (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-expense/20 bg-expense/10 px-3 py-2.5 text-xs text-expense">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>
                  Tu flujo no cubre todos los mínimos. Reduce gastos para atacar esta deuda.
                </span>
              </div>
            )}
            {result.mode === 'NORMAL' && result.extraBudget > 0 && (
              <div className="mt-3 flex items-center gap-2 rounded-md border border-income/20 bg-income/8 px-3 py-2.5 text-xs text-income">
                <TrendingDown size={14} className="shrink-0" />
                <span>
                  Puedes aplicar{' '}
                  <span className="font-mono font-semibold">
                    +${result.extraBudget.toLocaleString()}
                  </span>{' '}
                  extra a esta deuda este mes.
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
