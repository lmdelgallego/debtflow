import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit2 } from 'lucide-react';
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
    <Card className="p-6 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Listado de Ingresos</h2>
      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Cargando...</p>
      ) : incomes.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No hay ingresos registrados</p>
      ) : filteredIncomes.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No hay ingresos que coincidan con los filtros</p>
      ) : (
        <>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Descripción</th>
                <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                <th className="text-right py-3 px-4 font-semibold">Monto</th>
                <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                <th className="text-center py-3 px-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncomes.map((income) => (
                <tr key={income.id} className="border-b border-border hover:bg-muted/50 transition">
                  <td className="py-3 px-4">{income.description || 'Sin descripción'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      income.type === 'fixed'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-accent/20 text-accent'
                    }`}>
                      {income.type === 'fixed' ? 'Fijo' : 'Variable'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold">${income.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {new Date(income.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(income)}
                        className="gap-1"
                      >
                        <Edit2 size={16} />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(income.id)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 pt-4 border-t border-border text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-muted-foreground">Fijos (filtrados)</p>
                <p className="font-semibold">${filteredFixedTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Variables (filtrados)</p>
                <p className="font-semibold">${filteredVariableTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total (filtrados)</p>
                <p className="font-semibold">${(filteredFixedTotal + filteredVariableTotal).toFixed(2)}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
