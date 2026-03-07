import { Card } from '@/components/ui/card';
import { Calculator, TrendingUp, ArrowUp, ArrowDown, Hash, Layers } from 'lucide-react';

interface StatisticsProps {
  averageFixed: number;
  averageVariable: number;
  maxIncome: number;
  minIncome: number;
  fixedCount: number;
  variableCount: number;
}

const stats: Array<{ key: string; label: string; icon: typeof Calculator; colorClass: string; isCount?: boolean }> = [
  { key: 'averageFixed', label: 'Promedio Fijos', icon: Calculator, colorClass: 'text-income' },
  { key: 'averageVariable', label: 'Promedio Variables', icon: TrendingUp, colorClass: 'text-expense' },
  { key: 'maxIncome', label: 'Ingreso Máximo', icon: ArrowUp, colorClass: 'text-primary' },
  { key: 'minIncome', label: 'Ingreso Mínimo', icon: ArrowDown, colorClass: 'text-muted-foreground' },
  { key: 'fixedCount', label: 'Ingresos Fijos', icon: Hash, colorClass: 'text-income', isCount: true },
  { key: 'variableCount', label: 'Ingresos Variables', icon: Layers, colorClass: 'text-expense', isCount: true },
];

export function Statistics({
  averageFixed,
  averageVariable,
  maxIncome,
  minIncome,
  fixedCount,
  variableCount,
}: StatisticsProps) {
  const values: Record<string, number> = {
    averageFixed,
    averageVariable,
    maxIncome,
    minIncome,
    fixedCount,
    variableCount,
  };

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.key} className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className="text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className={`text-lg font-semibold font-mono ${stat.colorClass}`}>
              {stat.isCount ? values[stat.key] : `$${values[stat.key].toLocaleString()}`}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
