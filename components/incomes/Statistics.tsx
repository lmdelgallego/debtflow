import { Card } from '@/components/ui/card';

interface StatisticsProps {
  averageFixed: number;
  averageVariable: number;
  maxIncome: number;
  minIncome: number;
  fixedCount: number;
  variableCount: number;
}

export function Statistics({
  averageFixed,
  averageVariable,
  maxIncome,
  minIncome,
  fixedCount,
  variableCount,
}: StatisticsProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">Promedio Fijos</p>
          <p className="text-lg font-bold text-primary">${averageFixed.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">Promedio Variables</p>
          <p className="text-lg font-bold text-accent">${averageVariable.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">Ingreso Máximo</p>
          <p className="text-lg font-bold text-secondary">${maxIncome.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">Ingreso Mínimo</p>
          <p className="text-lg font-bold">${minIncome.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">Ingresos Fijos</p>
          <p className="text-lg font-bold text-primary">{fixedCount}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground">Ingresos Variables</p>
          <p className="text-lg font-bold text-accent">{variableCount}</p>
        </div>
      </div>
    </Card>
  );
}
