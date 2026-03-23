import type { Debt } from "./entities";

export type AvalancheMode = "NORMAL" | "CRISIS_NO_MINIMUMS" | "NO_BUDGET";

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
  const activeDebts = debts.filter((debt) => debt.balance > 0);
  const orderedDebts = [...activeDebts].sort((a, b) => {
    if (b.interest_rate !== a.interest_rate) {
      return b.interest_rate - a.interest_rate;
    }

    return a.balance - b.balance;
  });
  const sumMinimums = orderedDebts.reduce((sum, debt) => sum + debt.minimum_payment, 0);

  let mode: AvalancheMode;
  if (budget === 0) {
    mode = "NO_BUDGET";
  } else if (budget < sumMinimums) {
    mode = "CRISIS_NO_MINIMUMS";
  } else {
    mode = "NORMAL";
  }

  const recommendedPayments: RecommendedPayment[] = [];
  let nextTargetDebtId: string | null = null;

  if (mode === "NO_BUDGET") {
    for (const debt of orderedDebts) {
      recommendedPayments.push({
        debtId: debt.id,
        debtName: debt.name,
        minimumPayment: debt.minimum_payment,
        recommendedPayment: 0,
        extraApplied: 0,
        projectedBalance: debt.balance,
        isTarget: false
      });
    }
  } else if (mode === "CRISIS_NO_MINIMUMS") {
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
        isTarget: false
      });
    }

    if (orderedDebts.length > 0) {
      nextTargetDebtId = orderedDebts[0].id;
      recommendedPayments[0].isTarget = true;
    }
  } else {
    let remaining = budget;
    const minimums: number[] = [];

    for (const debt of orderedDebts) {
      const minimumPayment = Math.min(debt.minimum_payment, debt.balance);
      minimums.push(minimumPayment);
      remaining -= minimumPayment;
    }

    const extras = Array.from({ length: orderedDebts.length }, () => 0);

    for (let index = 0; index < orderedDebts.length && remaining > 0; index += 1) {
      const debt = orderedDebts[index];
      const maxExtra = debt.balance - minimums[index];

      if (maxExtra > 0) {
        const extra = Math.min(maxExtra, remaining);
        extras[index] = extra;
        remaining -= extra;
      }
    }

    for (let index = 0; index < orderedDebts.length; index += 1) {
      const debt = orderedDebts[index];
      const minimumPayment = minimums[index] ?? 0;
      const extraApplied = extras[index] ?? 0;
      const recommendedPayment = minimumPayment + extraApplied;
      recommendedPayments.push({
        debtId: debt.id,
        debtName: debt.name,
        minimumPayment: debt.minimum_payment,
        recommendedPayment,
        extraApplied,
        projectedBalance: debt.balance - recommendedPayment,
        isTarget: index === 0
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
    mode
  };
}
