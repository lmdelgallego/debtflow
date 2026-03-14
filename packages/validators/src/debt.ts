import { z } from 'zod';

export const debtSchema = z.object({
  name: z.string().min(1, 'Ingresa un nombre'),
  balance: z.string().min(1, 'Ingresa el saldo'),
  interest_rate: z.string().min(1, 'Ingresa la tasa de interés'),
  minimum_payment: z.string().min(1, 'Ingresa el pago mínimo'),
  payment_day: z.string().min(1, 'Ingresa el día de pago'),
});

export type DebtFormValues = z.infer<typeof debtSchema>;

export const payDebtSchema = z.object({
  amount: z.string().min(1, 'Ingresa un monto válido'),
});

export type PayDebtFormValues = z.infer<typeof payDebtSchema>;
