'use server';

import { createClient } from '@/lib/supabase/server';

export interface Income {
  id: string;
  type: 'fixed' | 'variable';
  amount: number;
  description?: string;
  created_at: string;
}

interface CreateIncomeInput {
  type: 'fixed' | 'variable';
  amount: number;
  description?: string;
}

interface UpdateIncomeInput extends CreateIncomeInput {
  id: string;
}

/**
 * Obtiene todos los ingresos del usuario autenticado
 */
export async function fetchIncomes(): Promise<{ data: Income[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Crea un nuevo ingreso
 */
export async function createIncome(input: CreateIncomeInput): Promise<{ data: Income | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('incomes')
      .insert([
        {
          user_id: user.id,
          type: input.type,
          amount: parseFloat(input.amount.toString()),
          description: input.description || null,
        },
      ])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Actualiza un ingreso existente
 */
export async function updateIncome(input: UpdateIncomeInput): Promise<{ data: Income | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('incomes')
      .update({
        type: input.type,
        amount: parseFloat(input.amount.toString()),
        description: input.description || null,
      })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Elimina un ingreso
 */
export async function deleteIncome(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}
