'use server';

import { createClient } from '@/lib/supabase/server';

export interface Expense {
  id: string;
  category: string;
  subcategory?: string;
  description?: string;
  amount: number;
  date: string;
  created_at: string;
}

export interface PaginatedExpenses {
  data: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateExpenseInput {
  category: string;
  subcategory?: string;
  description?: string;
  amount: number;
  date: string;
}

interface UpdateExpenseInput extends CreateExpenseInput {
  id: string;
}

/**
 * Obtiene todos los gastos del usuario autenticado (para cálculos y gráficos)
 */
export async function fetchAllExpenses(): Promise<{ data: Expense[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Obtiene los gastos paginados del usuario autenticado
 */
export async function fetchExpenses(
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: PaginatedExpenses | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    // Obtener total de registros
    const { count, error: countError } = await supabase
      .from('expenses')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id);

    if (countError) {
      return { data: null, error: countError.message };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;

    // Obtener datos paginados
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: {
        data: data || [],
        total,
        page,
        pageSize,
        totalPages,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Crea un nuevo gasto
 */
export async function createExpense(input: CreateExpenseInput): Promise<{ data: Expense | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          user_id: user.id,
          category: input.category,
          subcategory: input.subcategory || null,
          description: input.description || null,
          amount: parseFloat(input.amount.toString()),
          date: input.date,
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
 * Actualiza un gasto existente
 */
export async function updateExpense(input: UpdateExpenseInput): Promise<{ data: Expense | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('expenses')
      .update({
        category: input.category,
        subcategory: input.subcategory || null,
        description: input.description || null,
        amount: parseFloat(input.amount.toString()),
        date: input.date,
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
 * Elimina un gasto
 */
export async function deleteExpense(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { error } = await supabase
      .from('expenses')
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
