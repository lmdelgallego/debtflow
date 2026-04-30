'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle2, ChevronLeft, ChevronRight, CircleDollarSign, CreditCard, HandCoins, Sparkles } from 'lucide-react';

interface OnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  checklist: {
    hasIncomes: boolean;
    hasExpenses: boolean;
    hasDebts: boolean;
  };
}

const steps = [
  {
    title: 'Registra tus ingresos',
    description: 'Agrega ingresos fijos y variables para calcular tu flujo real del mes.',
    cta: 'Ir a ingresos',
    href: '/incomes',
    icon: CircleDollarSign,
    accent: 'text-income',
  },
  {
    title: 'Carga tus gastos',
    description: 'Registra tus gastos mensuales para detectar cuánto dinero te queda libre.',
    cta: 'Ir a gastos',
    href: '/expenses',
    icon: CreditCard,
    accent: 'text-expense',
  },
  {
    title: 'Agrega tus deudas',
    description: 'Incluye saldo, tasa y pago minimo para activar recomendaciones del metodo avalancha.',
    cta: 'Ir a deudas',
    href: '/debts',
    icon: HandCoins,
    accent: 'text-debt',
  },
  {
    title: 'Revisa tu plan mensual',
    description: 'Con esos datos, DebtFlow te mostrara flujo disponible y la proxima deuda a atacar.',
    cta: 'Finalizar onboarding',
    href: '/dashboard',
    icon: Sparkles,
    accent: 'text-primary',
  },
] as const;

export function OnboardingWizard({ open, onOpenChange, onComplete, checklist }: OnboardingWizardProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  const currentStep = steps[stepIndex];
  const CurrentIcon = currentStep.icon;
  const progress = useMemo(() => ((stepIndex + 1) / steps.length) * 100, [stepIndex]);
  const checklistItems = [
    { label: 'Ingresos cargados', done: checklist.hasIncomes },
    { label: 'Gastos cargados', done: checklist.hasExpenses },
    { label: 'Deudas cargadas', done: checklist.hasDebts },
  ];
  const completedCount = checklistItems.filter((item) => item.done).length;
  const isChecklistComplete = completedCount === checklistItems.length;

  const handleNext = () => {
    if (stepIndex >= steps.length - 1) {
      onComplete();
      onOpenChange(false);
      return;
    }
    setStepIndex((prev) => prev + 1);
  };

  const handleGoToStepPage = () => {
    onOpenChange(false);
    router.push(currentStep.href);
  };

  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-primary" size={18} />
            Configuracion inicial
          </DialogTitle>
          <DialogDescription>
            Completa estos 4 pasos para activar recomendaciones de pago personalizadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>Paso {stepIndex + 1} de {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className={`rounded-md bg-muted p-2 ${currentStep.accent}`}>
                <CurrentIcon size={18} />
              </div>
              <h3 className="text-base font-semibold">{currentStep.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`h-1.5 rounded-full ${index <= stepIndex ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>

          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Checklist en vivo</p>
              <p className="text-xs text-muted-foreground">{completedCount}/3</p>
            </div>
            <div className="space-y-1.5">
              {checklistItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <span className="text-foreground/90">{item.label}</span>
                  <span className={item.done ? 'text-income' : 'text-muted-foreground'}>
                    {item.done ? 'Listo' : 'Pendiente'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={handleSkip}>Omitir onboarding</Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={stepIndex === 0}
            >
              <ChevronLeft size={16} />
              Atras
            </Button>
            <Button variant="secondary" onClick={handleGoToStepPage}>{currentStep.cta}</Button>
            <Button onClick={handleNext}>
              {stepIndex === steps.length - 1
                ? isChecklistComplete
                  ? 'Ir al dashboard'
                  : 'Finalizar'
                : 'Siguiente'}
              {stepIndex < steps.length - 1 && <ChevronRight size={16} />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
