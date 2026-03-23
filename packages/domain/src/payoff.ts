import type { Debt } from "./entities";

export type PayoffMethod = "avalanche" | "snowball";

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

function sortDebts(debts: Debt[], method: PayoffMethod): Debt[] {
  const activeDebts = debts.filter((debt) => debt.balance > 0);

  if (method === "avalanche") {
    return [...activeDebts].sort((a, b) =>
      b.interest_rate !== a.interest_rate
        ? b.interest_rate - a.interest_rate
        : a.balance - b.balance
    );
  }

  return [...activeDebts].sort((a, b) =>
    a.balance !== b.balance
      ? a.balance - b.balance
      : b.interest_rate - a.interest_rate
  );
}

export function projectSingleDebt(
  debt: Debt,
  monthlyPayment: number
): SingleDebtProjection | null {
  if (monthlyPayment <= 0 || debt.balance <= 0) {
    return null;
  }

  const monthlyRate = debt.interest_rate / 100 / 12;
  const monthlyInterestOnly = debt.balance * monthlyRate;

  if (monthlyPayment <= monthlyInterestOnly && debt.interest_rate > 0) {
    return null;
  }

  let months: number;
  let totalInterest = 0;

  if (monthlyRate === 0) {
    months = Math.ceil(debt.balance / monthlyPayment);
  } else {
    months = Math.ceil(
      -Math.log(1 - (debt.balance * monthlyRate) / monthlyPayment) /
        Math.log(1 + monthlyRate)
    );

    let balance = debt.balance;
    for (let month = 0; month < months; month += 1) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      balance += interest;
      balance -= Math.min(monthlyPayment, balance);
      balance = Math.max(0, Math.round(balance * 100) / 100);
      if (balance === 0) {
        break;
      }
    }
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);

  return {
    monthlyPayment,
    months,
    totalPaid: debt.balance + totalInterest,
    totalInterest,
    payoffDate
  };
}

export function simulatePortfolio(
  debts: Debt[],
  method: PayoffMethod,
  monthlyBudget: number
): PortfolioProjection | null {
  if (monthlyBudget <= 0) {
    return null;
  }

  const sortedDebts = sortDebts(debts, method);
  if (sortedDebts.length === 0) {
    return null;
  }

  const balances = sortedDebts.map((debt) => debt.balance);
  let totalPaid = 0;
  let totalInterest = 0;
  let months = 0;
  const maxMonths = 600;

  while (balances.some((balance) => balance > 0) && months < maxMonths) {
    months += 1;

    for (let index = 0; index < sortedDebts.length; index += 1) {
      if (balances[index] > 0) {
        const monthlyRate = sortedDebts[index].interest_rate / 100 / 12;
        const interest = Math.round(balances[index] * monthlyRate * 100) / 100;
        balances[index] += interest;
        totalInterest += interest;
      }
    }

    const totalMinimumsDue = sortedDebts.reduce((sum, debt, index) => {
      if (balances[index] <= 0) {
        return sum;
      }

      return sum + Math.min(debt.minimum_payment, balances[index]);
    }, 0);

    if (monthlyBudget >= totalMinimumsDue) {
      let remaining = monthlyBudget;

      for (let index = 0; index < sortedDebts.length; index += 1) {
        if (balances[index] > 0) {
          const minimumPayment = Math.min(sortedDebts[index].minimum_payment, balances[index]);
          balances[index] = Math.max(
            0,
            Math.round((balances[index] - minimumPayment) * 100) / 100
          );
          totalPaid += minimumPayment;
          remaining -= minimumPayment;
        }
      }

      for (let index = 0; index < sortedDebts.length; index += 1) {
        if (balances[index] > 0 && remaining > 0) {
          const extraPayment = Math.min(balances[index], remaining);
          balances[index] = Math.max(
            0,
            Math.round((balances[index] - extraPayment) * 100) / 100
          );
          totalPaid += extraPayment;
          remaining -= extraPayment;
          break;
        }
      }
    } else {
      for (let index = 0; index < sortedDebts.length; index += 1) {
        if (balances[index] > 0 && totalMinimumsDue > 0) {
          const minimumDue = Math.min(sortedDebts[index].minimum_payment, balances[index]);
          const proportional =
            Math.round(monthlyBudget * (minimumDue / totalMinimumsDue) * 100) / 100;
          const payment = Math.min(proportional, balances[index]);
          balances[index] = Math.max(0, Math.round((balances[index] - payment) * 100) / 100);
          totalPaid += payment;
        }
      }
    }
  }

  if (months >= maxMonths) {
    return null;
  }

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + months);

  return { months, totalPaid, totalInterest, payoffDate };
}

export function compareMethodsPayoff(
  debts: Debt[],
  monthlyBudget: number
): MethodComparison | null {
  const avalanche = simulatePortfolio(debts, "avalanche", monthlyBudget);
  const snowball = simulatePortfolio(debts, "snowball", monthlyBudget);

  if (!avalanche || !snowball) {
    return null;
  }

  return {
    avalanche,
    snowball,
    monthsDelta: snowball.months - avalanche.months,
    interestDelta: snowball.totalInterest - avalanche.totalInterest
  };
}

export function formatMonths(months: number): string {
  if (months <= 0) {
    return "0 meses";
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} mes${months === 1 ? "" : "es"}`;
  }

  if (remainingMonths === 0) {
    return `${years} año${years === 1 ? "" : "s"}`;
  }

  return `${years} año${years === 1 ? "" : "s"} y ${remainingMonths} mes${remainingMonths === 1 ? "" : "es"}`;
}

export function formatPayoffDate(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    month: "long",
    year: "numeric"
  });
}
