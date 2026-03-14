export interface Income {
  id: string;
  type: 'fixed' | 'variable';
  amount: number;
  description?: string;
  created_at: string;
}

export interface PaginatedIncomes {
  data: Income[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateIncomeInput {
  type: 'fixed' | 'variable';
  amount: number;
  description?: string;
}

export interface UpdateIncomeInput extends CreateIncomeInput {
  id: string;
}
