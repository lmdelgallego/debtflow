import { z } from "zod";

export const debtInputSchema = z.object({
  name: z.string().min(1),
  balance: z.number().positive(),
  interest_rate: z.number().min(0),
  minimum_payment: z.number().positive(),
  payment_day: z.number().int().min(1).max(31)
});

export const updateDebtInputSchema = debtInputSchema.extend({
  id: z.string().uuid().or(z.string().min(1))
});

export const incomeInputSchema = z.object({
  type: z.enum(["fixed", "variable"]),
  amount: z.number().positive(),
  description: z.string().optional()
});

export const updateIncomeInputSchema = incomeInputSchema.extend({
  id: z.string().uuid().or(z.string().min(1))
});

export const expenseInputSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  amount: z.number().positive(),
  date: z.string().min(1),
  is_recurring: z.boolean().optional()
});

export const updateExpenseInputSchema = expenseInputSchema.extend({
  id: z.string().uuid().or(z.string().min(1))
});

export type CreateDebtInput = z.infer<typeof debtInputSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtInputSchema>;
export type CreateIncomeInput = z.infer<typeof incomeInputSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeInputSchema>;
export type CreateExpenseInput = z.infer<typeof expenseInputSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseInputSchema>;
