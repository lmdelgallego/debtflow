'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createDebt, updateDebt } from '@/lib/actions/debts.action'
import type { Debt } from '@debtflow/types'
import { debtSchema, type DebtFormValues } from '@debtflow/validators'
import { useToast } from '@/components/ui/Toast'

interface DebtDialogProps {
  debt?: Debt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DebtDialog({ debt, open, onOpenChange, onSuccess }: DebtDialogProps) {
  const { addToast } = useToast()
  const isEditing = !!debt

  const form = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      name: '',
      balance: '',
      interest_rate: '',
      minimum_payment: '',
      payment_day: '',
    },
  })

  useEffect(() => {
    if (debt) {
      form.reset({
        name: debt.name,
        balance: debt.balance.toString(),
        interest_rate: debt.interest_rate.toString(),
        minimum_payment: debt.minimum_payment.toString(),
        payment_day: debt.payment_day.toString(),
      })
    } else {
      form.reset({
        name: '',
        balance: '',
        interest_rate: '',
        minimum_payment: '',
        payment_day: '',
      })
    }
  }, [debt, form])

  const onSubmit = async (values: DebtFormValues) => {
    const balance = parseFloat(values.balance)
    const interest_rate = parseFloat(values.interest_rate)
    const minimum_payment = parseFloat(values.minimum_payment)
    const payment_day = parseInt(values.payment_day)

    if (isNaN(balance) || balance <= 0) return
    if (isNaN(interest_rate) || interest_rate < 0) return
    if (isNaN(minimum_payment) || minimum_payment <= 0) return
    if (isNaN(payment_day) || payment_day < 1 || payment_day > 31) return

    const input = { name: values.name, balance, interest_rate, minimum_payment, payment_day }

    if (isEditing) {
      const { error } = await updateDebt({ id: debt.id, ...input })

      if (error) {
        addToast(error, 'error')
      } else {
        addToast('Deuda actualizada correctamente', 'success')
        form.reset()
        onOpenChange(false)
        onSuccess()
      }
    } else {
      const { error } = await createDebt(input)

      if (error) {
        addToast(error, 'error')
      } else {
        addToast('Deuda creada correctamente', 'success')
        form.reset()
        onOpenChange(false)
        onSuccess()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Deuda' : 'Agregar Deuda'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos de la deuda seleccionada.'
              : 'Llena el formulario para agregar una nueva deuda.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Tarjeta Visa, Préstamo Auto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interest_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tasa Anual (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minimum_payment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pago Mínimo</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="payment_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Día de Pago</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={31} placeholder="1-31" {...field} />
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
                {form.formState.isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Agregar Deuda'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
