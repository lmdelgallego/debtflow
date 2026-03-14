import type { Expense, PaginatedExpenses, CreateExpenseInput, UpdateExpenseInput, ApiResponse, ApiSuccessResponse } from '@debtflow/types';
import type { DebtFlowClient } from './client';

export class ExpensesApi {
  constructor(private client: DebtFlowClient) {}

  async list(params?: { page?: number; pageSize?: number; date?: string }): Promise<ApiResponse<PaginatedExpenses>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params?.date) searchParams.set('date', params.date);
    const query = searchParams.toString();
    return this.client.fetch<PaginatedExpenses>(`/api/expenses${query ? `?${query}` : ''}`);
  }

  async getAll(params?: { date?: string }): Promise<ApiResponse<Expense[]>> {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.set('date', params.date);
    const query = searchParams.toString();
    return this.client.fetch<Expense[]>(`/api/expenses/all${query ? `?${query}` : ''}`);
  }

  async create(input: CreateExpenseInput): Promise<ApiResponse<Expense>> {
    return this.client.fetch<Expense>('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async update(input: UpdateExpenseInput): Promise<ApiResponse<Expense>> {
    const { id, ...body } = input;
    return this.client.fetch<Expense>(`/api/expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete(id: string): Promise<ApiSuccessResponse> {
    return this.client.fetchSuccess(`/api/expenses/${id}`, { method: 'DELETE' });
  }

  async syncRecurring(): Promise<ApiResponse<{ count: number }>> {
    return this.client.fetch<{ count: number }>('/api/expenses/sync-recurring', {
      method: 'POST',
    });
  }
}
