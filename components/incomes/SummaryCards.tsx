import { Card } from '@/components/ui/card';

interface SummaryCardsProps {
  fixedTotal: number;
  variableTotal: number;
  totalIncome: number;
}

export function SummaryCards({
  fixedTotal,
  variableTotal,
  totalIncome,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Ingresos Fijos</p>
        <p className="text-2xl font-bold text-primary mt-2">${fixedTotal.toLocaleString()}</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Ingresos Variables</p>
        <p className="text-2xl font-bold text-accent mt-2">${variableTotal.toLocaleString()}</p>
      </Card>
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Ingreso Total</p>
        <p className="text-2xl font-bold text-secondary mt-2">${totalIncome.toLocaleString()}</p>
      </Card>
    </div>
  );
}
