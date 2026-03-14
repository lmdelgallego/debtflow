import type { ApiResponse, AvalancheResult } from '@debtflow/types';
import type { DebtFlowClient } from './client';

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  totalDebt: number;
  cashFlow: number;
  avalanche: AvalancheResult | null;
}

export class DashboardApi {
  constructor(private client: DebtFlowClient) {}

  async getSummary(params?: { date?: string }): Promise<ApiResponse<DashboardSummary>> {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.set('date', params.date);
    const query = searchParams.toString();
    return this.client.fetch<DashboardSummary>(`/api/dashboard/summary${query ? `?${query}` : ''}`);
  }
}
