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

export interface Income {
  id: string;
  user_id?: string;
  type: "fixed" | "variable";
  amount: number;
  description?: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id?: string;
  category: string;
  subcategory?: string | null;
  description?: string | null;
  amount: number;
  date: string;
  is_recurring?: boolean;
  created_at: string;
}
