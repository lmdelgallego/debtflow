import type { ApiResponse, ApiSuccessResponse } from '@debtflow/types';
import { IncomesApi } from './incomes';
import { ExpensesApi } from './expenses';
import { DebtsApi } from './debts';
import { DashboardApi } from './dashboard';

export interface DebtFlowClientOptions {
  baseUrl: string;
  getToken: () => Promise<string | null>;
}

export class DebtFlowClient {
  private baseUrl: string;
  private getToken: () => Promise<string | null>;

  public readonly incomes: IncomesApi;
  public readonly expenses: ExpensesApi;
  public readonly debts: DebtsApi;
  public readonly dashboard: DashboardApi;

  constructor(options: DebtFlowClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getToken = options.getToken;

    this.incomes = new IncomesApi(this);
    this.expenses = new ExpensesApi(this);
    this.debts = new DebtsApi(this);
    this.dashboard = new DashboardApi(this);
  }

  async fetch<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = await this.getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        return {
          data: null,
          error: errorBody.message || `Error ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Error de conexión',
      };
    }
  }

  async fetchSuccess(path: string, options: RequestInit = {}): Promise<ApiSuccessResponse> {
    const result = await this.fetch<{ success: boolean }>(path, options);
    if (result.error) {
      return { success: false, error: result.error };
    }
    return { success: true, error: null };
  }
}
