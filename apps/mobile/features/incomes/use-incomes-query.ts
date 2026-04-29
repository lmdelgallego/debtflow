import type { Income } from "@debtflow/domain";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const INCOMES_QUERY_KEY = ["incomes"] as const;

export function useIncomesQuery(enabled = true) {
  return useQuery({
    queryKey: INCOMES_QUERY_KEY,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incomes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as Income[];
    }
  });
}
