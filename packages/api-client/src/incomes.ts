import type { Income, PaginatedIncomes, CreateIncomeInput, UpdateIncomeInput, ApiResponse, ApiSuccessResponse } from '@debtflow/types';
import type { DebtFlowClient } from './client';

export class IncomesApi {
  constructor(private client: DebtFlowClient) {}

  async list(params?: { page?: number; pageSize?: number; date?: string }): Promise<ApiResponse<PaginatedIncomes>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params?.date) searchParams.set('date', params.date);
    const query = searchParams.toString();
    return this.client.fetch<PaginatedIncomes>(`/api/incomes${query ? `?${query}` : ''}`);
  }

  async getAll(params?: { date?: string }): Promise<ApiResponse<Income[]>> {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.set('date', params.date);
    const query = searchParams.toString();
    return this.client.fetch<Income[]>(`/api/incomes/all${query ? `?${query}` : ''}`);
  }

  async create(input: CreateIncomeInput): Promise<ApiResponse<Income>> {
    return this.client.fetch<Income>('/api/incomes', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async update(input: UpdateIncomeInput): Promise<ApiResponse<Income>> {
    const { id, ...body } = input;
    return this.client.fetch<Income>(`/api/incomes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  async delete(id: string): Promise<ApiSuccessResponse> {
    return this.client.fetchSuccess(`/api/incomes/${id}`, { method: 'DELETE' });
  }
}
