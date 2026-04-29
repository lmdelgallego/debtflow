import type { CreateIncomeInput, UpdateIncomeInput } from "@debtflow/domain";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { INCOMES_QUERY_KEY } from "./use-incomes-query";

const DASHBOARD_KEY = ["dashboard-summary"];

async function getUserId(): Promise<string> {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay sesión activa");
  return session.user.id;
}

export function useCreateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateIncomeInput) => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("incomes")
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INCOMES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    }
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateIncomeInput) => {
      const userId = await getUserId();
      const { id, ...fields } = input;
      const { data, error } = await supabase
        .from("incomes")
        .update(fields)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INCOMES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    }
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = await getUserId();
      const { error } = await supabase
        .from("incomes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: INCOMES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    }
  });
}
