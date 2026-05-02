'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAllIncomes } from '@/lib/actions/incomes.action';
import { fetchAllExpenses, syncRecurringExpenses } from '@/lib/actions/expenses.action';
import { fetchAllDebts } from '@/lib/actions/debts.action';
import type { Income, Expense, Debt, MonthClosureSnapshot } from '@/types/domain';

// Date filtering utilities
export function filterByMonth<T extends { created_at?: string; date?: string }>(
  items: T[],
  selectedDate: Date,
  dateField: 'created_at' | 'date' = 'created_at'
): T[] {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  return items.filter((item) => {
    const d = new Date(
      (dateField === 'date' && 'date' in item ? item.date : item.created_at) || item.created_at || ''
    );
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
}

export function filterByDateRange<T extends { created_at?: string; date?: string }>(
  items: T[],
  startDate: Date,
  endDate: Date,
  dateField: 'created_at' | 'date' = 'created_at'
): T[] {
  return items.filter((item) => {
    const d = new Date(
      (dateField === 'date' && 'date' in item ? item.date : item.created_at) || item.created_at || ''
    );
    return d >= startDate && d <= endDate;
  });
}

// Calculation utilities
export function calculateTrend(current: number, previous: number): { value: number } {
  if (previous === 0) {
    if (current === 0) return { value: 0 };
    return { value: 100 };
  }
  return { value: ((current - previous) / previous) * 100 };
}

export function calculateMonthlyBudget(totalIncome: number, totalExpenses: number): number {
  return Math.max(0, totalIncome - totalExpenses);
}

export function calculateWeightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length || weights.length === 0) return 0;
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  if (totalWeight === 0) return 0;
  return values.reduce((s, v, i) => s + v * weights[i], 0) / totalWeight;
}

// Build sparkline data from items
export function buildSparkline(
  items: Array<{ created_at?: string; date?: string; amount: number }>,
  dateField: 'created_at' | 'date' = 'created_at'
): number[] {
  const byMonth: Record<string, number> = {};
  const today = new Date();
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    byMonth[key] = 0;
  }
  
  for (const item of items) {
    const d = new Date(
      (dateField === 'date' && 'date' in item ? item.date : item.created_at) || item.created_at || ''
    );
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in byMonth) {
      byMonth[key] += item.amount;
    }
  }
  
  return Object.keys(byMonth)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => byMonth[key]);
}

// Build monthly data for charts
export interface MonthlyChartData {
  month: string;
  incomes: number;
  expenses: number;
  debtPayments: number;
}

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function buildMonthlyChartData(
  incomes: Income[],
  expenses: Expense[]
): MonthlyChartData[] {
  const months: Record<string, MonthlyChartData> = {};
  const today = new Date();

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = {
      month: MONTH_NAMES[d.getMonth()],
      incomes: 0,
      expenses: 0,
      debtPayments: 0
    };
  }

  // Aggregate incomes
  for (const income of incomes) {
    const d = new Date(income.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) months[key].incomes += income.amount;
  }

  // Aggregate expenses (non-debt)
  for (const expense of expenses) {
    const d = new Date(expense.date || expense.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) {
      if (expense.category === 'debt') {
        months[key].debtPayments += expense.amount;
      } else {
        months[key].expenses += expense.amount;
      }
    }
  }

  return Object.keys(months)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => months[key]);
}

// Calculate category totals
export interface CategoryTotal {
  value: string;
  name: string;
  amount: number;
}

export function calculateCategoryTotals(
  expenses: Expense[],
  getCategoryLabel: (value: string) => { label: string } | undefined
): CategoryTotal[] {
  const totals: Record<string, number> = {};
  
  const nonDebtExpenses = expenses.filter(e => e.category !== 'debt');
  
  for (const expense of nonDebtExpenses) {
    totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
  }

  return Object.entries(totals)
    .map(([value, amount]) => ({
      value,
      name: getCategoryLabel(value)?.label || value,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// Main hook for financial data
export interface UseFinancialDataResult {
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  loading: boolean;
  refresh: () => Promise<void>;
  // Computed values
  monthlyIncomes: (month: Date) => Income[];
  monthlyExpenses: (month: Date) => Expense[];
  monthlyDebtPayments: (month: Date) => number;
  monthlyNonDebtExpenses: (month: Date) => number;
  activeDebts: Debt[];
  totalDebt: number;
}

export function useFinancialData(): UseFinancialDataResult {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    await syncRecurringExpenses();
    
    const [incomeRes, expenseRes, debtRes] = await Promise.all([
      fetchAllIncomes(),
      fetchAllExpenses(),
      fetchAllDebts(),
    ]);

    setIncomes(incomeRes.data || []);
    setExpenses(expenseRes.data || []);
    setDebts(debtRes.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper functions for filtered data
  const monthlyIncomes = useCallback((month: Date) => 
    filterByMonth(incomes, month, 'created_at'), [incomes]);
  
  const monthlyExpenses = useCallback((month: Date) => 
    filterByMonth(expenses, month, 'date'), [expenses]);
  
  const monthlyDebtPayments = useCallback((month: Date) => {
    const monthExpenses = filterByMonth(expenses, month, 'date');
    return monthExpenses
      .filter(e => e.category === 'debt')
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);
  
  const monthlyNonDebtExpenses = useCallback((month: Date) => {
    const monthExpenses = filterByMonth(expenses, month, 'date');
    return monthExpenses
      .filter(e => e.category !== 'debt')
      .reduce((s, e) => s + e.amount, 0);
  }, [expenses]);

  const activeDebts = debts.filter(d => d.balance > 0);
  const totalDebt = activeDebts.reduce((s, d) => s + d.balance, 0);

  return {
    incomes,
    expenses,
    debts,
    loading,
    refresh: loadData,
    monthlyIncomes,
    monthlyExpenses,
    monthlyDebtPayments,
    monthlyNonDebtExpenses,
    activeDebts,
    totalDebt,
  };
}

// Storage keys for persistence
export const STORAGE_KEYS = {
  ONBOARDING: 'debtflow_onboarding_completed_v1',
  MONTH_CLOSURES: 'debtflow_month_closures_v1',
  BLOCKED_CUT_CATEGORIES: 'debtflow_blocked_cut_categories_v1',
  VARIABLE_INCOME_DELTA: 'debtflow_variable_income_delta_pct_v1',
  LIQUIDITY_FLOOR_MODE: 'debtflow_liquidity_floor_mode_v1',
  LIQUIDITY_FLOOR_MANUAL: 'debtflow_liquidity_floor_manual_v1',
  SCENARIO_DELTA: 'debtflow_scenario_delta_v1',
  WHAT_IF_EXTRA: 'debtflow_what_if_extra_v1',
} as const;

// Safe localStorage access
export function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored) as T;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}