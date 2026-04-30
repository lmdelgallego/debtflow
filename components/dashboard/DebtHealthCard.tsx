'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, CalendarClock, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { AvalancheMode } from '@/lib/avalanche';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  estimatePayoffDateFromMonths,
  formatPayoffDate,
  simulateDebtPayoffMonths,
} from '@/lib/payoff';

const SCENARIO_DELTA_STORAGE_KEY = 'debtflow_scenario_delta_v1';
const WHAT_IF_EXTRA_STORAGE_KEY = 'debtflow_what_if_extra_v1';

interface DebtHealthCardProps {
  mode: AvalancheMode;
  totalDebt: number;
  monthlyDebtPayment: number;
  monthlyAvailableFlow: number;
  sumMinimums: number;
  weightedInterestRateAnnual: number;
  liquidityFloor: number;
  autoLiquidityFloor: number;
  basePortfolioMonths: number | null;
  optimisticPortfolioMonths: number | null;
  conservativePortfolioMonths: number | null;
  variableIncomeDeltaPct: number;
  onVariableIncomeDeltaChange: (value: number) => void;
  liquidityFloorMode: 'auto' | 'manual';
  onLiquidityFloorModeChange: (mode: 'auto' | 'manual') => void;
  onManualLiquidityFloorChange: (value: number) => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString('es-MX', { maximumFractionDigits: 0 });
}

function formatEstimatedDate(months: number) {
  const payoffDate = estimatePayoffDateFromMonths(months);
  return formatPayoffDate(payoffDate);
}

export function DebtHealthCard({
  mode,
  totalDebt,
  monthlyDebtPayment,
  monthlyAvailableFlow,
  sumMinimums,
  weightedInterestRateAnnual,
  liquidityFloor,
  autoLiquidityFloor,
  basePortfolioMonths,
  optimisticPortfolioMonths,
  conservativePortfolioMonths,
  variableIncomeDeltaPct,
  onVariableIncomeDeltaChange,
  liquidityFloorMode,
  onLiquidityFloorModeChange,
  onManualLiquidityFloorChange,
}: DebtHealthCardProps) {
  const [scenarioDelta, setScenarioDelta] = useState(10);
  const [whatIfExtra, setWhatIfExtra] = useState(0);
  const [timelineVisible, setTimelineVisible] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(SCENARIO_DELTA_STORAGE_KEY);
    if (!stored) return;

    const parsed = Number(stored);
    if ([5, 10, 15].includes(parsed)) {
      setScenarioDelta(parsed);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SCENARIO_DELTA_STORAGE_KEY, String(scenarioDelta));
  }, [scenarioDelta]);

  useEffect(() => {
    const stored = window.localStorage.getItem(WHAT_IF_EXTRA_STORAGE_KEY);
    if (!stored) return;
    const parsed = Number(stored);
    if (Number.isFinite(parsed) && parsed >= 0) {
      setWhatIfExtra(parsed);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(WHAT_IF_EXTRA_STORAGE_KEY, String(whatIfExtra));
  }, [whatIfExtra]);

  useEffect(() => {
    const timeout = setTimeout(() => setTimelineVisible(true), 80);
    return () => clearTimeout(timeout);
  }, []);

  const hasProjection = totalDebt > 0 && monthlyDebtPayment > 0;
  const maxWhatIfExtra = Math.max(0, Math.floor(monthlyAvailableFlow - liquidityFloor));
  const clampedWhatIfExtra = Math.min(Math.max(whatIfExtra, 0), maxWhatIfExtra);
  const monthlyRate = Math.max(0, weightedInterestRateAnnual) / 100 / 12;
  const estimatedMonths = hasProjection
    ? simulateDebtPayoffMonths({ totalDebt, monthlyPayment: monthlyDebtPayment, monthlyRate })
    : null;

  const optimisticMonths = hasProjection
    ? simulateDebtPayoffMonths({
        totalDebt,
        monthlyPayment: monthlyDebtPayment * (1 + scenarioDelta / 100),
        monthlyRate,
      })
    : null;
  const conservativeMonths = hasProjection
    ? simulateDebtPayoffMonths({
        totalDebt,
        monthlyPayment: monthlyDebtPayment * (1 - scenarioDelta / 100),
        monthlyRate,
      })
    : null;
  const monthsSavedVsBase = optimisticMonths && estimatedMonths ? Math.max(0, estimatedMonths - optimisticMonths) : null;
  const whatIfMonths = hasProjection
    ? simulateDebtPayoffMonths({
        totalDebt,
        monthlyPayment: monthlyDebtPayment + clampedWhatIfExtra,
        monthlyRate,
      })
    : null;
  const whatIfSavedVsBase = whatIfMonths && estimatedMonths ? Math.max(0, estimatedMonths - whatIfMonths) : null;

  const estimatedDate = basePortfolioMonths
    ? formatEstimatedDate(basePortfolioMonths)
    : estimatedMonths
    ? formatEstimatedDate(estimatedMonths)
    : null;
  const timelineMilestones = estimatedMonths
    ? [
        { label: 'Hoy', position: 0 },
        { label: `+${Math.max(3, Math.ceil(estimatedMonths * 0.25))}m`, position: 25 },
        { label: `+${Math.max(6, Math.ceil(estimatedMonths * 0.5))}m`, position: 50 },
        { label: `+${Math.max(9, Math.ceil(estimatedMonths * 0.75))}m`, position: 75 },
        { label: 'Deuda cero', position: 100 },
      ]
    : null;
  const lowMargin = sumMinimums > 0 && monthlyAvailableFlow >= 0 && monthlyAvailableFlow < sumMinimums * 0.2;

  const riskConfig =
    mode === 'NO_BUDGET'
      ? {
          icon: ShieldAlert,
          containerClass: 'border-destructive/30 bg-destructive/8 text-destructive',
          title: 'Riesgo alto: sin presupuesto',
          description: 'Tus gastos ya consumen tus ingresos. Ajusta gastos o aumenta ingresos esta semana.',
        }
      : mode === 'CRISIS_NO_MINIMUMS'
      ? {
          icon: AlertTriangle,
          containerClass: 'border-expense/30 bg-expense/8 text-expense',
          title: 'Riesgo alto: no cubres minimos',
          description: 'Con el flujo actual no alcanzas a cubrir pagos minimos. Prioriza recorte de gastos.',
        }
      : lowMargin
      ? {
          icon: AlertTriangle,
          containerClass: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
          title: 'Riesgo medio: margen bajo',
          description: 'Vas al dia, pero con poco margen. Reserva un colchon para evitar atrasos.',
        }
      : {
          icon: ShieldCheck,
          containerClass: 'border-income/30 bg-income/8 text-income',
          title: 'Riesgo bajo: plan estable',
          description: 'Tu flujo cubre minimos y permite acelerar pagos.',
        };

  const RiskIcon = riskConfig.icon;

  return (
    <Card className="animate-fade-in-up stagger-5 p-5 border-t-2 border-t-primary">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Fecha estimada deuda cero</p>
          {estimatedDate ? (
            <p className="mt-1 text-2xl font-semibold capitalize">{estimatedDate}</p>
          ) : (
            <p className="mt-1 text-lg font-semibold text-muted-foreground">Sin proyeccion disponible</p>
          )}
          {(basePortfolioMonths || estimatedMonths) && (
            <p className="text-xs text-muted-foreground">
              Aproximadamente {(basePortfolioMonths || estimatedMonths)} mes{(basePortfolioMonths || estimatedMonths) === 1 ? '' : 'es'} al ritmo actual.
            </p>
          )}
          {estimatedMonths && monthlyRate > 0 && (
            <p className="text-xs text-muted-foreground">
              Incluye interes aproximado ({weightedInterestRateAnnual.toFixed(1)}% anual ponderado).
            </p>
          )}
        </div>
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <CalendarClock size={20} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md bg-muted/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">Deuda total</p>
          <p className="font-mono font-semibold">${formatCurrency(totalDebt)}</p>
        </div>
        <div className="rounded-md bg-muted/50 p-2.5">
          <p className="text-[11px] text-muted-foreground">Pago mensual estimado</p>
          <p className="font-mono font-semibold">${formatCurrency(monthlyDebtPayment)}</p>
        </div>
      </div>

      {timelineMilestones && (
        <div className="mt-4 rounded-md border bg-muted/20 p-3">
          <p className="text-xs font-medium text-muted-foreground">Ruta de meta: hoy a deuda cero</p>
          <div className="mt-3 relative">
            <div className="h-2 rounded-full bg-muted" />
            <div
              className="absolute inset-y-0 left-0 h-2 rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: timelineVisible ? '14%' : '0%' }}
            />
            {timelineMilestones.map((milestone) => (
              <span
                key={milestone.label}
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full border border-background bg-primary"
                style={{ left: `calc(${milestone.position}% - 6px)` }}
              />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-5 text-[11px] text-muted-foreground">
            {timelineMilestones.map((milestone) => (
              <p key={`${milestone.label}-text`} className="text-center">
                {milestone.label}
              </p>
            ))}
          </div>
        </div>
      )}

      {hasProjection && (
        <div className="mt-4 rounded-md border bg-muted/20 p-3">
          <div className="mb-3 rounded-md border bg-background p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">Colchon de liquidez mensual</p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={liquidityFloorMode === 'auto' ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={() => onLiquidityFloorModeChange('auto')}
                >
                  Auto
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={liquidityFloorMode === 'manual' ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={() => onLiquidityFloorModeChange('manual')}
                >
                  Manual
                </Button>
              </div>
            </div>
            {liquidityFloorMode === 'manual' && (
              <div className="mb-2">
                <label className="text-[11px] text-muted-foreground">Monto minimo a conservar</label>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={liquidityFloor}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (!Number.isFinite(next)) return;
                    onManualLiquidityFloorChange(Math.max(0, Math.floor(next)));
                  }}
                  className="mt-1"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant={liquidityFloor === autoLiquidityFloor ? 'default' : 'outline'}
                    className="h-7 px-2 text-[11px]"
                    onClick={() => onManualLiquidityFloorChange(autoLiquidityFloor)}
                  >
                    1x gastos fijos (${autoLiquidityFloor.toLocaleString('es-MX')})
                  </Button>
                  {[500, 1000, 2000].map((preset) => (
                    <Button
                      key={`liquidity-preset-${preset}`}
                      type="button"
                      size="sm"
                      variant={liquidityFloor === preset ? 'default' : 'outline'}
                      className="h-7 px-2 text-[11px]"
                      onClick={() => onManualLiquidityFloorChange(preset)}
                    >
                      ${preset.toLocaleString('es-MX')}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mb-2">
              Colchon activo: ${formatCurrency(liquidityFloor)}
            </p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">Incertidumbre por ingresos variables (portfolio real)</p>
              <div className="flex items-center gap-1">
                {[10, 20, 30].map((value) => (
                  <Button
                    key={`income-delta-${value}`}
                    type="button"
                    size="sm"
                    variant={variableIncomeDeltaPct === value ? 'default' : 'outline'}
                    className="h-7 px-2 text-xs"
                    onClick={() => onVariableIncomeDeltaChange(value)}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div>
                <p className="text-[11px] text-muted-foreground">Optimista (+{variableIncomeDeltaPct}%)</p>
                <p className="text-sm font-semibold capitalize">
                  {optimisticPortfolioMonths ? formatEstimatedDate(optimisticPortfolioMonths) : 'Sin salida'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Base</p>
                <p className="text-sm font-semibold capitalize">
                  {basePortfolioMonths ? formatEstimatedDate(basePortfolioMonths) : 'Sin salida'}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Conservador (-{variableIncomeDeltaPct}%)</p>
                <p className="text-sm font-semibold capitalize">
                  {conservativePortfolioMonths ? formatEstimatedDate(conservativePortfolioMonths) : 'Sin salida'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Escenarios de proyeccion</p>
            <div className="flex items-center gap-1">
              {[5, 10, 15].map((delta) => (
                <Button
                  key={delta}
                  type="button"
                  size="sm"
                  variant={scenarioDelta === delta ? 'default' : 'outline'}
                  className="h-7 px-2 text-xs"
                  onClick={() => setScenarioDelta(delta)}
                >
                  {delta}%
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-md bg-background p-2.5 border">
              <p className="text-[11px] text-muted-foreground">Optimista (+{scenarioDelta}%)</p>
              <p className="text-sm font-semibold capitalize">
                {optimisticMonths ? formatEstimatedDate(optimisticMonths) : 'Sin salida'}
              </p>
            </div>
            <div className="rounded-md bg-background p-2.5 border">
              <p className="text-[11px] text-muted-foreground">Base</p>
              <p className="text-sm font-semibold capitalize">
                {estimatedMonths ? formatEstimatedDate(estimatedMonths) : 'Sin salida'}
              </p>
            </div>
            <div className="rounded-md bg-background p-2.5 border">
              <p className="text-[11px] text-muted-foreground">Conservador (-{scenarioDelta}%)</p>
              <p className="text-sm font-semibold capitalize">
                {conservativeMonths ? formatEstimatedDate(conservativeMonths) : 'Sin salida'}
              </p>
            </div>
          </div>
          {monthsSavedVsBase !== null && monthsSavedVsBase > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Con +{scenarioDelta}% de pago mensual, podrias terminar aproximadamente {monthsSavedVsBase} mes{monthsSavedVsBase === 1 ? '' : 'es'} antes que el escenario base.
            </p>
          )}

          <div className="mt-4 rounded-md border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">What-if con monto libre</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="text-[11px] text-muted-foreground">Extra mensual adicional (tope actual: ${formatCurrency(maxWhatIfExtra)})</label>
                <Input
                  type="number"
                  min={0}
                  max={maxWhatIfExtra}
                  step={50}
                  value={whatIfExtra}
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (!Number.isFinite(next)) return;
                    setWhatIfExtra(Math.max(0, Math.min(next, maxWhatIfExtra)));
                  }}
                  className="mt-1"
                />
              </div>
              <div className="sm:w-52 rounded-md border bg-muted/30 p-2.5">
                <p className="text-[11px] text-muted-foreground">Fecha proyectada</p>
                <p className="text-sm font-semibold capitalize">
                  {whatIfMonths ? formatEstimatedDate(whatIfMonths) : 'Sin salida'}
                </p>
                {whatIfSavedVsBase !== null && whatIfSavedVsBase > 0 && (
                  <p className="text-[11px] text-income mt-0.5">
                    ~{whatIfSavedVsBase} mes{whatIfSavedVsBase === 1 ? '' : 'es'} antes vs base
                  </p>
                )}
              </div>
            </div>
            {maxWhatIfExtra <= 0 && liquidityFloor > 0 && (
              <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
                Extra bloqueado por seguridad: debes conservar un colchon minimo de ${formatCurrency(liquidityFloor)} este mes.
              </p>
            )}
          </div>
        </div>
      )}

      <div className={`mt-4 rounded-md border px-3 py-2 text-xs ${riskConfig.containerClass}`}>
        <p className="flex items-center gap-1.5 font-semibold">
          <RiskIcon size={13} />
          {riskConfig.title}
        </p>
        <p className="mt-1 opacity-90">{riskConfig.description}</p>
      </div>
    </Card>
  );
}
