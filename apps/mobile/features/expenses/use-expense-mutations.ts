import type { CreateExpenseInput, UpdateExpenseInput } from "@debtflow/domain";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { EXPENSES_QUERY_KEY } from "./use-expenses-query";

const DASHBOARD_KEY = ["dashboard-summary"];

async function getUserId(): Promise<string> {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay sesión activa");
  return session.user.id;
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("expenses")
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    }
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateExpenseInput) => {
      const userId = await getUserId();
      const { id, ...fields } = input;
      const { data, error } = await supabase
        .from("expenses")
        .update(fields)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    }
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = await getUserId();
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: EXPENSES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    }
  });
}
