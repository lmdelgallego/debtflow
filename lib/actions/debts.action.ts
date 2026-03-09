'use server';

import { createClient } from '@/lib/supabase/server';

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  payment_day: number;
  created_at: string;
}

export interface PaginatedDebts {
  data: Debt[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateDebtInput {
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  payment_day: number;
}

export interface UpdateDebtInput extends CreateDebtInput {
  id: string;
}

/**
 * Obtiene todas las deudas del usuario autenticado (para cálculos y gráficos)
 */
export async function fetchAllDebts(): Promise<{ data: Debt[] | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('interest_rate', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

/**
 * Obtiene las deudas paginadas del usuario autenticado
 */
export async function fetchDebts(
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: PaginatedDebts | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    // Obtener total de registros
    const { count, error: countError } = await supabase
      .from('debts')
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
      .from('debts')
      .select('*')
      .eq('user_id', user.id)
      .order('interest_rate', { ascending: false })
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
 * Crea una nueva deuda
 */
export async function createDebt(input: CreateDebtInput): Promise<{ data: Debt | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('debts')
      .insert([
        {
          user_id: user.id,
          name: input.name,
          balance: parseFloat(input.balance.toString()),
          interest_rate: parseFloat(input.interest_rate.toString()),
          minimum_payment: parseFloat(input.minimum_payment.toString()),
          payment_day: parseInt(input.payment_day.toString()),
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
 * Actualiza una deuda existente
 */
export async function updateDebt(input: UpdateDebtInput): Promise<{ data: Debt | null; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { data: null, error: 'Usuario no autenticado' };
    }

    const { data, error } = await supabase
      .from('debts')
      .update({
        name: input.name,
        balance: parseFloat(input.balance.toString()),
        interest_rate: parseFloat(input.interest_rate.toString()),
        minimum_payment: parseFloat(input.minimum_payment.toString()),
        payment_day: parseInt(input.payment_day.toString()),
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
 * Elimina una deuda
 */
export async function deleteDebt(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    const { error } = await supabase
      .from('debts')
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
 * Paga una parte o el total de una deuda y registra opcionalmente el gasto.
 */
export async function payDebt(
  debtId: string,
  amount: number,
  createExpenseLog: boolean = true
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    // 1. Obtener la deuda actual
    const { data: debt, error: fetchError } = await supabase
      .from('debts')
      .select('*')
      .eq('id', debtId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !debt) {
      return { success: false, error: 'Deuda no encontrada' };
    }

    if (amount <= 0) {
      return { success: false, error: 'El monto a pagar debe ser mayor a 0' };
    }

    if (amount > debt.balance) {
      return { success: false, error: 'El monto a pagar no puede superar el balance actual' };
    }

    // 2. Actualizar el balance
    const newBalance = debt.balance - amount;
    const { error: updateError } = await supabase
      .from('debts')
      .update({ balance: newBalance })
      .eq('id', debtId)
      .eq('user_id', user.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 3. Crear el gasto si el usuario lo confirmó
    if (createExpenseLog) {
      const { error: expenseError } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: user.id,
            category: 'Pagos de Deudas',
            subcategory: debt.name,
            description: `Abono a deuda: ${debt.name}`,
            amount: amount,
            date: new Date().toISOString().split('T')[0],
            is_recurring: false,
          },
        ]);

      if (expenseError) {
        // Falló el registro del gasto, pero la deuda sí se pagó. Lo logueamos.
        console.error('Error creando gasto para pago de deuda:', expenseError);
        return { success: true, error: null }; // Devolvemos éxito parcial
      }
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

