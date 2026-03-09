'use client';

import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, HandCoins, LayoutDashboard } from 'lucide-react';
import { fetchAllIncomes } from '@/lib/actions/incomes.action';
import { fetchAllExpenses } from '@/lib/actions/expenses.action';
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

function buildMonthlyData(incomes: Income[], expenses: Expense[]) {
  const months: Record<string, { ingresos: number; gastos: number }> = {};

  for (const income of incomes) {
    const d = new Date(income.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { ingresos: 0, gastos: 0 };
    months[key].ingresos += income.amount;
  }

  for (const expense of expenses) {
    const d = new Date(expense.date || expense.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!months[key]) months[key] = { ingresos: 0, gastos: 0 };
    months[key].gastos += expense.amount;
  }

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([key, val]) => {
      const [, m] = key.split('-');
      return {
        month: monthNames[parseInt(m) - 1],
        ingresos: val.ingresos,
        gastos: val.gastos,
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

function filterCurrentMonth<T extends { created_at?: string; date?: string }>(
  items: T[],
  dateField: 'created_at' | 'date' = 'created_at',
): T[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  return items.filter((item) => {
    const d = new Date(
      (dateField === 'date' && 'date' in item ? item.date : item.created_at) || item.created_at || '',
    );
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
}

const Dashboard = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
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

  const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const activeDebts = debts.filter((d) => d.balance > 0);
  const totalDebt = activeDebts.reduce((s, d) => s + d.balance, 0);

  // ── Monthly cash flow (current month only) ─────────────────────────────
  const monthlyIncomeTotal = filterCurrentMonth(incomes, 'created_at').reduce((s, i) => s + i.amount, 0);
  const monthlyExpenseTotal = filterCurrentMonth(expenses, 'date').reduce((s, e) => s + e.amount, 0);
  const monthlyDebtPayments = activeDebts.reduce((s, d) => s + d.minimum_payment, 0);

  const now = new Date();
  const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const monthLabel = `${MONTH_NAMES_ES[now.getMonth()]} ${now.getFullYear()}`;

  const avalanche: AvalancheResult | null =
    activeDebts.length > 0 ? calculateAvalanche(debts, totalIncomes, totalExpenses) : null;

  const incomeSparkline = buildSparkline(incomes, 'created_at');
  const expenseSparkline = buildSparkline(expenses, 'date');
  const monthlyData = buildMonthlyData(incomes, expenses);

  const hasData = incomes.length > 0 || expenses.length > 0 || debts.length > 0;

  return (
    <>
      <header className="space-y-1 animate-fade-in">
        <h1 className="text-2xl font-semibold">Resumen Financiero</h1>
        <p className="text-muted-foreground text-sm">Vista general de tu situación financiera actual.</p>
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
          description="Agrega tus ingresos y gastos para ver un resumen completo de tu situación financiera."
          iconColorClass="text-primary"
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
            />
          </div>

          {/* ─── Zona 2: Contexto — Ingresos, Gastos y Próxima Deuda ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryCard
              label="Ingresos Totales"
              value={totalIncomes}
              icon={DollarSign}
              accentClass="border-t-income"
              iconBg="bg-income/10 text-income"
              sparklineData={incomeSparkline}
              sparklineColor="oklch(0.72 0.17 162)"
              index={2}
            />
            <SummaryCard
              label="Gastos Totales"
              value={totalExpenses}
              icon={CreditCard}
              accentClass="border-t-expense"
              iconBg="bg-expense/10 text-expense"
              sparklineData={expenseSparkline}
              sparklineColor="oklch(0.80 0.15 80)"
              index={3}
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
