'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, CreditCard, HandCoins, LayoutDashboard } from 'lucide-react';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { fetchAllIncomes } from '@/lib/actions/incomes.action';
import { fetchAllExpenses, syncRecurringExpenses } from '@/lib/actions/expenses.action';
import { fetchAllDebts } from '@/lib/actions/debts.action';
import type { Income } from '@/lib/actions/incomes.action';
import type { Expense } from '@/lib/actions/expenses.action';
import type { Debt } from '@/lib/actions/debts.action';
import { calculateAvalanche } from '@/lib/avalanche';
import type { AvalancheResult } from '@/lib/avalanche';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { NextDebtCard } from '@/components/dashboard/NextDebtCard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { CashFlowCard } from '@/components/dashboard/CashFlowCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SummarySkeleton, ChartSkeleton } from '@/components/incomes/Skeletons';

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
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  // ── Monthly cash flow (selected month) ─────────────────────────────
  const currentMonthIncomes = filterByMonth(incomes, selectedDate, 'created_at');
  const currentMonthExpenses = filterByMonth(expenses, selectedDate, 'date');

  const monthlyIncomeTotal = currentMonthIncomes.reduce((s, i) => s + i.amount, 0);
  const monthlyExpenseTotal = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const monthlyDebtPayments = activeDebts.reduce((s, d) => s + d.minimum_payment, 0);

  // ── Prvious month data for trend calculation ─────────────────────────
  const prevMonthDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
  const prevMonthIncomes = filterByMonth(incomes, prevMonthDate, 'created_at');
  const prevMonthExpenses = filterByMonth(expenses, prevMonthDate, 'date');
  
  const prevMonthlyIncomeTotal = prevMonthIncomes.reduce((s, i) => s + i.amount, 0);
  const prevMonthlyExpenseTotal = prevMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const prevAvailableFlow = prevMonthlyIncomeTotal - prevMonthlyExpenseTotal - monthlyDebtPayments;
  const currentAvailableFlow = monthlyIncomeTotal - monthlyExpenseTotal - monthlyDebtPayments;

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


  // ── Top 3 items ──────────────────────────────────────────────────────────
  const topDebts = [...activeDebts]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 3)
    .map(d => ({ name: d.name, amount: d.balance }));

  const topExpenses = [...currentMonthExpenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map(e => ({ name: e.description || e.category, amount: e.amount }));

  const avalanche: AvalancheResult | null =
    activeDebts.length > 0 ? calculateAvalanche(debts, totalIncomes, totalExpenses) : null;

  const incomeSparkline = buildSparkline(incomes, 'created_at');
  const expenseSparkline = buildSparkline(expenses, 'date');
  const monthlyData = buildMonthlyData(incomes, expenses, debts);

  const hasData = incomes.length > 0 || expenses.length > 0 || debts.length > 0;

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 animate-fade-in mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Resumen Financiero</h1>
          <p className="text-muted-foreground text-sm">Vista general de tu situación financiera actual.</p>
        </div>
        <MonthSelector
          selectedDate={selectedDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
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

          {/* ─── Zona 3: Histórico mensual ─── */}
          {monthlyData.length > 0 && <CashFlowChart data={monthlyData} />}
        </>
      )}
    </>
  );
};

export default Dashboard;
