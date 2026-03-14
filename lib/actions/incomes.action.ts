'use server';

import { createClient } from '@/lib/supabase/server';
import { getStartAndEndDate } from '../date.utils';

export interface Income {
  id: string;
  type: 'fixed' | 'variable';
  amount: number;
  description?: string;
  created_at: string;
}

export interface PaginatedIncomes {
  data: Income[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
 * Obtiene todos los ingresos del usuario autenticado (para cálculos y gráficos).
 * Si se provee `date` (formato YYYY-MM-DD), filtra por ese mes.
 */
export async function fetchAllIncomes(
  date?: string,
): Promise<{ data: Income[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    let query = supabase.from('incomes').select('*').eq('user_id', user.id);

    if (date) {
      const { startDate, endDate } = getStartAndEndDate(date);
      // endDate is the last day of the month (e.g. "2026-03-31"), add one day for lt comparison
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      query = query.gte('created_at', startDate).lt('created_at', nextDayStr);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Obtiene los ingresos paginados del usuario autenticado.
 * Si se provee `date` (formato YYYY-MM-DD), filtra por ese mes.
 */
export async function fetchIncomes(
  page: number = 1,
  pageSize: number = 10,
  date?: string,
): Promise<{ data: PaginatedIncomes | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    let startDate: string | undefined;
    let nextDayStr: string | undefined;

    if (date) {
      const range = getStartAndEndDate(date);
      startDate = range.startDate;
      const nextDay = new Date(range.endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDayStr = nextDay.toISOString().split('T')[0];
    }

    // Obtener total de registros
    let countQuery = supabase.from('incomes').select('id', { count: 'exact' }).eq('user_id', user.id);
    if (startDate && nextDayStr) {
      countQuery = countQuery.gte('created_at', startDate).lt('created_at', nextDayStr);
    }
    const { count, error: countError } = await countQuery;

    if (countError) {
      return { data: null, error: countError.message };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;

    // Obtener datos paginados
    let dataQuery = supabase.from('incomes').select('*').eq('user_id', user.id);
    if (startDate && nextDayStr) {
      dataQuery = dataQuery.gte('created_at', startDate).lt('created_at', nextDayStr);
    }
    const { data, error } = await dataQuery.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1);

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
