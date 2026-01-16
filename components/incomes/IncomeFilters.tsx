import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download } from 'lucide-react';
import type { Income } from '@/lib/actions/incomes.action';

interface IncomeFiltersProps {
  incomes: Income[];
  filterType: 'all' | 'fixed' | 'variable';
  searchTerm: string;
  onFilterChange: (type: 'all' | 'fixed' | 'variable') => void;
  onSearchChange: (term: string) => void;
  onExportCSV: () => void;
}

export function IncomeFilters({
  incomes,
  filterType,
  searchTerm,
  onFilterChange,
  onSearchChange,
  onExportCSV,
}: IncomeFiltersProps) {
  if (incomes.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
        <div className="w-full md:w-auto space-y-2">
          <label className="text-sm font-medium">Filtrar por Tipo</label>
          <select
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value as 'all' | 'fixed' | 'variable')}
            className="w-full md:w-48 px-3 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Todos</option>
            <option value="fixed">Fijos</option>
            <option value="variable">Variables</option>
          </select>
        </div>
        <div className="w-full md:w-auto space-y-2">
          <label className="text-sm font-medium">Buscar por Descripción</label>
          <Input
            type="text"
            placeholder="Ej: Sueldo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full md:w-48"
          />
        </div>
        <Button
          onClick={onExportCSV}
          variant="outline"
          className="w-full md:w-auto gap-2"
        >
          <Download size={18} />
          Exportar CSV
        </Button>
      </div>
    </Card>
  );
}
