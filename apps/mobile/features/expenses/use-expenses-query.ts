import type { Expense } from "@debtflow/domain";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const EXPENSES_QUERY_KEY = ["expenses"] as const;

export function useExpensesQuery(enabled = true) {
  return useQuery({
    queryKey: EXPENSES_QUERY_KEY,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Expense[];
    }
  });
}
