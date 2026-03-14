import type { Debt, PaginatedDebts, CreateDebtInput, UpdateDebtInput, ApiResponse, ApiSuccessResponse } from '@debtflow/types';
import type { DebtFlowClient } from './client';

export class DebtsApi {
  constructor(private client: DebtFlowClient) {}

  async list(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedDebts>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    const query = searchParams.toString();
    return this.client.fetch<PaginatedDebts>(`/api/debts${query ? `?${query}` : ''}`);
  }

  async getAll(): Promise<ApiResponse<Debt[]>> {
    return this.client.fetch<Debt[]>('/api/debts/all');
  }

  async create(input: CreateDebtInput): Promise<ApiResponse<Debt>> {
    return this.client.fetch<Debt>('/api/debts', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async update(input: UpdateDebtInput): Promise<ApiResponse<Debt>> {
    const { id, ...body } = input;
    return this.client.fetch<Debt>(`/api/debts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete(id: string): Promise<ApiSuccessResponse> {
    return this.client.fetchSuccess(`/api/debts/${id}`, { method: 'DELETE' });
  }

  async pay(id: string, amount: number, createExpenseLog: boolean = true): Promise<ApiSuccessResponse> {
    return this.client.fetchSuccess(`/api/debts/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify({ amount, createExpenseLog }),
    });
  }
}
