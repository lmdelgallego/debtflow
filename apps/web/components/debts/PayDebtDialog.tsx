'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { payDebt } from '@/lib/actions/debts.action';
import type { Debt } from '@debtflow/types';
import { payDebtSchema } from '@debtflow/validators';
import { useToast } from '@/components/ui/Toast';

type PayFormValues = { amount: string };

interface PayDebtDialogProps {
  debt?: Debt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PayDebtDialog({ debt, open, onOpenChange, onSuccess }: PayDebtDialogProps) {
  const { addToast } = useToast();

  const form = useForm<PayFormValues>({
    resolver: zodResolver(payDebtSchema),
    defaultValues: {
      amount: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ amount: '' });
    }
  }, [open, form]);

  const onSubmit = async (values: PayFormValues) => {
    if (!debt) return;

    const amount = parseFloat(values.amount);
    if (isNaN(amount) || amount <= 0) {
      form.setError('amount', { message: 'El monto debe ser mayor a 0' });
      return;
    }
    
    if (amount > debt.balance) {
      form.setError('amount', { message: 'El monto no puede superar el balance actual' });
      return;
    }

    const { error } = await payDebt(debt.id, amount, true);

    if (error) {
      addToast(error, 'error');
    } else {
      addToast(`Abono a ${debt.name} registrado con éxito`, 'success');
      form.reset();
      onOpenChange(false);
      onSuccess();
    }
  };

  if (!debt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pagar Deuda: {debt.name}</DialogTitle>
          <DialogDescription>
            Ingresa el monto que deseas abonar. El balance actual es de {' '}
            <span className="font-mono font-bold text-debt">
              ${debt.balance.toLocaleString()}
            </span>.
            Esto generará un gasto automáticamente en tu flujo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto a Pagar</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" max={debt.balance} placeholder="Ej: 500" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Procesando...' : 'Confirmar Pago'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
