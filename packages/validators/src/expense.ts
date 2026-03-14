import { z } from 'zod';

export const expenseSchema = z.object({
  category: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().min(1, 'Ingresa una descripción'),
  amount: z.string().min(1, 'Ingresa un monto'),
  date: z.string().min(1, 'Selecciona una fecha'),
  is_recurring: z.boolean(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
