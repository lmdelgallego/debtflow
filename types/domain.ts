// Domain types for DebtFlow financial application

// Income types
export interface Income {
  id: string;
  type: 'fixed' | 'variable';
  amount: number;
  description?: string;
  created_at: string;
}

export interface PaginatedIncomes {
  data: Income[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Expense types
export interface Expense {
  id: string;
  category: string;
  subcategory?: string;
  description?: string;
  amount: number;
  date: string;
  is_recurring?: boolean;
  created_at: string;
}

export interface PaginatedExpenses {
  data: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Debt types
export interface Debt {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  payment_day: number;
  created_at: string;
}

export interface PaginatedDebts {
  data: Debt[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Financial calculation types
export type PayoffMethod = 'avalanche' | 'snowball';
export type BudgetHealthMode = 'NORMAL' | 'CRISIS_NO_MINIMUMS' | 'NO_BUDGET';
export type AvalancheMode = 'NORMAL' | 'CRISIS_NO_MINIMUMS' | 'NO_BUDGET';

export interface SingleDebtProjection {
  monthlyPayment: number;
  months: number;
  totalPaid: number;
  totalInterest: number;
  payoffDate?: Date;
}

export interface PortfolioProjection {
  months: number;
  totalPaid: number;
  totalInterest: number;
  payoffDate: Date;
}

export interface RecommendedPayment {
  debtId: string;
  debtName: string;
  minimumPayment: number;
  recommendedPayment: number;
  extraApplied: number;
  projectedBalance: number;
  isTarget: boolean;
}

export interface AvalancheResult {
  monthlyDebtBudget: number;
  sumMinimums: number;
  orderedDebts: Debt[];
  recommendedPayments: RecommendedPayment[];
  nextTargetDebtId: string | null;
  mode: AvalancheMode;
}

// Monthly closure types
export interface MonthClosureSnapshot {
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

// Dashboard summary types
export interface MonthlySummary {
  month: string;
  incomes: number;
  expenses: number;
  debtPayments: number;
}

export interface TrendData {
  value: number;
}

export interface CategoryTotal {
  value: string;
  name: string;
  amount: number;
}

// Filter and date helper types
export type DateField = 'created_at' | 'date';

export interface DateRange {
  startDate: string;
  endDate: string;
}

// Chart data types
export interface MonthlyChartData {
  month: string;
  incomes: number;
  expenses: number;
  debtPayments: number;
}