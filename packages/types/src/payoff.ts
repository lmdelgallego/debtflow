export type PayoffMethod = 'avalanche' | 'snowball';

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

export interface MethodComparison {
  avalanche: PortfolioProjection;
  snowball: PortfolioProjection;
  monthsDelta: number;
  interestDelta: number;
}
