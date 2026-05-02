'use client';

import { useMemo } from 'react';
import type { 
  Income, 
  Expense, 
  Debt, 
  AvalancheResult, 
  BudgetHealthMode,
  TrendData 
} from '@/types/domain';
import { 
  calculateAvalanche 
} from '@/lib/avalanche';
import { 
  calculateMonthlyBudget, 
  calculateWeightedInterestRate, 
  simulatePortfolio,
  determineBudgetHealthMode
} from '@/lib/payoff';
import { 
  filterByMonth, 
  calculateTrend, 
  calculateWeightedAverage 
} from './useFinancialData';

export interface FinancialCalculations {
  // Income calculations
  monthlyIncomeTotal: number;
  monthlyFixedIncome: number;
  monthlyVariableIncome: number;
  incomeTrend: TrendData;
  
  // Expense calculations
  monthlyExpenseTotal: number;
  monthlyFixedExpenses: number;
  monthlyDebtPayments: number;
  expenseTrend: TrendData;
  
  // Debt calculations
  activeDebts: Debt[];
  totalDebt: number;
  weightedInterestRate: number;
  sumMinimums: number;
  
  // Cash flow
  grossFlow: number;
  availableFlow: number;
  flowTrend: TrendData;
  
  // Projections
  avalanche: AvalancheResult | null;
  monthlyBudget: number;
  budgetMode: BudgetHealthMode;
  portfolioProjection: ReturnType<typeof simulatePortfolio> | null;
  
  // Trends by month
  prevMonthIncome: number;
  prevMonthNonDebtExpenses: number;
  prevMonthDebtPayments: number;
  prevAvailableFlow: number;
}

interface UseFinancialCalculationsParams {
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  selectedDate: Date;
  variableIncomeDeltaPct: number;
}

export function useFinancialCalculations({
  incomes,
  expenses,
  debts,
  selectedDate,
  variableIncomeDeltaPct,
}: UseFinancialCalculationsParams): FinancialCalculations {
  
  // Current month data
  const currentMonthIncomes = useMemo(() => 
    filterByMonth(incomes, selectedDate, 'created_at'), 
    [incomes, selectedDate]
  );
  
  const currentMonthExpenses = useMemo(() => 
    filterByMonth(expenses, selectedDate, 'date'), 
    [expenses, selectedDate]
  );
  
  // Income calculations
  const monthlyIncomeTotal = useMemo(() => 
    currentMonthIncomes.reduce((s, i) => s + i.amount, 0), 
    [currentMonthIncomes]
  );
  
  const monthlyFixedIncome = useMemo(() => 
    currentMonthIncomes.filter(i => i.type === 'fixed').reduce((s, i) => s + i.amount, 0),
    [currentMonthIncomes]
  );
  
  const monthlyVariableIncome = useMemo(() => 
    currentMonthIncomes.filter(i => i.type === 'variable').reduce((s, i) => s + i.amount, 0),
    [currentMonthIncomes]
  );
  
  // Debt payments this month (actual, not configured minimums)
  const monthlyDebtPayments = useMemo(() => 
    currentMonthExpenses.filter(e => e.category === 'debt').reduce((s, e) => s + e.amount, 0),
    [currentMonthExpenses]
  );
  
  // Non-debt expenses
  const monthlyExpenseTotal = useMemo(() => 
    currentMonthExpenses.filter(e => e.category !== 'debt').reduce((s, e) => s + e.amount, 0),
    [currentMonthExpenses]
  );
  
  const monthlyFixedExpenses = useMemo(() => 
    currentMonthExpenses
      .filter(e => e.is_recurring && e.category !== 'debt')
      .reduce((s, e) => s + e.amount, 0),
    [currentMonthExpenses]
  );
  
  // Active debts
  const activeDebts = useMemo(() => debts.filter(d => d.balance > 0), [debts]);
  const totalDebt = useMemo(() => activeDebts.reduce((s, d) => s + d.balance, 0), [activeDebts]);
  const weightedInterestRate = useMemo(() => calculateWeightedInterestRate(activeDebts), [activeDebts]);
  const sumMinimums = useMemo(() => activeDebts.reduce((s, d) => s + d.minimum_payment, 0), [activeDebts]);
  
  // Cash flow
  const monthlyBudget = useMemo(() => calculateMonthlyBudget(monthlyIncomeTotal, monthlyExpenseTotal), [monthlyIncomeTotal, monthlyExpenseTotal]);
  const grossFlow = useMemo(() => monthlyIncomeTotal - monthlyExpenseTotal, [monthlyIncomeTotal, monthlyExpenseTotal]);
  const availableFlow = useMemo(() => grossFlow - monthlyDebtPayments, [grossFlow, monthlyDebtPayments]);
  
  // Previous month for trends
  const prevMonthDate = useMemo(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1), [selectedDate]);
  const prevMonthIncomes = useMemo(() => filterByMonth(incomes, prevMonthDate, 'created_at'), [incomes, prevMonthDate]);
  const prevMonthAllExpenses = useMemo(() => filterByMonth(expenses, prevMonthDate, 'date'), [expenses, prevMonthDate]);
  
  const prevMonthIncome = useMemo(() => prevMonthIncomes.reduce((s, i) => s + i.amount, 0), [prevMonthIncomes]);
  const prevMonthNonDebtExpenses = useMemo(() => prevMonthAllExpenses.filter(e => e.category !== 'debt').reduce((s, e) => s + e.amount, 0), [prevMonthAllExpenses]);
  const prevMonthDebtPayments = useMemo(() => prevMonthAllExpenses.filter(e => e.category === 'debt').reduce((s, e) => s + e.amount, 0), [prevMonthAllExpenses]);
  const prevAvailableFlow = useMemo(() => calculateMonthlyBudget(prevMonthIncome, prevMonthNonDebtExpenses) - prevMonthDebtPayments, [prevMonthIncome, prevMonthNonDebtExpenses, prevMonthDebtPayments]);
  
  // Trends
  const incomeTrend = useMemo(() => ({
    ...calculateTrend(monthlyIncomeTotal, prevMonthIncome),
    isPositiveGood: true,
  }), [monthlyIncomeTotal, prevMonthIncome]);
  
  const expenseTrend = useMemo(() => ({
    ...calculateTrend(monthlyExpenseTotal, prevMonthNonDebtExpenses),
    isPositiveGood: false,
  }), [monthlyExpenseTotal, prevMonthNonDebtExpenses]);
  
  const flowTrend = useMemo(() => ({
    ...calculateTrend(availableFlow, prevAvailableFlow),
    isPositiveGood: true,
  }), [availableFlow, prevAvailableFlow]);
  
  // Avalanche and projections
  const avalanche = useMemo(() => {
    if (activeDebts.length === 0) return null;
    return calculateAvalanche(debts, monthlyIncomeTotal, monthlyExpenseTotal);
  }, [activeDebts.length, debts, monthlyIncomeTotal, monthlyExpenseTotal]);
  
  const budgetMode = useMemo(() => determineBudgetHealthMode(monthlyBudget, sumMinimums), [monthlyBudget, sumMinimums]);
  
  const portfolioProjection = useMemo(() => {
    if (monthlyBudget <= 0 || activeDebts.length === 0) return null;
    return simulatePortfolio(activeDebts, 'avalanche', monthlyBudget);
  }, [monthlyBudget, activeDebts]);
  
  return {
    monthlyIncomeTotal,
    monthlyFixedIncome,
    monthlyVariableIncome,
    incomeTrend,
    monthlyExpenseTotal,
    monthlyFixedExpenses,
    monthlyDebtPayments,
    expenseTrend,
    activeDebts,
    totalDebt,
    weightedInterestRate,
    sumMinimums,
    grossFlow,
    availableFlow,
    flowTrend,
    avalanche,
    monthlyBudget,
    budgetMode,
    portfolioProjection,
    prevMonthIncome,
    prevMonthNonDebtExpenses: prevMonthNonDebtExpenses,
    prevMonthDebtPayments,
    prevAvailableFlow,
  };
}

// Additional calculation hook for debt-specific scenarios
export interface DebtScenarioCalculations {
  basePortfolioMonths: number | null;
  optimisticPortfolioMonths: number | null;
  conservativePortfolioMonths: number | null;
  basePayoffDate: Date | null;
  optimisticPayoffDate: Date | null;
  conservativePayoffDate: Date | null;
}

export function useDebtScenarioCalculations(
  activeDebts: Debt[],
  monthlyBudget: number,
  fixedIncome: number,
  variableIncome: number,
  variableIncomeDeltaPct: number
): DebtScenarioCalculations {
  
  const optimisticBudget = useMemo(() => 
    calculateMonthlyBudget(fixedIncome + variableIncome * (1 + variableIncomeDeltaPct / 100), 0),
    [fixedIncome, variableIncome, variableIncomeDeltaPct]
  );
  
  const conservativeBudget = useMemo(() => 
    calculateMonthlyBudget(fixedIncome + variableIncome * (1 - variableIncomeDeltaPct / 100), 0),
    [fixedIncome, variableIncome, variableIncomeDeltaPct]
  );
  
  const basePortfolio = useMemo(() => 
    monthlyBudget > 0 ? simulatePortfolio(activeDebts, 'avalanche', monthlyBudget) : null,
    [activeDebts, monthlyBudget]
  );
  
  const optimisticPortfolio = useMemo(() => 
    optimisticBudget > 0 ? simulatePortfolio(activeDebts, 'avalanche', optimisticBudget) : null,
    [activeDebts, optimisticBudget]
  );
  
  const conservativePortfolio = useMemo(() => 
    conservativeBudget > 0 ? simulatePortfolio(activeDebts, 'avalanche', conservativeBudget) : null,
    [activeDebts, conservativeBudget]
  );
  
  return {
    basePortfolioMonths: basePortfolio?.months ?? null,
    optimisticPortfolioMonths: optimisticPortfolio?.months ?? null,
    conservativePortfolioMonths: conservativePortfolio?.months ?? null,
    basePayoffDate: basePortfolio?.payoffDate ?? null,
    optimisticPayoffDate: optimisticPortfolio?.payoffDate ?? null,
    conservativePayoffDate: conservativePortfolio?.payoffDate ?? null,
  };
}