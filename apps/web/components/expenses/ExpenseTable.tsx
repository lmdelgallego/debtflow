import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Trash2, Pencil, CreditCard } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Expense } from '@/lib/actions/expenses.action';
import { getCategoryByValue } from '@/constants/expense-categories';

interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

function MobileExpenseCard({ expense, onEdit, onDelete }: { expense: Expense; onEdit: (expense: Expense) => void; onDelete: (id: string) => void }) {
  const category = getCategoryByValue(expense.category);
  const Icon = category?.icon;

  return (
    <div className="p-4 rounded-lg border border-border bg-card animate-fade-in-up">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {Icon && <Icon size={14} className="text-muted-foreground shrink-0" />}
          <span className="font-medium truncate">{category?.label || expense.category}</span>
        </div>
        <div className="flex gap-1 shrink-0 ml-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => onEdit(expense)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(expense.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{expense.description || 'Sin descripción'}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-lg font-semibold font-mono text-expense">- ${expense.amount.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(expense.date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}

export function ExpenseTable({ expenses, loading, onEdit, onDelete }: ExpenseTableProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Historial de Gastos</h2>
      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Cargando...</p>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Sin gastos registrados"
          description="Agrega tu primer gasto para comenzar a visualizar tus estadísticas y mantener el control de tus finanzas."
          iconColorClass="text-expense"
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => {
                  const category = getCategoryByValue(expense.category);
                  const Icon = category?.icon;
                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">
                        <span className="flex items-center gap-2">
                          {Icon && <Icon size={14} className="text-muted-foreground" />}
                          {category?.label || expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(expense.date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </TableCell>
                      <TableCell>{expense.description || 'Sin descripción'}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-expense">
                        - ${expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEdit(expense)}
                                className="gap-1 h-8"
                              >
                                <Pencil size={14} />
                                Editar
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar gasto</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDelete(expense.id)}
                                className="gap-1 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 size={14} />
                                Eliminar
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar gasto</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {expenses.map((expense) => (
              <MobileExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border text-sm">
            <div className="flex justify-between">
              <p className="text-muted-foreground">Total</p>
              <p className="font-semibold font-mono text-expense">- ${total.toLocaleString()}</p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
