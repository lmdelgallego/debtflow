import type { Debt } from '@/lib/actions/debts.action';

export type AvalancheMode = 'NORMAL' | 'CRISIS_NO_MINIMUMS' | 'NO_BUDGET';

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

export function calculateAvalanche(
  debts: Debt[],
  totalIncome: number,
  totalExpenses: number
): AvalancheResult {
  const budget = Math.max(0, totalIncome - totalExpenses);

  // Filter active debts (balance > 0)
  const activeDebts = debts.filter((d) => d.balance > 0);

  // Sort: highest interest_rate first, tie-break by lowest balance
  const orderedDebts = [...activeDebts].sort((a, b) => {
    if (b.interest_rate !== a.interest_rate) {
      return b.interest_rate - a.interest_rate;
    }
    return a.balance - b.balance;
  });

  const sumMinimums = orderedDebts.reduce((sum, d) => sum + d.minimum_payment, 0);

  // Determine mode
  let mode: AvalancheMode;
  if (budget === 0) {
    mode = 'NO_BUDGET';
  } else if (budget < sumMinimums) {
    mode = 'CRISIS_NO_MINIMUMS';
  } else {
    mode = 'NORMAL';
  }

  const recommendedPayments: RecommendedPayment[] = [];
  let nextTargetDebtId: string | null = null;

  if (mode === 'NO_BUDGET') {
    // No budget: recommend 0 for all
    for (const debt of orderedDebts) {
      recommendedPayments.push({
        debtId: debt.id,
        debtName: debt.name,
        minimumPayment: debt.minimum_payment,
        recommendedPayment: 0,
        extraApplied: 0,
        projectedBalance: debt.balance,
        isTarget: false,
      });
    }
  } else if (mode === 'CRISIS_NO_MINIMUMS') {
    // Prorate budget proportionally to minimum_payment
    for (const debt of orderedDebts) {
      const proportion = sumMinimums > 0 ? debt.minimum_payment / sumMinimums : 0;
      const payment = Math.min(debt.balance, Math.round(budget * proportion * 100) / 100);
      recommendedPayments.push({
        debtId: debt.id,
        debtName: debt.name,
        minimumPayment: debt.minimum_payment,
        recommendedPayment: payment,
        extraApplied: 0,
        projectedBalance: debt.balance - payment,
        isTarget: false,
      });
    }
    // The first debt is still the target even in crisis
    if (orderedDebts.length > 0) {
      nextTargetDebtId = orderedDebts[0].id;
      recommendedPayments[0].isTarget = true;
    }
  } else {
    // NORMAL: pay minimums + extra to first debt, with rollover
    let remaining = budget;

    // First pass: assign minimums (capped at balance)
    const minimums: number[] = [];
    for (const debt of orderedDebts) {
      const min = Math.min(debt.minimum_payment, debt.balance);
      minimums.push(min);
      remaining -= min;
    }

    // Second pass: apply extra starting from highest interest debt
    const extras: number[] = new Array(orderedDebts.length).fill(0);
    for (let i = 0; i < orderedDebts.length && remaining > 0; i++) {
      const debt = orderedDebts[i];
      const maxExtra = debt.balance - minimums[i];
      if (maxExtra > 0) {
        const extra = Math.min(maxExtra, remaining);
        extras[i] = extra;
        remaining -= extra;
      }
    }

    for (let i = 0; i < orderedDebts.length; i++) {
      const debt = orderedDebts[i];
      const payment = minimums[i] + extras[i];
      const isTarget = i === 0;
      recommendedPayments.push({
        debtId: debt.id,
        debtName: debt.name,
        minimumPayment: debt.minimum_payment,
        recommendedPayment: payment,
        extraApplied: extras[i],
        projectedBalance: debt.balance - payment,
        isTarget,
      });
    }

    if (orderedDebts.length > 0) {
      nextTargetDebtId = orderedDebts[0].id;
    }
  }

  return {
    monthlyDebtBudget: budget,
    sumMinimums,
    orderedDebts,
    recommendedPayments,
    nextTargetDebtId,
    mode,
  };
}
