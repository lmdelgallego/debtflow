'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, CreditCard, HandCoins, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { Button } from '@/components/ui/button';
import { fetchAllIncomes } from '@/lib/actions/incomes.action';
import { fetchAllExpenses, syncRecurringExpenses } from '@/lib/actions/expenses.action';
import { fetchAllDebts } from '@/lib/actions/debts.action';
import { getCategoryByValue } from '@/constants/expense-categories';
import type { Income } from '@/lib/actions/incomes.action';
import type { Expense } from '@/lib/actions/expenses.action';
import type { Debt } from '@/lib/actions/debts.action';
import { calculateAvalanche } from '@/lib/avalanche';
import type { AvalancheResult } from '@/lib/avalanche';
import { calculateMonthlyBudget, calculateWeightedInterestRate, simulatePortfolio } from '@/lib/payoff';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { NextDebtCard } from '@/components/dashboard/NextDebtCard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { CashFlowCard } from '@/components/dashboard/CashFlowCard';
import { DebtHealthCard } from '@/components/dashboard/DebtHealthCard';
import { ActionPlanCard } from '@/components/dashboard/ActionPlanCard';
import { MonthCloseDialog } from '@/components/dashboard/MonthCloseDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { useToast } from '@/components/ui/Toast';
import { SummarySkeleton, ChartSkeleton } from '@/components/incomes/Skeletons';

const ONBOARDING_STORAGE_KEY = 'debtflow_onboarding_completed_v1';
const MONTH_CLOSURES_STORAGE_KEY = 'debtflow_month_closures_v1';
const BLOCKED_CUT_CATEGORIES_STORAGE_KEY = 'debtflow_blocked_cut_categories_v1';
const VARIABLE_INCOME_DELTA_STORAGE_KEY = 'debtflow_variable_income_delta_pct_v1';
const LIQUIDITY_FLOOR_MODE_STORAGE_KEY = 'debtflow_liquidity_floor_mode_v1';
const LIQUIDITY_FLOOR_MANUAL_STORAGE_KEY = 'debtflow_liquidity_floor_manual_v1';

interface MonthClosureSnapshot {
  monthKey: string;
  monthLabel: string;
  incomes: number;
  expenses: number;
  minimums: number;
  availableFlow: number;
  totalDebt: number;
  activeDebts: number;
  closedAt: string;
}

const CATEGORY_CUT_PRIORITY: Record<string, number> = {
  entertainment: 5,
  others: 5,
  transport: 4,
  food: 3,
  utilities: 2,
  housing: 1,
  health: 1,
  debt: 0,
};

function getFlexibilityLabel(priority: number): 'Alta' | 'Media' | 'Baja' {
  if (priority >= 5) return 'Alta';
  if (priority >= 3) return 'Media';
  return 'Baja';
}

function formatDelta(value: number) {
  const abs = Math.abs(value).toLocaleString('es-MX', { maximumFractionDigits: 0 });
  return `${value >= 0 ? '+' : '-'}$${abs}`;
}

function buildMonthlyData(incomes: Income[], expenses: Expense[], debts: Debt[]) {
  const months: Record<string, { ingresos: number; gastos: number; minimos: number }> = {};

  // Ensure the last 6 months are always present in the chart
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = { ingresos: 0, gastos: 0, minimos: 0 };
  }

  for (const income of incomes) {
    const d = new Date(income.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { ingresos: 0, gastos: 0, minimos: 0 };
    months[key].ingresos += income.amount;
  }

  for (const expense of expenses) {
    const d = new Date(expense.date || expense.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { ingresos: 0, gastos: 0, minimos: 0 };
    months[key].gastos += expense.amount;
  }

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return Object.keys(months)
    .sort((a, b) => a.localeCompare(b))
    .slice(-6)
    .map((key) => {
      const [y, mStr] = key.split('-');
      const year = parseInt(y);
      const monthIndex = parseInt(mStr) - 1;

      const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);

      let minimos = 0;
      for (const debt of debts) {
        const createdAt = new Date(debt.created_at);
        if (createdAt <= endOfMonth) {
          const paymentsAfter = expenses
            .filter((e) => e.category === 'debt' && e.subcategory === debt.name)
            .filter((e) => new Date(e.date || e.created_at) > endOfMonth)
            .reduce((sum, e) => sum + e.amount, 0);

          const pastBalance = debt.balance + paymentsAfter;
          if (pastBalance > 0) {
            minimos += debt.minimum_payment;
          }
        }
      }

      return {
        month: monthNames[monthIndex],
        ingresos: months[key].ingresos,
        gastos: months[key].gastos,
        minimos,
      };
    });
}

function buildSparkline(
  items: Array<{ created_at?: string; date?: string; amount: number }>,
  dateField: 'created_at' | 'date' = 'created_at',
) {
  const byMonth: Record<string, number> = {};
  for (const item of items) {
    const d = new Date(
      (dateField === 'date' && 'date' in item ? item.date : item.created_at) || item.created_at || '',
    );
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] || 0) + item.amount;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => v);
}

function filterByMonth<T extends { created_at?: string; date?: string }>(
  items: T[],
  selectedDate: Date,
  dateField: 'created_at' | 'date' = 'created_at',
): T[] {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth(); // 0-indexed

  return items.filter((item) => {
    const d = new Date(
      (dateField === 'date' && 'date' in item ? item.date : item.created_at) || item.created_at || '',
    );
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
}

function calculateTrend(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return { value: 0 };
    return { value: 100 }; // 100% increase from 0
  }
  const diff = ((current - previous) / previous) * 100;
  return { value: diff };
}

const Dashboard = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMonthCloseDialog, setShowMonthCloseDialog] = useState(false);
  const [monthClosures, setMonthClosures] = useState<Record<string, MonthClosureSnapshot>>({});
  const [blockedCutCategories, setBlockedCutCategories] = useState<string[]>([]);
  const [variableIncomeDeltaPct, setVariableIncomeDeltaPct] = useState(20);
  const [liquidityFloorMode, setLiquidityFloorMode] = useState<'auto' | 'manual'>('auto');
  const [manualLiquidityFloor, setManualLiquidityFloor] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      // Sincronizar gastos recurrentes antes de cargar los datos
      await syncRecurringExpenses();

      const [incomeRes, expenseRes, debtRes] = await Promise.all([
        fetchAllIncomes(),
        fetchAllExpenses(),
        fetchAllDebts(),
      ]);
      if (!cancelled) {
        setIncomes(incomeRes.data || []);
        setExpenses(expenseRes.data || []);
        setDebts(debtRes.data || []);
        setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const rawBlocked = window.localStorage.getItem(BLOCKED_CUT_CATEGORIES_STORAGE_KEY);
    if (!rawBlocked) return;

    try {
      const parsed = JSON.parse(rawBlocked) as string[];
      setBlockedCutCategories(parsed);
    } catch {
      setBlockedCutCategories([]);
    }
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(VARIABLE_INCOME_DELTA_STORAGE_KEY);
    if (!stored) return;

    const parsed = Number(stored);
    if ([10, 20, 30].includes(parsed)) {
      setVariableIncomeDeltaPct(parsed);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VARIABLE_INCOME_DELTA_STORAGE_KEY, String(variableIncomeDeltaPct));
  }, [variableIncomeDeltaPct]);

  useEffect(() => {
    const mode = window.localStorage.getItem(LIQUIDITY_FLOOR_MODE_STORAGE_KEY);
    if (mode === 'auto' || mode === 'manual') {
      setLiquidityFloorMode(mode);
    }

    const manual = window.localStorage.getItem(LIQUIDITY_FLOOR_MANUAL_STORAGE_KEY);
    if (manual) {
      const parsed = Number(manual);
      if (Number.isFinite(parsed) && parsed >= 0) {
        setManualLiquidityFloor(Math.floor(parsed));
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LIQUIDITY_FLOOR_MODE_STORAGE_KEY, liquidityFloorMode);
  }, [liquidityFloorMode]);

  useEffect(() => {
    window.localStorage.setItem(LIQUIDITY_FLOOR_MANUAL_STORAGE_KEY, String(manualLiquidityFloor));
  }, [manualLiquidityFloor]);

  const handleToggleBlockedCutCategory = (categoryValue: string) => {
    const updated = blockedCutCategories.includes(categoryValue)
      ? blockedCutCategories.filter((value) => value !== categoryValue)
      : [...blockedCutCategories, categoryValue];

    setBlockedCutCategories(updated);
    window.localStorage.setItem(BLOCKED_CUT_CATEGORIES_STORAGE_KEY, JSON.stringify(updated));
  };

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const activeDebts = debts.filter((d) => d.balance > 0);
  const totalDebt = activeDebts.reduce((s, d) => s + d.balance, 0);
  const weightedInterestRateAnnual = calculateWeightedInterestRate(activeDebts);

  // ── Monthly cash flow (selected month) ─────────────────────────────
  const currentMonthIncomes = filterByMonth(incomes, selectedDate, 'created_at');
  const currentMonthExpenses = filterByMonth(expenses, selectedDate, 'date');

  const monthlyIncomeTotal = currentMonthIncomes.reduce((s, i) => s + i.amount, 0);
  const monthlyFixedIncome = currentMonthIncomes.filter((income) => income.type === 'fixed').reduce((s, i) => s + i.amount, 0);
  const monthlyVariableIncome = currentMonthIncomes.filter((income) => income.type === 'variable').reduce((s, i) => s + i.amount, 0);
  const monthlyExpenseTotal = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const monthlyFixedExpenses = currentMonthExpenses
    .filter((expense) => expense.is_recurring)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyDebtPayments = activeDebts.reduce((s, d) => s + d.minimum_payment, 0);

  // ── Prvious month data for trend calculation ─────────────────────────
  const prevMonthDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const prevMonthIncomes = filterByMonth(incomes, prevMonthDate, 'created_at');
  const prevMonthExpenses = filterByMonth(expenses, prevMonthDate, 'date');

  const prevMonthlyIncomeTotal = prevMonthIncomes.reduce((s, i) => s + i.amount, 0);
  const prevMonthlyExpenseTotal = prevMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const prevAvailableFlow = calculateMonthlyBudget(prevMonthlyIncomeTotal, prevMonthlyExpenseTotal) - monthlyDebtPayments;
  const currentAvailableFlow = calculateMonthlyBudget(monthlyIncomeTotal, monthlyExpenseTotal) - monthlyDebtPayments;

  const incomeTrend = {
    ...calculateTrend(monthlyIncomeTotal, prevMonthlyIncomeTotal),
    isPositiveGood: true
  };
  const expenseTrend = {
    ...calculateTrend(monthlyExpenseTotal, prevMonthlyExpenseTotal),
    isPositiveGood: false
  };
  const flowTrend = {
    ...calculateTrend(currentAvailableFlow, prevAvailableFlow),
    isPositiveGood: true
  };

  const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const monthLabel = `${MONTH_NAMES_ES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
  const monthKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;


  // ── Top 3 items ──────────────────────────────────────────────────────────
  const topDebts = [...activeDebts]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 3)
    .map(d => ({ name: d.name, amount: d.balance }));

  const topExpenses = [...currentMonthExpenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map(e => ({ name: e.description || e.category, amount: e.amount }));

  const nonDebtExpenses = currentMonthExpenses.filter((expense) => expense.category !== 'debt');
  const expensesByCategory = nonDebtExpenses.reduce<Record<string, number>>((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort(([categoryA, amountA], [categoryB, amountB]) => {
      const priorityA = CATEGORY_CUT_PRIORITY[categoryA] ?? 2;
      const priorityB = CATEGORY_CUT_PRIORITY[categoryB] ?? 2;
      if (priorityB !== priorityA) {
        return priorityB - priorityA;
      }
      return amountB - amountA;
    })
    .slice(0, 3)
    .map(([categoryValue, amount]) => {
      const category = getCategoryByValue(categoryValue);
      return {
        value: categoryValue,
        name: category?.label || categoryValue,
        amount,
      };
    });

  const avalanche: AvalancheResult | null =
    activeDebts.length > 0 ? calculateAvalanche(debts, totalIncomes, totalExpenses) : null;
  const projectedDebtPayment = avalanche
    ? avalanche.recommendedPayments.reduce((sum, payment) => sum + payment.recommendedPayment, 0)
    : 0;

  const monthlyBudget = calculateMonthlyBudget(monthlyIncomeTotal, monthlyExpenseTotal);
  const autoLiquidityFloor = monthlyFixedExpenses > 0 ? monthlyFixedExpenses : Math.round(monthlyExpenseTotal * 0.5);
  const liquidityFloor = liquidityFloorMode === 'manual' ? manualLiquidityFloor : autoLiquidityFloor;
  const optimisticMonthlyBudget = calculateMonthlyBudget(
    monthlyFixedIncome + monthlyVariableIncome * (1 + variableIncomeDeltaPct / 100),
    monthlyExpenseTotal,
  );
  const conservativeMonthlyBudget = calculateMonthlyBudget(
    monthlyFixedIncome + monthlyVariableIncome * (1 - variableIncomeDeltaPct / 100),
    monthlyExpenseTotal,
  );

  const basePortfolioProjection = simulatePortfolio(activeDebts, 'avalanche', monthlyBudget);
  const optimisticPortfolioProjection = simulatePortfolio(activeDebts, 'avalanche', optimisticMonthlyBudget);
  const conservativePortfolioProjection = simulatePortfolio(activeDebts, 'avalanche', conservativeMonthlyBudget);
  const dashboardNarrative = !avalanche
    ? 'Empieza registrando tus deudas para activar recomendaciones personalizadas de pago.'
    : avalanche.mode === 'NO_BUDGET'
    ? `Este mes estas en alerta: tus gastos consumen tus ingresos. Recupera al menos $${Math.max(0, monthlyDebtPayments - monthlyBudget).toLocaleString('es-MX')} para volver a cubrir minimos.`
    : avalanche.mode === 'CRISIS_NO_MINIMUMS'
    ? `Aun faltan $${Math.max(0, avalanche.sumMinimums - monthlyBudget).toLocaleString('es-MX')} para cubrir pagos minimos. Ajusta gastos flexibles esta semana.`
    : currentAvailableFlow >= 0
    ? `Vas bien: cubres minimos y tienes ${currentAvailableFlow.toLocaleString('es-MX')} de flujo para acelerar tu deuda objetivo.`
    : 'Tu flujo disponible es negativo este mes. Ajusta gastos para proteger tu plan de pago.';

  const incomeSparkline = buildSparkline(incomes, 'created_at');
  const expenseSparkline = buildSparkline(expenses, 'date');
  const monthlyData = buildMonthlyData(incomes, expenses, debts);

  const hasData = incomes.length > 0 || expenses.length > 0 || debts.length > 0;
  const isMonthClosed = !!monthClosures[monthKey];
  const sortedClosureKeys = Object.keys(monthClosures).sort((a, b) => a.localeCompare(b));
  const latestClosureKey = sortedClosureKeys[sortedClosureKeys.length - 1];
  const previousClosureKey = sortedClosureKeys[sortedClosureKeys.length - 2];
  const latestClosure = latestClosureKey ? monthClosures[latestClosureKey] : null;
  const previousClosure = previousClosureKey ? monthClosures[previousClosureKey] : null;
  const recentClosures = sortedClosureKeys.slice(-3).reverse().map((key) => monthClosures[key]);
  const recentFlowValues = recentClosures.map((closure) => closure.availableFlow);
  const maxAbsRecentFlow = recentFlowValues.length > 0
    ? Math.max(...recentFlowValues.map((value) => Math.abs(value)), 1)
    : 1;

  const closureDelta = latestClosure && previousClosure
    ? {
        flow: latestClosure.availableFlow - previousClosure.availableFlow,
        expenses: latestClosure.expenses - previousClosure.expenses,
        debt: latestClosure.totalDebt - previousClosure.totalDebt,
      }
    : null;

  useEffect(() => {
    if (loading || hasData) return;
    const onboardingCompleted = window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    if (!onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [loading, hasData]);

  useEffect(() => {
    if (loading) return;

    const hasCompletedDataSetup = incomes.length > 0 && expenses.length > 0 && debts.length > 0;
    if (!hasCompletedDataSetup) return;

    const onboardingCompleted = window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    if (!onboardingCompleted) {
      window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    }

    if (showOnboarding) {
      setShowOnboarding(false);
    }
  }, [loading, incomes.length, expenses.length, debts.length, showOnboarding]);

  const handleOnboardingComplete = () => {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  };

  useEffect(() => {
    const rawClosures = window.localStorage.getItem(MONTH_CLOSURES_STORAGE_KEY);
    if (!rawClosures) return;

    try {
      const parsed = JSON.parse(rawClosures) as Record<string, MonthClosureSnapshot>;
      setMonthClosures(parsed);
    } catch {
      setMonthClosures({});
    }
  }, []);

  const handleCloseMonth = () => {
    if (isMonthClosed) {
      setShowMonthCloseDialog(false);
      return;
    }

    const snapshot: MonthClosureSnapshot = {
      monthKey,
      monthLabel,
      incomes: monthlyIncomeTotal,
      expenses: monthlyExpenseTotal,
      minimums: monthlyDebtPayments,
      availableFlow: currentAvailableFlow,
      totalDebt,
      activeDebts: activeDebts.length,
      closedAt: new Date().toISOString(),
    };

    const updatedClosures = {
      ...monthClosures,
      [monthKey]: snapshot,
    };

    window.localStorage.setItem(MONTH_CLOSURES_STORAGE_KEY, JSON.stringify(updatedClosures));
    setMonthClosures(updatedClosures);
    setShowMonthCloseDialog(false);
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    addToast(`Mes cerrado: ${monthLabel}. Ahora estas viendo el siguiente mes.`, 'success');
  };

  return (
    <>
      <OnboardingWizard
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={handleOnboardingComplete}
        checklist={{
          hasIncomes: incomes.length > 0,
          hasExpenses: expenses.length > 0,
          hasDebts: debts.length > 0,
        }}
      />
      <MonthCloseDialog
        open={showMonthCloseDialog}
        onOpenChange={setShowMonthCloseDialog}
        onConfirm={handleCloseMonth}
        monthLabel={monthLabel}
        incomes={monthlyIncomeTotal}
        expenses={monthlyExpenseTotal}
        minimums={monthlyDebtPayments}
        availableFlow={currentAvailableFlow}
        activeDebts={activeDebts.length}
        alreadyClosed={isMonthClosed}
      />
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 animate-fade-in mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Resumen Financiero</h1>
          <p className="text-muted-foreground text-sm">Vista general de tu situación financiera actual.</p>
        </div>
        <div className="flex items-center gap-2">
          <MonthSelector
            selectedDate={selectedDate}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
          />
          <Button
            variant={isMonthClosed ? 'outline' : 'default'}
            className="gap-1"
            onClick={() => setShowMonthCloseDialog(true)}
            disabled={!hasData}
          >
            {isMonthClosed ? <CheckCircle2 size={15} /> : null}
            {isMonthClosed ? 'Mes cerrado' : 'Cerrar mes'}
          </Button>
        </div>
      </header>

      {loading ? (
        <>
          <SummarySkeleton />
          <ChartSkeleton />
        </>
      ) : !hasData ? (
        <EmptyState
          icon={LayoutDashboard}
          title="Tu dashboard está vacío"
          description="Comienza registrando tus ingresos para calcular tu flujo disponible y activar recomendaciones de pago."
          iconColorClass="text-primary"
          actionLabel="Agregar ingreso"
          onAction={() => router.push('/incomes')}
        />
      ) : (
        <>
          {/* ─── Zona 1: Hero KPIs — Flujo Libre + Deuda Total ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CashFlowCard
              monthlyIncomes={monthlyIncomeTotal}
              monthlyExpenses={monthlyExpenseTotal}
              monthlyDebtPayments={monthlyDebtPayments}
              monthLabel={monthLabel}
              trend={flowTrend}
              index={0}
            />
            <SummaryCard
              label="Deuda Total"
              value={totalDebt}
              icon={HandCoins}
              accentClass="border-t-debt"
              iconBg="bg-debt/10 text-debt"
              index={1}
              size="hero"
              hint={
                activeDebts.length > 0
                  ? `${activeDebts.length} deuda${activeDebts.length === 1 ? '' : 's'} activa${activeDebts.length === 1 ? '' : 's'}`
                  : 'Sin deudas activas'
              }
              topItems={topDebts}
            />
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 animate-fade-in-up stagger-2">
            <p className="text-[11px] uppercase tracking-wider text-primary font-semibold">Estado financiero del mes</p>
            <p className="mt-1 text-sm text-foreground">{dashboardNarrative}</p>
          </div>

          {/* ─── Zona 2: Contexto — Ingresos, Gastos y Próxima Deuda ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryCard
              label="Ingresos del Mes"
              value={monthlyIncomeTotal}
              icon={DollarSign}
              accentClass="border-t-income"
              iconBg="bg-income/10 text-income"
              sparklineData={incomeSparkline}
              sparklineColor="oklch(0.72 0.17 162)"
              trend={incomeTrend}
              index={2}
            />
            <SummaryCard
              label="Gastos del Mes"
              value={monthlyExpenseTotal}
              icon={CreditCard}
              accentClass="border-t-expense"
              iconBg="bg-expense/10 text-expense"
              sparklineData={expenseSparkline}
              sparklineColor="oklch(0.80 0.15 80)"
              trend={expenseTrend}
              index={3}
              topItems={topExpenses}
            />
            {avalanche && avalanche.orderedDebts.length > 0 ? (
              <NextDebtCard avalanche={avalanche} index={4} />
            ) : (
              <SummaryCard
                label="Próxima Deuda"
                value={0}
                icon={HandCoins}
                accentClass="border-t-muted"
                iconBg="bg-muted/50 text-muted-foreground"
                index={4}
                hint="Sin deudas activas para atacar"
              />
            )}
          </div>

          {avalanche && activeDebts.length > 0 && (
            <DebtHealthCard
              mode={avalanche.mode}
              totalDebt={totalDebt}
              monthlyDebtPayment={projectedDebtPayment}
              monthlyAvailableFlow={currentAvailableFlow}
              sumMinimums={avalanche.sumMinimums}
              weightedInterestRateAnnual={weightedInterestRateAnnual}
              liquidityFloor={liquidityFloor}
              autoLiquidityFloor={autoLiquidityFloor}
              basePortfolioMonths={basePortfolioProjection?.months ?? null}
              optimisticPortfolioMonths={optimisticPortfolioProjection?.months ?? null}
              conservativePortfolioMonths={conservativePortfolioProjection?.months ?? null}
              variableIncomeDeltaPct={variableIncomeDeltaPct}
              onVariableIncomeDeltaChange={setVariableIncomeDeltaPct}
              liquidityFloorMode={liquidityFloorMode}
              onLiquidityFloorModeChange={setLiquidityFloorMode}
              onManualLiquidityFloorChange={setManualLiquidityFloor}
            />
          )}

          {avalanche && (
            <ActionPlanCard
              mode={avalanche.mode}
              monthlyBudget={monthlyBudget}
              minimums={avalanche.sumMinimums}
              topExpenseName={topExpenses[0]?.name}
              topExpenseAmount={topExpenses[0]?.amount}
              suggestedCuts={(() => {
                const shortfall = Math.max(
                  0,
                  avalanche.sumMinimums - monthlyBudget,
                );
                if (shortfall <= 0 || topExpenseCategories.length === 0) return [];

                const eligibleCategories = topExpenseCategories.filter(
                  (category) => !blockedCutCategories.includes(category.value),
                );
                if (eligibleCategories.length === 0) return [];

                let remaining = shortfall;
                const initialPlan = eligibleCategories
                  .map((category) => {
                    const priority = CATEGORY_CUT_PRIORITY[category.value] ?? 2;
                    const maxSuggestedByCategory = Math.ceil(category.amount * 0.35);
                    const targetChunk = Math.ceil(remaining / Math.max(1, eligibleCategories.length));
                    const suggestedAmount = Math.min(category.amount, maxSuggestedByCategory, targetChunk);
                    remaining = Math.max(0, remaining - suggestedAmount);
                    return {
                      value: category.value,
                      name: category.name,
                      suggestedAmount,
                      flexibility: getFlexibilityLabel(priority),
                    };
                  })
                  .filter((item) => item.suggestedAmount > 0);

                if (remaining <= 0) {
                  return initialPlan;
                }

                return initialPlan.map((item) => {
                  if (remaining <= 0) return item;
                  const sourceCategory = eligibleCategories.find((category) => category.name === item.name);
                  if (!sourceCategory) return item;

                  const maxExtra = Math.max(0, sourceCategory.amount - item.suggestedAmount);
                  if (maxExtra <= 0) return item;

                  const add = Math.min(maxExtra, remaining);
                  remaining -= add;
                  return {
                    ...item,
                    suggestedAmount: item.suggestedAmount + add,
                  };
                });
              })()}
              cutCategories={topExpenseCategories.map((category) => ({
                value: category.value,
                name: category.name,
              }))}
              blockedCutCategories={blockedCutCategories}
              onToggleBlockedCategory={handleToggleBlockedCutCategory}
              onGoIncomes={() => router.push('/incomes')}
              onGoExpenses={() => router.push('/expenses')}
              onGoDebts={() => router.push('/debts')}
            />
          )}

          {latestClosure && (
            <div className="rounded-lg border bg-card p-4 animate-fade-in-up stagger-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">Ultimo cierre mensual</p>
                  <p className="text-xs text-muted-foreground">
                    {latestClosure.monthLabel} · cerrado el {new Date(latestClosure.closedAt).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  Snapshot
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div className="rounded-md bg-muted/40 p-2.5">
                  <p className="text-[11px] text-muted-foreground">Flujo</p>
                  <p className={`font-mono font-semibold ${latestClosure.availableFlow >= 0 ? 'text-income' : 'text-expense'}`}>
                    {formatDelta(latestClosure.availableFlow)}
                  </p>
                </div>
                <div className="rounded-md bg-muted/40 p-2.5">
                  <p className="text-[11px] text-muted-foreground">Gastos</p>
                  <p className="font-mono font-semibold text-expense">${latestClosure.expenses.toLocaleString('es-MX')}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-2.5">
                  <p className="text-[11px] text-muted-foreground">Deuda total</p>
                  <p className="font-mono font-semibold text-debt">${latestClosure.totalDebt.toLocaleString('es-MX')}</p>
                </div>
                <div className="rounded-md bg-muted/40 p-2.5">
                  <p className="text-[11px] text-muted-foreground">Deudas activas</p>
                  <p className="font-semibold">{latestClosure.activeDebts}</p>
                </div>
              </div>

              {closureDelta && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Vs cierre anterior: flujo {formatDelta(closureDelta.flow)} · gastos {formatDelta(closureDelta.expenses)} · deuda {formatDelta(closureDelta.debt)}
                </p>
              )}

              {recentClosures.length > 1 && (
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Tendencia ultimos 3 cierres</p>
                  <div className="space-y-2">
                    {recentClosures.map((closure) => (
                      <div key={closure.monthKey} className="grid grid-cols-4 gap-2 text-xs">
                        <p className="font-medium truncate">{closure.monthLabel}</p>
                        <p className={`${closure.availableFlow >= 0 ? 'text-income' : 'text-expense'} font-mono`}>
                          {formatDelta(closure.availableFlow)}
                        </p>
                        <p className="font-mono text-expense">-${closure.expenses.toLocaleString('es-MX')}</p>
                        <p className="font-mono text-debt">${closure.totalDebt.toLocaleString('es-MX')}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {recentClosures.map((closure) => {
                      const width = Math.max(8, Math.round((Math.abs(closure.availableFlow) / maxAbsRecentFlow) * 100));
                      const isSelectedClosureMonth = closure.monthKey === monthKey;
                      return (
                        <button
                          key={`${closure.monthKey}-flowbar`}
                          type="button"
                          className={`flex w-full items-center gap-2 rounded-md px-1 py-1 transition-colors ${
                            isSelectedClosureMonth
                              ? 'bg-primary/10 ring-1 ring-primary/30'
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => {
                            const [year, month] = closure.monthKey.split('-').map(Number);
                            setSelectedDate(new Date(year, month - 1, 1));
                          }}
                          aria-label={`Ir a ${closure.monthLabel}`}
                          aria-pressed={isSelectedClosureMonth}
                        >
                          <span className={`w-12 text-[11px] truncate ${isSelectedClosureMonth ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                            {closure.monthLabel.split(' ')[0]}
                          </span>
                          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${closure.availableFlow >= 0 ? 'bg-income' : 'bg-expense'}`}
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">Columnas: Mes · Flujo · Gastos · Deuda · Toca una fila para ir a ese mes</p>
                </div>
              )}
            </div>
          )}

          {/* ─── Zona 3: Histórico mensual ─── */}
          {monthlyData.length > 0 && <CashFlowChart data={monthlyData} />}
        </>
      )}
    </>
  );
};

export default Dashboard;
