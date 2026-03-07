'use client';

import { useState, useEffect } from 'react';
import { DollarSign, CreditCard, HandCoins, Wallet, LayoutDashboard, AlertTriangle, TrendingDown } from 'lucide-react';
import { fetchAllIncomes } from '@/lib/actions/incomes.action';
import { fetchAllExpenses } from '@/lib/actions/expenses.action';
import { fetchAllDebts } from '@/lib/actions/debts.action';
import type { Income } from '@/lib/actions/incomes.action';
import type { Expense } from '@/lib/actions/expenses.action';
import type { Debt } from '@/lib/actions/debts.action';
import { calculateAvalanche } from '@/lib/avalanche';
import type { AvalancheResult } from '@/lib/avalanche';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function buildSparkline(items: Array<{ created_at?: string; date?: string; amount: number }>, dateField: 'created_at' | 'date' = 'created_at') {
  const byMonth: Record<string, number> = {};
  for (const item of items) {
    const d = new Date((dateField === 'date' && 'date' in item ? item.date : item.created_at) || item.created_at || '');
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = (byMonth[key] || 0) + item.amount;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => v);
}

function AvalancheCard({ avalanche }: { avalanche: AvalancheResult }) {
  const modeLabels: Record<string, string> = {
    NORMAL: 'Normal',
    CRISIS_NO_MINIMUMS: 'Crisis',
    NO_BUDGET: 'Sin presupuesto',
  };

  return (
    <Card className="border-t-2 border-t-debt animate-fade-in-up">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-debt/10 text-debt">
            <TrendingDown size={20} />
          </div>
          Recomendación Avalancha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Presupuesto para deudas</p>
            <p className="font-semibold font-mono">${avalanche.monthlyDebtBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total mínimos</p>
            <p className="font-semibold font-mono">${avalanche.sumMinimums.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Modo</p>
            <p className="font-semibold">{modeLabels[avalanche.mode]}</p>
          </div>
        </div>

        {avalanche.mode === 'CRISIS_NO_MINIMUMS' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-expense/10 border border-expense/20">
            <AlertTriangle size={16} className="text-expense mt-0.5 shrink-0" />
            <p className="text-sm text-expense">
              Tu presupuesto no alcanza para cubrir los pagos mínimos. Se recomienda revisar tus gastos.
            </p>
          </div>
        )}

        {avalanche.mode === 'NO_BUDGET' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-expense/10 border border-expense/20">
            <AlertTriangle size={16} className="text-expense mt-0.5 shrink-0" />
            <p className="text-sm text-expense">
              No hay presupuesto disponible para deudas. Tus gastos igualan o superan tus ingresos.
            </p>
          </div>
        )}

        {avalanche.recommendedPayments.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Pagos recomendados</p>
            {avalanche.recommendedPayments.map((payment) => (
              <div
                key={payment.debtId}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  payment.isTarget
                    ? 'border-debt bg-debt/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{payment.debtName}</span>
                  {payment.isTarget && (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-debt/15 text-debt">
                      Prioridad
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold font-mono text-sm">
                    ${payment.recommendedPayment.toLocaleString()}
                  </p>
                  {payment.extraApplied > 0 && (
                    <p className="text-xs text-muted-foreground">
                      +${payment.extraApplied.toLocaleString()} extra
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
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
    return () => { cancelled = true; };
  }, []);

  const totalIncomes = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const cashFlow = totalIncomes - totalExpenses;
  const totalDebt = debts.filter(d => d.balance > 0).reduce((s, d) => s + d.balance, 0);

  const avalanche = debts.length > 0
    ? calculateAvalanche(debts, totalIncomes, totalExpenses)
    : null;

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Ingresos Totales"
              value={totalIncomes}
              icon={DollarSign}
              accentClass="border-t-income"
              iconBg="bg-income/10 text-income"
              sparklineData={incomeSparkline}
              sparklineColor="oklch(0.72 0.17 162)"
              index={0}
            />
            <SummaryCard
              label="Gastos Totales"
              value={totalExpenses}
              icon={CreditCard}
              accentClass="border-t-expense"
              iconBg="bg-expense/10 text-expense"
              sparklineData={expenseSparkline}
              sparklineColor="oklch(0.80 0.15 80)"
              index={1}
            />
            <SummaryCard
              label="Flujo Disponible"
              value={cashFlow}
              icon={Wallet}
              accentClass="border-t-[var(--primary)]"
              iconBg="bg-primary/10 text-primary"
              index={2}
            />
            <SummaryCard
              label="Deuda Total"
              value={totalDebt}
              icon={HandCoins}
              accentClass="border-t-debt"
              iconBg="bg-debt/10 text-debt"
              index={3}
            />
          </div>

          {monthlyData.length > 0 && (
            <CashFlowChart data={monthlyData} />
          )}

          {avalanche && avalanche.orderedDebts.length > 0 && (
            <AvalancheCard avalanche={avalanche} />
          )}
        </>
      )}
    </>
  );
};

export default Dashboard;
