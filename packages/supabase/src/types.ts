export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      debts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          balance: number;
          interest_rate: number;
          minimum_payment: number;
          payment_day: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          balance: number;
          interest_rate: number;
          minimum_payment: number;
          payment_day: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["debts"]["Insert"]>;
        Relationships: [];
      };
      incomes: {
        Row: {
          id: string;
          user_id: string;
          type: "fixed" | "variable";
          amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "fixed" | "variable";
          amount: number;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["incomes"]["Insert"]>;
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          subcategory: string | null;
          description: string | null;
          amount: number;
          date: string;
          is_recurring: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          subcategory?: string | null;
          description?: string | null;
          amount: number;
          date: string;
          is_recurring?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
