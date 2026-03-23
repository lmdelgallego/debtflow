'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createExpense, updateExpense } from '@/lib/actions/expenses.action'
import type { Expense } from '@/lib/actions/expenses.action'
import { useToast } from '@/components/ui/Toast'
import { EXPENSE_CATEGORIES } from '@/constants/expense-categories'

const expenseSchema = z.object({
  category: z.string().min(1, 'Selecciona una categoría'),
  description: z.string().min(1, 'Ingresa una descripción'),
  amount: z.string().min(1, 'Ingresa un monto'),
  date: z.string().min(1, 'Selecciona una fecha'),
  is_recurring: z.boolean(),
})

type ExpenseFormValues = z.infer<typeof expenseSchema>

interface ExpenseDialogProps {
  expense?: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ExpenseDialog({ expense, open, onOpenChange, onSuccess }: ExpenseDialogProps) {
  const { addToast } = useToast()
  const isEditing = !!expense

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      is_recurring: false,
    },
  })

  useEffect(() => {
    if (expense) {
      form.reset({
        category: expense.category,
        description: expense.description || '',
        amount: expense.amount.toString(),
        date: expense.date,
        is_recurring: expense.is_recurring ?? false,
      })
    } else {
      form.reset({
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
      })
    }
  }, [expense, form])

  const onSubmit = async (values: ExpenseFormValues) => {
    const amount = parseFloat(values.amount)
    if (isNaN(amount) || amount <= 0) return

    if (isEditing) {
      const { error } = await updateExpense({
        id: expense.id,
        category: values.category,
        description: values.description || undefined,
        amount,
        date: values.date,
        is_recurring: values.is_recurring,
      })

      if (error) {
        addToast(error, 'error')
      } else {
        addToast('Gasto actualizado correctamente', 'success')
        form.reset()
        onOpenChange(false)
        onSuccess()
      }
    } else {
      const { error } = await createExpense({
        category: values.category,
        description: values.description || undefined,
        amount,
        date: values.date,
        is_recurring: values.is_recurring,
      })

      if (error) {
        addToast(error, 'error')
      } else {
        addToast('Gasto creado correctamente', 'success')
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
          <DialogTitle>{isEditing ? 'Editar Gasto' : 'Agregar Gasto'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del gasto seleccionado.'
              : 'Llena el formulario para agregar un nuevo gasto.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Compra en supermercado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_recurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Gasto Recurrente</FormLabel>
                    <DialogDescription>
                      Este gasto se copiará automáticamente los próximos meses.
                    </DialogDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Agregar Gasto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
