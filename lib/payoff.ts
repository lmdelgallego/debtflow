import type { Debt } from '@/lib/actions/debts.action';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PayoffMethod = 'avalanche' | 'snowball';
export type BudgetHealthMode = 'NORMAL' | 'CRISIS_NO_MINIMUMS' | 'NO_BUDGET';

export interface SingleDebtProjection {
  /** Monthly payment used for this projection */
  monthlyPayment: number;
  months: number;
  totalPaid: number;
  totalInterest: number;
  /** undefined when it cannot be computed (0 payment, infinite) */
  payoffDate?: Date;
}

export interface PortfolioProjection {
  months: number;
  totalPaid: number;
  totalInterest: number;
  payoffDate: Date;
}

export interface MethodComparison {
  avalanche: PortfolioProjection;
  snowball: PortfolioProjection;
  /** Months saved by choosing avalanche over snowball (positive = avalanche faster) */
  monthsDelta: number;
  /** Interest saved by choosing avalanche over snowball (positive = avalanche saves money) */
  interestDelta: number;
}

export interface SimplePayoffEstimateInput {
  totalDebt: number;
  monthlyPayment: number;
  monthlyRate: number;
}

export function calculateMonthlyBudget(totalIncome: number, totalExpenses: number): number {
  return Math.max(0, totalIncome - totalExpenses);
}

export function determineBudgetHealthMode(
  monthlyBudget: number,
  sumMinimums: number,
): BudgetHealthMode {
  if (monthlyBudget <= 0) return 'NO_BUDGET';
  if (monthlyBudget < sumMinimums) return 'CRISIS_NO_MINIMUMS';
  return 'NORMAL';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sortDebts(debts: Debt[], method: PayoffMethod): Debt[] {
  const active = debts.filter((d) => d.balance > 0);
  if (method === 'avalanche') {
    return [...active].sort((a, b) =>
      b.interest_rate !== a.interest_rate
        ? b.interest_rate - a.interest_rate
        : a.balance - b.balance,
    );
  }
  return [...active].sort((a, b) =>
    a.balance !== b.balance
      ? a.balance - b.balance
      : b.interest_rate - a.interest_rate,
  );
}

export function calculateWeightedInterestRate(debts: Debt[]): number {
  const activeDebts = debts.filter((debt) => debt.balance > 0);
  const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.balance, 0);

  if (totalDebt <= 0) return 0;

  return (
    activeDebts.reduce((sum, debt) => sum + debt.interest_rate * debt.balance, 0) /
    totalDebt
  );
}

export function simulateDebtPayoffMonths({
  totalDebt,
  monthlyPayment,
  monthlyRate,
}: SimplePayoffEstimateInput): number | null {
  if (totalDebt <= 0 || monthlyPayment <= 0) return null;

  if (monthlyRate === 0) {
    return Math.ceil(totalDebt / monthlyPayment);
  }

  let remainingDebt = totalDebt;
  let months = 0;
  const maxMonths = 1200;

  while (remainingDebt > 0 && months < maxMonths) {
    const monthlyInterest = remainingDebt * monthlyRate;
    if (monthlyPayment <= monthlyInterest) {
      return null;
    }

    remainingDebt = remainingDebt + monthlyInterest - monthlyPayment;
    months += 1;
  }

  return remainingDebt <= 0 ? months : null;
}

export function estimatePayoffDateFromMonths(months: number): Date {
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);
  return payoffDate;
}

// ─── Single debt payoff projection ───────────────────────────────────────────

/**
 * Projects when a single debt will be paid off given a fixed monthly payment.
 * Uses analytical formula when possible, month-by-month simulation as fallback.
 */
export function projectSingleDebt(
  debt: Debt,
  monthlyPayment: number,
): SingleDebtProjection | null {
  if (monthlyPayment <= 0 || debt.balance <= 0) return null;

  const monthlyRate = debt.interest_rate / 100 / 12;

  const months = simulateDebtPayoffMonths({
    totalDebt: debt.balance,
    monthlyPayment,
    monthlyRate,
  });

  if (!months) return null;

  let totalInterest = 0;
  let balance = debt.balance;
  let elapsed = 0;

  while (balance > 0 && elapsed < months) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    balance += interest;
    balance -= Math.min(monthlyPayment, balance);
    balance = Math.max(0, Math.round(balance * 100) / 100);
    elapsed += 1;
  }

  const totalPaid = debt.balance + totalInterest;
  const payoffDate = estimatePayoffDateFromMonths(months);

  return {
    monthlyPayment,
    months,
    totalPaid,
    totalInterest,
    payoffDate,
  };
}

// ─── Full portfolio simulation ────────────────────────────────────────────────

/**
 * Simulates paying off ALL debts sorted by method, with avalanche/snowball rollover.
 * Monthly budget = max(0, totalIncome - totalExpenses). If 0, returns null.
 */
export function simulatePortfolio(
  debts: Debt[],
  method: PayoffMethod,
  monthlyBudget: number,
): PortfolioProjection | null {
  if (monthlyBudget <= 0) return null;

  const sorted = sortDebts(debts, method);
  if (sorted.length === 0) return null;

  // Mutable working state
  const balances = sorted.map((d) => d.balance);
  let totalPaid = 0;
  let totalInterest = 0;
  let months = 0;
  const MAX_MONTHS = 600; // safety cap: 50 years

  while (balances.some((b) => b > 0) && months < MAX_MONTHS) {
    months++;

    // 1. Accrue monthly interest on all active debts
    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] > 0) {
        const monthlyRate = sorted[i].interest_rate / 100 / 12;
        const interest = Math.round(balances[i] * monthlyRate * 100) / 100;
        balances[i] += interest;
        totalInterest += interest;
      }
    }

    // 2. Compute total minimums due this month across all active debts
    const totalMinsDue = sorted.reduce(
      (s, d, i) => s + (balances[i] > 0 ? Math.min(d.minimum_payment, balances[i]) : 0),
      0,
    );

    let remaining = monthlyBudget;

    if (remaining >= totalMinsDue) {
      // Normal mode: budget covers all minimums.
      // Pay every debt its minimum first, then dump the surplus on the target.
      for (let i = 0; i < sorted.length; i++) {
        if (balances[i] > 0) {
          const minPayment = Math.min(sorted[i].minimum_payment, balances[i]);
          balances[i] = Math.max(0, Math.round((balances[i] - minPayment) * 100) / 100);
          totalPaid += minPayment;
          remaining -= minPayment;
        }
      }

      // 3. Apply extra budget to the target debt (first with balance > 0)
      for (let i = 0; i < sorted.length; i++) {
        if (balances[i] > 0 && remaining > 0) {
          const extraPayment = Math.min(balances[i], remaining);
          balances[i] = Math.max(0, Math.round((balances[i] - extraPayment) * 100) / 100);
          totalPaid += extraPayment;
          remaining -= extraPayment;
          break;
        }
      }
    } else {
      // Crisis mode: budget doesn't cover all minimums.
      // Distribute proportionally so every active debt gets some payment.
      for (let i = 0; i < sorted.length; i++) {
        if (balances[i] > 0 && totalMinsDue > 0) {
          const minDue = Math.min(sorted[i].minimum_payment, balances[i]);
          const proportional = Math.round(
            (monthlyBudget * (minDue / totalMinsDue)) * 100,
          ) / 100;
          const payment = Math.min(proportional, balances[i]);
          balances[i] = Math.max(0, Math.round((balances[i] - payment) * 100) / 100);
          totalPaid += payment;
        }
      }
    }
  }

  if (months >= MAX_MONTHS) return null; // didn't converge

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);

  return { months, totalPaid, totalInterest, payoffDate };
}

// ─── Side-by-side comparison ─────────────────────────────────────────────────

export function compareMethodsPayoff(
  debts: Debt[],
  monthlyBudget: number,
): MethodComparison | null {
  const avalanche = simulatePortfolio(debts, 'avalanche', monthlyBudget);
  const snowball = simulatePortfolio(debts, 'snowball', monthlyBudget);

  if (!avalanche || !snowball) return null;

  return {
    avalanche,
    snowball,
    monthsDelta: snowball.months - avalanche.months,
    interestDelta: snowball.totalInterest - avalanche.totalInterest,
  };
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function formatMonths(months: number): string {
  if (months <= 0) return '0 meses';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${months} mes${months === 1 ? '' : 'es'}`;
  if (remainingMonths === 0) return `${years} año${years === 1 ? '' : 's'}`;
  return `${years} año${years === 1 ? '' : 's'} y ${remainingMonths} mes${remainingMonths === 1 ? '' : 'es'}`;
}

export function formatPayoffDate(date: Date): string {
  return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
}
