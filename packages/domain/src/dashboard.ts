import { calculateAvalanche } from "./avalanche";
import type { Debt, Expense, Income } from "./entities";

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  totalDebt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebtPayments: number;
  availableFlow: number;
  nextDebtName: string | null;
}

export function filterByMonth<T extends { created_at?: string; date?: string }>(
  items: T[],
  selectedDate: Date,
  dateField: "created_at" | "date" = "created_at"
) {
  return items.filter((item) => {
    const rawDate =
      dateField === "date" && "date" in item ? item.date : item.created_at ?? item.date;

    if (!rawDate) {
      return false;
    }

    const parsedDate = new Date(rawDate);
    return (
      parsedDate.getFullYear() === selectedDate.getFullYear() &&
      parsedDate.getMonth() === selectedDate.getMonth()
    );
  });
}

export function calculateDashboardSummary(
  incomes: Income[],
  expenses: Expense[],
  debts: Debt[],
  selectedDate = new Date()
): DashboardSummary {
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const activeDebts = debts.filter((debt) => debt.balance > 0);
  const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.balance, 0);
  const monthlyIncome = filterByMonth(incomes, selectedDate, "created_at").reduce(
    (sum, income) => sum + income.amount,
    0
  );
  const monthlyExpenses = filterByMonth(expenses, selectedDate, "date").reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const monthlyDebtPayments = activeDebts.reduce(
    (sum, debt) => sum + debt.minimum_payment,
    0
  );
  const availableFlow = monthlyIncome - monthlyExpenses - monthlyDebtPayments;
  const avalanche = activeDebts.length > 0 ? calculateAvalanche(debts, totalIncome, totalExpenses) : null;
  const nextDebtName = avalanche?.orderedDebts[0]?.name ?? null;

  return {
    totalIncome,
    totalExpenses,
    totalDebt,
    monthlyIncome,
    monthlyExpenses,
    monthlyDebtPayments,
    availableFlow,
    nextDebtName
  };
}
