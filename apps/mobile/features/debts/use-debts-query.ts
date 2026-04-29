import type { Debt } from "@debtflow/domain";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const DEBTS_QUERY_KEY = ["debts"] as const;

export function useDebtsQuery(enabled = true) {
  return useQuery({
    queryKey: DEBTS_QUERY_KEY,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .order("interest_rate", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Debt[];
    }
  });
}
