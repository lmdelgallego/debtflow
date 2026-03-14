import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { getStartAndEndDate } from '@debtflow/utils';
import type { Expense, PaginatedExpenses, CreateExpenseInput } from '@debtflow/types';

@Injectable()
export class ExpensesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string, date?: string): Promise<Expense[]> {
    let query = this.supabase.getClient()
      .from('expenses')
      .select('*')
      .eq('user_id', userId);

    if (date) {
      const { startDate, endDate } = getStartAndEndDate(date);
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async findPaginated(userId: string, page: number = 1, pageSize: number = 20, date?: string): Promise<PaginatedExpenses> {
    const dateStr = date || new Date().toISOString().split('T')[0];
    const { startDate, endDate } = getStartAndEndDate(dateStr);

    const { count, error: countError } = await this.supabase.getClient()
      .from('expenses')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
    if (countError) throw new Error(countError.message);

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;

    const { data, error } = await this.supabase.getClient()
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(error.message);

    return { data: data || [], total, page, pageSize, totalPages };
  }

  async create(userId: string, input: CreateExpenseInput): Promise<Expense> {
    const { data, error } = await this.supabase.getClient()
      .from('expenses')
      .insert([{
        user_id: userId,
        category: input.category,
        subcategory: input.subcategory || null,
        description: input.description || null,
        amount: parseFloat(input.amount.toString()),
        date: input.date,
        is_recurring: input.is_recurring ?? false,
      }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(userId: string, id: string, input: CreateExpenseInput): Promise<Expense> {
    const { data, error } = await this.supabase.getClient()
      .from('expenses')
      .update({
        category: input.category,
        subcategory: input.subcategory || null,
        description: input.description || null,
        amount: parseFloat(input.amount.toString()),
        date: input.date,
        is_recurring: input.is_recurring ?? false,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async delete(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase.getClient()
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  }

  async syncRecurring(userId: string): Promise<{ count: number }> {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let prevYear = currentYear;
    let prevMonth = currentMonth - 1;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }

    const prevMonthStartDate = new Date(prevYear, prevMonth, 1).toISOString().split('T')[0];
    const prevMonthEndDate = new Date(prevYear, prevMonth + 1, 0).toISOString().split('T')[0];

    const { data: prevRecurring, error: prevError } = await this.supabase.getClient()
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .gte('date', prevMonthStartDate)
      .lte('date', prevMonthEndDate);
    if (prevError) throw new Error(prevError.message);

    if (!prevRecurring || prevRecurring.length === 0) {
      return { count: 0 };
    }

    const currentMonthStartDate = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const currentMonthEndDate = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

    const { data: currentRecurring, error: currentError } = await this.supabase.getClient()
      .from('expenses')
      .select('category, subcategory, description, amount')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .gte('date', currentMonthStartDate)
      .lte('date', currentMonthEndDate);
    if (currentError) throw new Error(currentError.message);

    const toInsert = prevRecurring.filter(prevExp => {
      const exists = currentRecurring?.some(currExp =>
        currExp.category === prevExp.category &&
        currExp.description === prevExp.description &&
        currExp.amount === prevExp.amount
      );
      return !exists;
    }).map(exp => {
      const oldDateStr = exp.date.includes('T') ? exp.date : `${exp.date}T00:00:00`;
      const oldDate = new Date(oldDateStr);
      let newDay = oldDate.getDate();
      const lastDayOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      if (newDay > lastDayOfCurrentMonth) {
        newDay = lastDayOfCurrentMonth;
      }

      const newDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;

      return {
        user_id: userId,
        category: exp.category,
        subcategory: exp.subcategory,
        description: exp.description,
        amount: exp.amount,
        date: newDateStr,
        is_recurring: true,
      };
    });

    if (toInsert.length === 0) {
      return { count: 0 };
    }

    const { error: insertError } = await this.supabase.getClient()
      .from('expenses')
      .insert(toInsert);
    if (insertError) throw new Error(insertError.message);

    return { count: toInsert.length };
  }
}
