'use client';

import { Card } from '@/components/ui/card';
import { TrendingDown, AlertTriangle, XCircle, Target } from 'lucide-react';
import type { AvalancheResult } from '@/lib/avalanche';

interface NextDebtCardProps {
  avalanche: AvalancheResult;
  index?: number;
}

const modeConfig = {
  NORMAL: {
    badge: null,
    alert: null,
  },
  CRISIS_NO_MINIMUMS: {
    badge: { label: 'Modo Crisis', icon: AlertTriangle, class: 'bg-expense/15 text-expense border-expense/30' },
    alert: 'Tu flujo no cubre los pagos mínimos. Reduce gastos para recuperar el control.',
  },
  NO_BUDGET: {
    badge: { label: 'Sin Presupuesto', icon: XCircle, class: 'bg-destructive/15 text-destructive border-destructive/30' },
    alert: 'Tus gastos igualan o superan tus ingresos. No hay margen para deudas.',
  },
} as const;

export function NextDebtCard({ avalanche, index = 4 }: NextDebtCardProps) {
  const target = avalanche.recommendedPayments.find((p) => p.isTarget);
  const targetDebt = avalanche.orderedDebts[0];
  const config = modeConfig[avalanche.mode];

  const hasTarget = !!target && !!targetDebt;

  return (
    <Card
      className={`p-5 border-t-2 border-t-debt card-hover animate-fade-in-up stagger-${index + 1} flex flex-col gap-4`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Próxima Deuda a Atacar</p>
          {hasTarget ? (
            <p className="text-xl font-semibold leading-tight line-clamp-2">{targetDebt.name}</p>
          ) : (
            <p className="text-xl font-semibold text-muted-foreground">Sin deudas activas</p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-debt/10 text-debt">
          <Target size={20} />
        </div>
      </div>

      {/* Stats row */}
      {hasTarget && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-md bg-muted/50 p-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Saldo</p>
            <p className="mt-0.5 font-mono text-sm font-semibold">
              ${targetDebt.balance.toLocaleString()}
            </p>
          </div>
          <div className="rounded-md bg-muted/50 p-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Interés</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-debt">
              {targetDebt.interest_rate}%
            </p>
          </div>
          <div className="rounded-md bg-muted/50 p-2.5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Pago rec.</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-income">
              ${target.recommendedPayment.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Mode badge or alert */}
      {config.badge ? (
        <div
          className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${config.badge.class}`}
        >
          <config.badge.icon size={14} />
          <span>{config.badge.label}</span>
          {config.alert && (
            <span className="ml-1 font-normal opacity-80 line-clamp-1">{config.alert}</span>
          )}
        </div>
      ) : hasTarget && target.extraApplied > 0 ? (
        <div className="flex items-center gap-2 rounded-md border border-income/20 bg-income/8 px-3 py-2 text-xs font-medium text-income">
          <TrendingDown size={14} />
          <span>+${target.extraApplied.toLocaleString()} extra aplicado — método avalancha activo</span>
        </div>
      ) : null}
    </Card>
  );
}
