import { z } from 'zod';

export const incomeSchema = z.object({
  type: z.string().min(1, 'Selecciona un tipo'),
  amount: z.string().min(1, 'Ingresa un monto'),
  description: z.string().optional(),
});

export type IncomeFormValues = z.infer<typeof incomeSchema>;
