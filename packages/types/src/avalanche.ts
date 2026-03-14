import type { Debt } from './debt';

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
