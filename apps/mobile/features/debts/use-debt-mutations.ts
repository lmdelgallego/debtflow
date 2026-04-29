import type { CreateDebtInput, UpdateDebtInput } from "@debtflow/domain";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { DEBTS_QUERY_KEY } from "./use-debts-query";

const DASHBOARD_KEY = ["dashboard-summary"];

async function getUserId(): Promise<string> {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay sesión activa");
  return session.user.id;
}

export function useCreateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDebtInput) => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("debts")
        .insert({ ...input, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    }
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateDebtInput) => {
      const userId = await getUserId();
      const { id, ...fields } = input;
      const { data, error } = await supabase
        .from("debts")
        .update(fields)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    }
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const userId = await getUserId();
      const { error } = await supabase
        .from("debts")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
    }
  });
}

interface PayDebtInput {
  debtId: string;
  debtName: string;
  currentBalance: number;
  amount: number;
  createExpenseLog: boolean;
}

export function usePayDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      debtId,
      debtName,
      currentBalance,
      amount,
      createExpenseLog
    }: PayDebtInput) => {
      const userId = await getUserId();
      const newBalance = Math.max(0, currentBalance - amount);

      const { error: updateError } = await supabase
        .from("debts")
        .update({ balance: newBalance })
        .eq("id", debtId)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      if (createExpenseLog) {
        const today = new Date().toISOString().split("T")[0];
        const { error: expenseError } = await supabase.from("expenses").insert({
          user_id: userId,
          category: "debt",
          description: `Pago: ${debtName}`,
          amount,
          date: today,
          is_recurring: false
        });
        if (expenseError) throw expenseError;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEBTS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEY });
      void queryClient.invalidateQueries({ queryKey: ["expenses"] });
    }
  });
}
