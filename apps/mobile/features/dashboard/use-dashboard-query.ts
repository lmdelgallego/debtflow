import { calculateDashboardSummary, type Debt, type Expense, type Income } from "@debtflow/domain";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useDashboardQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["dashboard-summary"],
    enabled,
    queryFn: async () => {
      const [{ data: incomes, error: incomeError }, { data: expenses, error: expenseError }, { data: debts, error: debtError }] =
        await Promise.all([
          supabase.from("incomes").select("*").order("created_at", { ascending: false }),
          supabase.from("expenses").select("*").order("date", { ascending: false }),
          supabase.from("debts").select("*").order("interest_rate", { ascending: false })
        ]);

      const firstError = incomeError ?? expenseError ?? debtError;
      if (firstError) {
        throw firstError;
      }

      const incomeRows = (incomes ?? []) as Income[];
      const expenseRows = (expenses ?? []) as Expense[];
      const debtRows = (debts ?? []) as Debt[];

      return {
        incomes: incomeRows,
        expenses: expenseRows,
        debts: debtRows,
        summary: calculateDashboardSummary(incomeRows, expenseRows, debtRows)
      };
    }
  });
}
