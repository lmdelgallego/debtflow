'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Flame,
  Snowflake,
  Trophy,
  ArrowRight,
  TrendingDown,
  Clock,
  Banknote,
} from 'lucide-react';
import type { Debt } from '@/lib/actions/debts.action';
import { calculateMonthlyBudget, compareMethodsPayoff, formatMonths, formatPayoffDate } from '@/lib/payoff';
import type { PortfolioProjection } from '@/lib/payoff';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MethodConfig {
  key: 'avalanche' | 'snowball';
  label: string;
  description: string;
  icon: React.ElementType;
  textColor: string;
  iconBg: string;
  barColor: string;
  ringClass: string;
  winnerBadge: string;
}

const METHOD_CONFIGS: MethodConfig[] = [
  {
    key: 'avalanche',
    label: 'Avalancha',
    description: 'Mayor interés primero',
    icon: Flame,
    textColor: 'text-debt',
    iconBg: 'bg-debt/10 text-debt',
    barColor: 'bg-debt',
    ringClass: 'ring-2 ring-debt/40',
    winnerBadge: 'bg-debt/15 text-debt border-debt/30',
  },
  {
    key: 'snowball',
    label: 'Snowball',
    description: 'Menor saldo primero',
    icon: Snowflake,
    textColor: 'text-primary',
    iconBg: 'bg-primary/10 text-primary',
    barColor: 'bg-primary',
    ringClass: 'ring-2 ring-primary/40',
    winnerBadge: 'bg-primary/15 text-primary border-primary/30',
  },
];

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  value,
  max,
  colorClass,
  label,
}: {
  value: number;
  max: number;
  colorClass: string;
  label: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono font-medium text-foreground">
          ${value.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemax={max}
          aria-label={label}
        />
      </div>
    </div>
  );
}

// ─── Method Column ────────────────────────────────────────────────────────────

function MethodColumn({
  config,
  projection,
  isWinner,
  maxPaid,
  maxInterest,
}: {
  config: MethodConfig;
  projection: PortfolioProjection;
  isWinner: boolean;
  maxPaid: number;
  maxInterest: number;
}) {
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'relative flex-1 rounded-xl border border-border bg-card p-5 transition-all duration-300',
        isWinner && config.ringClass,
        isWinner && 'border-transparent',
      )}
    >
      {/* Winner badge */}
      {isWinner && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
              config.winnerBadge,
            )}
          >
            <Trophy size={10} />
            Recomendado
          </span>
        </div>
      )}

      {/* Method identity */}
      <div className="flex items-center gap-3 mb-5 mt-1">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', config.iconBg)}>
          <Icon size={17} />
        </div>
        <div>
          <p className="font-semibold text-sm">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Key stats */}
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-3">
          <Clock size={13} className="text-muted-foreground shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tiempo</p>
            <p className="font-semibold text-sm">{formatMonths(projection.months)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ArrowRight size={13} className={cn('shrink-0', config.textColor)} />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Libre en</p>
            <p className={cn('font-semibold text-sm', config.textColor)}>
              {formatPayoffDate(projection.payoffDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Bar visualization */}
      <div className="space-y-2.5">
        <ProgressBar
          value={projection.totalPaid}
          max={maxPaid}
          colorClass={config.barColor}
          label="Total pagado"
        />
        <ProgressBar
          value={projection.totalInterest}
          max={maxInterest}
          colorClass={`${config.barColor} opacity-60`}
          label="En intereses"
        />
      </div>
    </div>
  );
}

// ─── Delta Pill ───────────────────────────────────────────────────────────────

function DeltaPill({
  label,
  value,
  positive,
  icon: Icon,
}: {
  label: string;
  value: string;
  positive: boolean;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full',
          positive ? 'bg-income/15 text-income' : 'bg-muted text-muted-foreground',
        )}
      >
        <Icon size={13} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-sm font-semibold font-mono', positive ? 'text-income' : 'text-foreground')}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MethodComparisonCardProps {
  debts: Debt[];
  totalIncome?: number;
  totalExpenses?: number;
  monthLabel?: string;
}

export function MethodComparisonCard({
  debts,
  totalIncome = 0,
  totalExpenses = 0,
  monthLabel,
}: MethodComparisonCardProps) {
  const monthlyBudget = calculateMonthlyBudget(totalIncome, totalExpenses);

  const comparison = useMemo(
    () => compareMethodsPayoff(debts, monthlyBudget),
    [debts, monthlyBudget],
  );

  if (!comparison) return null;

  const { avalanche, snowball, monthsDelta, interestDelta } = comparison;

  // Avalanche almost always wins on interest; snowball can rarely win on time
  const avalancheWinsInterest = interestDelta >= 0;
  const maxPaid = Math.max(avalanche.totalPaid, snowball.totalPaid);
  const maxInterest = Math.max(avalanche.totalInterest, snowball.totalInterest);

  return (
    <Card className="p-5 animate-fade-in-up stagger-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h2 className="text-base font-semibold">Comparativo de Métodos</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Simulación: {monthLabel || 'mes actual'} ·{' '}
            <span className="font-mono font-medium text-foreground">
              ${monthlyBudget.toLocaleString()}
            </span>{' '}
            / mes · pago constante
          </p>
        </div>

        {/* Savings callout */}
        {avalancheWinsInterest && Math.abs(interestDelta) >= 1 && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-income/20 bg-income/8 px-3 py-2">
            <TrendingDown size={14} className="text-income shrink-0" />
            <p className="text-xs text-income font-medium">
              Avalancha te ahorra{' '}
              <span className="font-mono font-semibold">
                ${Math.abs(interestDelta).toLocaleString('es-MX', { maximumFractionDigits: 0 })}
              </span>{' '}
              en intereses
            </p>
          </div>
        )}
      </div>

      {/* Columns */}
      <div className="flex gap-4 flex-col sm:flex-row mt-5">
        {METHOD_CONFIGS.map((cfg) => (
          <MethodColumn
            key={cfg.key}
            config={cfg}
            projection={cfg.key === 'avalanche' ? avalanche : snowball}
            isWinner={cfg.key === 'avalanche' ? avalancheWinsInterest : !avalancheWinsInterest}
            maxPaid={maxPaid}
            maxInterest={maxInterest}
          />
        ))}
      </div>

      {/* Delta row */}
      {(Math.abs(monthsDelta) > 0 || Math.abs(interestDelta) >= 1) && (
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 pt-4 border-t border-border">
          {Math.abs(interestDelta) >= 1 && (
            <DeltaPill
              label="Ahorro en intereses (Avalancha)"
              value={`$${Math.abs(interestDelta).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`}
              positive={avalancheWinsInterest}
              icon={Banknote}
            />
          )}
          {Math.abs(monthsDelta) > 0 && (
            <DeltaPill
              label={
                monthsDelta < 0
                  ? `Snowball ${Math.abs(monthsDelta)} mes${Math.abs(monthsDelta) === 1 ? '' : 'es'} más rápido`
                  : `Avalancha ${monthsDelta} mes${monthsDelta === 1 ? '' : 'es'} más rápido`
              }
              value={monthsDelta < 0 ? 'a cambio de más intereses' : 'y con menos intereses'}
              positive={monthsDelta > 0}
              icon={Clock}
            />
          )}
        </div>
      )}
    </Card>
  );
}
