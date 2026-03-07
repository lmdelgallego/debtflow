import type { Debt } from '@/lib/actions/debts.action';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PayoffMethod = 'avalanche' | 'snowball';

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

  // Check if payment covers at least the monthly interest
  const monthlyInterestOnly = debt.balance * monthlyRate;
  if (monthlyPayment <= monthlyInterestOnly && debt.interest_rate > 0) {
    // Payment doesn't even cover interest — debt grows forever
    return null;
  }

  let months: number;
  let totalInterest = 0;

  if (monthlyRate === 0) {
    months = Math.ceil(debt.balance / monthlyPayment);
    totalInterest = 0;
  } else {
    // Analytical: n = -ln(1 - (B*r)/P) / ln(1 + r)
    months = Math.ceil(
      -Math.log(1 - (debt.balance * monthlyRate) / monthlyPayment) /
        Math.log(1 + monthlyRate),
    );
    // Simulate to get exact interest paid
    let balance = debt.balance;
    for (let m = 0; m < months; m++) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest;
      balance -= Math.min(monthlyPayment, balance);
      balance = Math.max(0, Math.round(balance * 100) / 100);
      if (balance === 0) break;
    }
  }

  const totalPaid = debt.balance + totalInterest;
  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);

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

    // 2. Apply minimum payments to all debts
    let remaining = monthlyBudget;
    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] > 0 && remaining > 0) {
        const minPayment = Math.min(sorted[i].minimum_payment, balances[i], remaining);
        balances[i] -= minPayment;
        totalPaid += minPayment;
        remaining -= minPayment;
        balances[i] = Math.max(0, Math.round(balances[i] * 100) / 100);
      }
    }

    // 3. Apply extra budget to the target debt (first with balance > 0)
    for (let i = 0; i < sorted.length; i++) {
      if (balances[i] > 0 && remaining > 0) {
        const extraPayment = Math.min(balances[i], remaining);
        balances[i] -= extraPayment;
        totalPaid += extraPayment;
        remaining -= extraPayment;
        balances[i] = Math.max(0, Math.round(balances[i] * 100) / 100);
        break;
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
