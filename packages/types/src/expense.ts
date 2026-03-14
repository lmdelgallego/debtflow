export interface Expense {
  id: string;
  category: string;
  subcategory?: string;
  description?: string;
  amount: number;
  date: string;
  is_recurring?: boolean;
  created_at: string;
}

export interface PaginatedExpenses {
  data: Expense[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateExpenseInput {
  category: string;
  subcategory?: string;
  description?: string;
  amount: number;
  date: string;
  is_recurring?: boolean;
}

export interface UpdateExpenseInput extends CreateExpenseInput {
  id: string;
}
