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
import { Trash2, Edit2, DollarSign, SearchX } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Income } from '@/lib/actions/incomes.action';

interface IncomeTableProps {
  incomes: Income[];
  loading: boolean;
  filteredIncomes: Income[];
  filteredFixedTotal: number;
  filteredVariableTotal: number;
  onEdit: (income: Income) => void;
  onDelete: (id: string) => Promise<void>;
}

function MobileIncomeCard({ income, onEdit, onDelete }: { income: Income; onEdit: (income: Income) => void; onDelete: (id: string) => Promise<void> }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card card-hover animate-fade-in-up">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{income.description || 'Sin descripción'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(income.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ml-2 ${
          income.type === 'fixed'
            ? 'bg-income/15 text-income'
            : 'bg-expense/15 text-expense'
        }`}>
          {income.type === 'fixed' ? 'Fijo' : 'Variable'}
        </span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-lg font-semibold font-mono">${income.amount.toLocaleString()}</p>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(income)} className="gap-1 h-8">
            <Edit2 size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(income.id)}
            className="gap-1 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function IncomeTable({
  incomes,
  loading,
  filteredIncomes,
  filteredFixedTotal,
  filteredVariableTotal,
  onEdit,
  onDelete,
}: IncomeTableProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Listado de Ingresos</h2>
      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Cargando...</p>
      ) : incomes.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="Sin ingresos registrados"
          description="Comienza agregando tu primer ingreso para ver el resumen y las estadísticas de tu flujo financiero."
          iconColorClass="text-income"
        />
      ) : filteredIncomes.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Sin resultados"
          description="No hay ingresos que coincidan con los filtros seleccionados. Intenta ajustar tu búsqueda."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomes.map((income) => (
                  <TableRow key={income.id}>
                    <TableCell>{income.description || 'Sin descripción'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        income.type === 'fixed'
                          ? 'bg-income/15 text-income'
                          : 'bg-expense/15 text-expense'
                      }`}>
                        {income.type === 'fixed' ? 'Fijo' : 'Variable'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold font-mono">
                      ${income.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(income.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(income)}
                              className="gap-1 h-8"
                            >
                              <Edit2 size={14} />
                              Editar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar ingreso</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(income.id)}
                              className="gap-1 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 size={14} />
                              Eliminar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar ingreso</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden space-y-3">
            {filteredIncomes.map((income) => (
              <MobileIncomeCard
                key={income.id}
                income={income}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-muted-foreground">Fijos (filtrados)</p>
                <p className="font-semibold font-mono">${filteredFixedTotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Variables (filtrados)</p>
                <p className="font-semibold font-mono">${filteredVariableTotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total (filtrados)</p>
                <p className="font-semibold font-mono">${(filteredFixedTotal + filteredVariableTotal).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
