import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../common/supabase/supabase.service';
import type { Debt, PaginatedDebts, CreateDebtInput } from '@debtflow/types';

@Injectable()
export class DebtsService {
  constructor(private supabase: SupabaseService) {}

  async findAll(userId: string): Promise<Debt[]> {
    const { data, error } = await this.supabase.getClient()
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('interest_rate', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async findPaginated(userId: string, page: number = 1, pageSize: number = 10): Promise<PaginatedDebts> {
    const { count, error: countError } = await this.supabase.getClient()
      .from('debts')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
    if (countError) throw new Error(countError.message);

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;

    const { data, error } = await this.supabase.getClient()
      .from('debts')
      .select('*')
      .eq('user_id', userId)
      .order('interest_rate', { ascending: false })
      .range(offset, offset + pageSize - 1);
    if (error) throw new Error(error.message);

    return { data: data || [], total, page, pageSize, totalPages };
  }

  async create(userId: string, input: CreateDebtInput): Promise<Debt> {
    const { data, error } = await this.supabase.getClient()
      .from('debts')
      .insert([{
        user_id: userId,
        name: input.name,
        balance: parseFloat(input.balance.toString()),
        interest_rate: parseFloat(input.interest_rate.toString()),
        minimum_payment: parseFloat(input.minimum_payment.toString()),
        payment_day: parseInt(input.payment_day.toString()),
      }])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(userId: string, id: string, input: CreateDebtInput): Promise<Debt> {
    const { data, error } = await this.supabase.getClient()
      .from('debts')
      .update({
        name: input.name,
        balance: parseFloat(input.balance.toString()),
        interest_rate: parseFloat(input.interest_rate.toString()),
        minimum_payment: parseFloat(input.minimum_payment.toString()),
        payment_day: parseInt(input.payment_day.toString()),
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
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  }

  async pay(userId: string, debtId: string, amount: number, createExpenseLog: boolean = true): Promise<void> {
    const { data: debt, error: fetchError } = await this.supabase.getClient()
      .from('debts')
      .select('*')
      .eq('id', debtId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !debt) {
      throw new NotFoundException('Deuda no encontrada');
    }

    if (amount <= 0) {
      throw new BadRequestException('El monto a pagar debe ser mayor a 0');
    }

    if (amount > debt.balance) {
      throw new BadRequestException('El monto a pagar no puede superar el balance actual');
    }

    const newBalance = debt.balance - amount;
    const { error: updateError } = await this.supabase.getClient()
      .from('debts')
      .update({ balance: newBalance })
      .eq('id', debtId)
      .eq('user_id', userId);
    if (updateError) throw new Error(updateError.message);

    if (createExpenseLog) {
      await this.supabase.getClient()
        .from('expenses')
        .insert([{
          user_id: userId,
          category: 'debt',
          subcategory: debt.name,
          description: `Abono a deuda: ${debt.name}`,
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          is_recurring: false,
        }]);
    }
  }
}
