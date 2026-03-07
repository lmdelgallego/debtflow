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
import { Trash2, Edit2, HandCoins, SearchX } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Debt } from '@/lib/actions/debts.action';

interface DebtTableProps {
  debts: Debt[];
  loading: boolean;
  filteredDebts: Debt[];
  onEdit: (debt: Debt) => void;
  onDelete: (id: string) => Promise<void>;
}

function MobileDebtCard({ debt, onEdit, onDelete }: { debt: Debt; onEdit: (debt: Debt) => void; onDelete: (id: string) => Promise<void> }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card card-hover animate-fade-in-up">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{debt.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tasa: <span className="font-mono">{debt.interest_rate}%</span> · Día {debt.payment_day}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <div>
          <p className="text-lg font-semibold font-mono text-debt">${debt.balance.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Mín: <span className="font-mono">${debt.minimum_payment.toLocaleString()}</span></p>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => onEdit(debt)} className="gap-1 h-8">
            <Edit2 size={14} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(debt.id)}
            className="gap-1 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DebtTable({
  debts,
  loading,
  filteredDebts,
  onEdit,
  onDelete,
}: DebtTableProps) {
  const totalBalance = filteredDebts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinimum = filteredDebts.reduce((sum, d) => sum + d.minimum_payment, 0);

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Listado de Deudas</h2>
      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Cargando...</p>
      ) : debts.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="Sin deudas registradas"
          description="Comienza agregando tu primera deuda para ver el resumen y las recomendaciones de pago."
          iconColorClass="text-debt"
        />
      ) : filteredDebts.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Sin resultados"
          description="No hay deudas que coincidan con la búsqueda. Intenta ajustar tu filtro."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Tasa %</TableHead>
                  <TableHead className="text-right">Pago Mínimo</TableHead>
                  <TableHead className="text-center">Día</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDebts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">{debt.name}</TableCell>
                    <TableCell className="text-right font-semibold font-mono text-debt">
                      ${debt.balance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {debt.interest_rate}%
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${debt.minimum_payment.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      {debt.payment_day}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit(debt)}
                              className="gap-1 h-8"
                            >
                              <Edit2 size={14} />
                              Editar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Editar deuda</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onDelete(debt.id)}
                              className="gap-1 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 size={14} />
                              Eliminar
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar deuda</TooltipContent>
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
            {filteredDebts.map((debt) => (
              <MobileDebtCard
                key={debt.id}
                debt={debt}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Total Saldo</p>
                <p className="font-semibold font-mono text-debt">${totalBalance.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Pago Mínimo</p>
                <p className="font-semibold font-mono">${totalMinimum.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
