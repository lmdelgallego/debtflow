'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, ArrowRight, CircleCheck, ShieldAlert } from 'lucide-react';
import type { AvalancheMode } from '@/lib/avalanche';

interface ActionPlanCardProps {
  mode: AvalancheMode;
  monthlyBudget: number;
  minimums: number;
  topExpenseName?: string;
  topExpenseAmount?: number;
  suggestedCuts?: Array<{ value: string; name: string; suggestedAmount: number; flexibility: 'Alta' | 'Media' | 'Baja' }>;
  cutCategories?: Array<{ value: string; name: string }>;
  blockedCutCategories?: string[];
  onToggleBlockedCategory?: (categoryValue: string) => void;
  onGoIncomes: () => void;
  onGoExpenses: () => void;
  onGoDebts: () => void;
}

function fmt(value: number) {
  return value.toLocaleString('es-MX', { maximumFractionDigits: 0 });
}

function getFlexibilityReason(flexibility: 'Alta' | 'Media' | 'Baja') {
  if (flexibility === 'Alta') {
    return 'Categoria flexible: suele permitir ajustes rapidos sin afectar necesidades basicas.';
  }
  if (flexibility === 'Media') {
    return 'Categoria parcialmente flexible: se puede optimizar, pero con cuidado para no afectar rutina.';
  }
  return 'Categoria sensible: intenta recortar al final para proteger gastos esenciales.';
}

export function ActionPlanCard({
  mode,
  monthlyBudget,
  minimums,
  topExpenseName,
  topExpenseAmount = 0,
  suggestedCuts = [],
  cutCategories = [],
  blockedCutCategories = [],
  onToggleBlockedCategory,
  onGoIncomes,
  onGoExpenses,
  onGoDebts,
}: ActionPlanCardProps) {
  const shortfall = Math.max(0, minimums - monthlyBudget);

  if (mode === 'NO_BUDGET') {
    return (
      <Card className="p-4 border border-destructive/30 bg-destructive/5 animate-fade-in-up stagger-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
          <ShieldAlert size={16} /> Prioridad alta: recuperar presupuesto
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Tus gastos consumen todos tus ingresos. Empieza ajustando gastos para volver a tener margen mensual.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={onGoExpenses} className="gap-1">
            Revisar gastos
            <ArrowRight size={14} />
          </Button>
          <Button size="sm" variant="outline" onClick={onGoIncomes}>Agregar ingreso</Button>
        </div>
      </Card>
    );
  }

  if (mode === 'CRISIS_NO_MINIMUMS') {
    const suggestedCutText = suggestedCuts.length > 0
      ? suggestedCuts
          .map((cut) => `${cut.name} (${fmt(cut.suggestedAmount)})`)
          .join(' + ')
      : null;
    const hasProtectedCategories = blockedCutCategories.length > 0;
    const noEligibleCategories = hasProtectedCategories && suggestedCuts.length === 0;

    return (
      <Card className="p-4 border border-expense/30 bg-expense/5 animate-fade-in-up stagger-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-expense">
          <AlertTriangle size={16} /> Prioridad alta: cubrir minimos
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Te faltan aproximadamente <span className="font-mono text-foreground">${fmt(shortfall)}</span> para cubrir pagos minimos este mes.
          {suggestedCutText
            ? ` Recorte sugerido por categorias: ${suggestedCutText}.`
            : topExpenseName
            ? ` Recorta primero "${topExpenseName}" (${fmt(topExpenseAmount)}).`
            : ''}
        </p>
        {suggestedCuts.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestedCuts.map((cut) => (
              <Tooltip key={`${cut.name}-${cut.flexibility}`}>
                <TooltipTrigger asChild>
                  <span
                    className={`inline-flex cursor-help items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
                      cut.flexibility === 'Alta'
                        ? 'border-income/30 bg-income/10 text-income'
                        : cut.flexibility === 'Media'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-muted-foreground/30 bg-muted/40 text-muted-foreground'
                    }`}
                  >
                    {cut.name}
                    <span className="font-mono">${fmt(cut.suggestedAmount)}</span>
                    <span>· {cut.flexibility}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>{getFlexibilityReason(cut.flexibility)}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {cutCategories.length > 0 && onToggleBlockedCategory && (
          <div className="mt-3 rounded-md border bg-background p-2.5">
            <p className="text-[11px] text-muted-foreground mb-2">Preferencias de recorte (proteger categoria)</p>
            <div className="flex flex-wrap gap-1.5">
              {cutCategories.map((category) => {
                const isBlocked = blockedCutCategories.includes(category.value);
                return (
                  <Button
                    key={category.value}
                    size="sm"
                    type="button"
                    variant={isBlocked ? 'secondary' : 'outline'}
                    className="h-7 px-2 text-[11px]"
                    onClick={() => onToggleBlockedCategory(category.value)}
                  >
                    {isBlocked ? 'Protegida:' : 'Proteger:'} {category.name}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {noEligibleCategories && (
          <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <p>
              No hay categorias elegibles para recorte por tus protecciones actuales. Considera desproteger una categoria o aumentar ingresos este mes.
            </p>
            <div className="mt-2">
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={onGoIncomes}>
                Agregar ingreso
              </Button>
            </div>
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={onGoExpenses} className="gap-1">
            Reducir gastos
            <ArrowRight size={14} />
          </Button>
          <Button size="sm" variant="outline" onClick={onGoIncomes}>Agregar ingreso</Button>
          <Button size="sm" variant="outline" onClick={onGoDebts}>Revisar deudas</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border border-income/30 bg-income/5 animate-fade-in-up stagger-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-income">
        <CircleCheck size={16} /> Plan mensual saludable
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ya cubres minimos. Siguiente accion recomendada: registrar un pago extra en tu deuda objetivo para acelerar tu fecha deuda-cero.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={onGoDebts} className="gap-1">
          Registrar pago extra
          <ArrowRight size={14} />
        </Button>
      </div>
    </Card>
  );
}
