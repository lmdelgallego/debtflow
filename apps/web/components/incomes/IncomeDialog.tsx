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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createIncome, updateIncome } from '@/lib/actions/incomes.action'
import type { Income } from '@debtflow/types'
import { incomeSchema, type IncomeFormValues } from '@debtflow/validators'
import { useToast } from '@/components/ui/Toast'

interface IncomeDialogProps {
  income?: Income | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function IncomeDialog({ income, open, onOpenChange, onSuccess }: IncomeDialogProps) {
  const { addToast } = useToast()
  const isEditing = !!income

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      type: 'fixed',
      amount: '',
      description: '',
    },
  })

  useEffect(() => {
    if (income) {
      form.reset({
        type: income.type,
        amount: income.amount.toString(),
        description: income.description || '',
      })
    } else {
      form.reset({
        type: 'fixed',
        amount: '',
        description: '',
      })
    }
  }, [income, form])

  const onSubmit = async (values: IncomeFormValues) => {
    const amount = parseFloat(values.amount)
    if (isNaN(amount) || amount <= 0) return

    if (isEditing) {
      const { error } = await updateIncome({
        id: income.id,
        type: values.type as 'fixed' | 'variable',
        amount,
        description: values.description || undefined,
      })

      if (error) {
        addToast(error, 'error')
      } else {
        addToast('Ingreso actualizado correctamente', 'success')
        form.reset()
        onOpenChange(false)
        onSuccess()
      }
    } else {
      const { error } = await createIncome({
        type: values.type as 'fixed' | 'variable',
        amount,
        description: values.description || undefined,
      })

      if (error) {
        addToast(error, 'error')
      } else {
        addToast('Ingreso creado correctamente', 'success')
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
          <DialogTitle>{isEditing ? 'Editar Ingreso' : 'Agregar Ingreso'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del ingreso seleccionado.'
              : 'Llena el formulario para agregar un nuevo ingreso.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fixed">Fijo</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Sueldo, Freelance, etc." {...field} />
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
                {form.formState.isSubmitting ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Agregar Ingreso'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
