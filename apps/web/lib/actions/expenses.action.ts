'use server';

import type { CreateExpenseInput, Expense, UpdateExpenseInput } from '@debtflow/domain';
import { createClient } from '@/lib/supabase/server';
import { getStartAndEndDate } from '../date.utils';
export type { CreateExpenseInput, Expense, UpdateExpenseInput } from '@debtflow/domain';

export interface PaginatedExpenses {
  data: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Obtiene todos los gastos del usuario autenticado (para cálculos y gráficos).
 * Si se provee `date` (formato YYYY-MM-DD), filtra por ese mes.
 */
export async function fetchAllExpenses(
  date?: string,
): Promise<{ data: Expense[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    let query = supabase.from('expenses').select('*').eq('user_id', user.id);

    if (date) {
      const { startDate, endDate } = getStartAndEndDate(date);
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: ((data ?? []) as Expense[]), error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Obtiene los gastos paginados del usuario autenticado
 */
export async function fetchExpenses(
  page: number = 1,
  pageSize: number = 20,
  date: string = new Date().toISOString().split('T')[0]
): Promise<{ data: PaginatedExpenses | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { startDate, endDate } = getStartAndEndDate(date);

    // Obtener total de registros
    const { count, error: countError } = await supabase
      .from('expenses')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate);

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
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      return { data: null, error: error.message };
    }

    return {
      data: {
        data: (data ?? []) as Expense[],
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
          is_recurring: input.is_recurring ?? false,
        },
      ])
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Expense, error: null };
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
        is_recurring: input.is_recurring ?? false,
      })
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Expense, error: null };
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

/**
 * Sincroniza los gastos recurrentes del mes anterior al mes actual.
 * Se llama silenciosamente al cargar el dashboard.
 */
export async function syncRecurringExpenses(): Promise<{ success: boolean; error: string | null; count: number }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Usuario no autenticado', count: 0 };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Determinar el mes anterior
    let prevYear = currentYear;
    let prevMonth = currentMonth - 1;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }

    // Fechas de inicio y fin del mes anterior
    const prevMonthStartDate = new Date(prevYear, prevMonth, 1).toISOString().split('T')[0];
    const prevMonthEndDate = new Date(prevYear, prevMonth + 1, 0).toISOString().split('T')[0];

    // Buscar gastos recurrentes del mes anterior
    const { data: rawPrevRecurring, error: prevError } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_recurring', true)
      .gte('date', prevMonthStartDate)
      .lte('date', prevMonthEndDate);

    const prevRecurring = (rawPrevRecurring ?? []) as Expense[];

    if (prevError) {
      return { success: false, error: prevError.message, count: 0 };
    }

    if (!prevRecurring || prevRecurring.length === 0) {
      return { success: true, error: null, count: 0 };
    }

    // Fechas de inicio y fin del mes actual
    const currentMonthStartDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const currentMonthEndDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

    // Buscar gastos recurrentes que ya existan en el mes actual (para no duplicar)
    const { data: rawCurrentRecurring, error: currentError } = await supabase
      .from('expenses')
      .select('category, subcategory, description, amount')
      .eq('user_id', user.id)
      .eq('is_recurring', true)
      .gte('date', currentMonthStartDate)
      .lte('date', currentMonthEndDate);

    const currentRecurring = (rawCurrentRecurring ?? []) as Pick<
      Expense,
      'category' | 'subcategory' | 'description' | 'amount'
    >[];

    if (currentError) {
      return { success: false, error: currentError.message, count: 0 };
    }

    // Filtrar los gastos que aún no se han copiado
    const toInsert = prevRecurring.filter(prevExp => {
      // Consideramos que ya se copió si hay uno con la misma categoría, descripción y monto literal
      const exists = currentRecurring?.some(currExp =>
        currExp.category === prevExp.category &&
        currExp.description === prevExp.description &&
        currExp.amount === prevExp.amount
      );
      return !exists;
    }).map(exp => {
      // Ajustar la fecha al mes actual manteniendo el mismo día si es posible
      // Se añade o reemplaza 'T' temporalmente por seguridad si no existe, pero viene de date column
      const oldDateStr = exp.date.includes('T') ? exp.date : `${exp.date}T00:00:00`;
      const oldDate = new Date(oldDateStr);
      let newDay = oldDate.getDate();
      const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      if (newDay > lastDayOfCurrentMonth) {
         newDay = lastDayOfCurrentMonth;
      }

      const newDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;

      return {
        user_id: user.id,
        category: exp.category,
        subcategory: exp.subcategory,
        description: exp.description,
        amount: exp.amount,
        date: newDateStr,
        is_recurring: true,
      };
    });

    if (toInsert.length === 0) {
      return { success: true, error: null, count: 0 };
    }

    const { error: insertError } = await supabase
      .from('expenses')
      .insert(toInsert);

    if (insertError) {
      return { success: false, error: insertError.message, count: 0 };
    }

    return { success: true, error: null, count: toInsert.length };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido', count: 0 };
  }
}
