export interface Debt {
  id: string;
  user_id: string;
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  payment_day: number;
  created_at: string;
}

export interface PaginatedDebts {
  data: Debt[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateDebtInput {
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  payment_day: number;
}

export interface UpdateDebtInput extends CreateDebtInput {
  id: string;
}
