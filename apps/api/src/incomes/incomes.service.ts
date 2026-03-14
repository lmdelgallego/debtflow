import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import { getStartAndEndDate } from '@debtflow/utils';
import type { Income, PaginatedIncomes, CreateIncomeInput } from '@debtflow/types';

@Injectable()
export class IncomesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string, date?: string): Promise<Income[]> {
    let query = this.supabase.getClient()
      .from('incomes')
      .select('*')
      .eq('user_id', userId);

    if (date) {
      const { startDate, endDate } = getStartAndEndDate(date);
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];
      query = query.gte('created_at', startDate).lt('created_at', nextDayStr);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async findPaginated(userId: string, page: number = 1, pageSize: number = 10, date?: string): Promise<PaginatedIncomes> {
    let startDate: string | undefined;
    let nextDayStr: string | undefined;

    if (date) {
      const range = getStartAndEndDate(date);
      startDate = range.startDate;
      const nextDay = new Date(range.endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      nextDayStr = nextDay.toISOString().split('T')[0];
    }

    let countQuery = this.supabase.getClient()
      .from('incomes')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
    if (startDate && nextDayStr) {
      countQuery = countQuery.gte('created_at', startDate).lt('created_at', nextDayStr);
    }
    const { count, error: countError } = await countQuery;
    if (countError) throw new Error(countError.message);

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;

    let dataQuery = this.supabase.getClient()
      .from('incomes')
      .select('*')
      .eq('user_id', userId);
    if (startDate && nextDayStr) {
      dataQuery = dataQuery.gte('created_at', startDate).lt('created_at', nextDayStr);
    }
    const { data, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(error.message);

    return { data: data || [], total, page, pageSize, totalPages };
  }

  async create(userId: string, input: CreateIncomeInput): Promise<Income> {
    const { data, error } = await this.supabase.getClient()
      .from('incomes')
      .insert([{
        user_id: userId,
        type: input.type,
        amount: parseFloat(input.amount.toString()),
        description: input.description || null,
      }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(userId: string, id: string, input: CreateIncomeInput): Promise<Income> {
    const { data, error } = await this.supabase.getClient()
      .from('incomes')
      .update({
        type: input.type,
        amount: parseFloat(input.amount.toString()),
        description: input.description || null,
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
      .from('incomes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  }
}
