import { Card } from '@/components/ui/card';
import { Landmark, TrendingUp, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  fixedTotal: number;
  variableTotal: number;
  totalIncome: number;
}

const cards = [
  {
    key: 'fixed',
    label: 'Ingresos Fijos',
    getValue: (p: SummaryCardsProps) => p.fixedTotal,
    accent: 'border-t-income',
    iconBg: 'bg-income/10 text-income',
    textColor: 'text-income',
    Icon: Landmark,
  },
  {
    key: 'variable',
    label: 'Ingresos Variables',
    getValue: (p: SummaryCardsProps) => p.variableTotal,
    accent: 'border-t-expense',
    iconBg: 'bg-expense/10 text-expense',
    textColor: 'text-expense',
    Icon: TrendingUp,
  },
  {
    key: 'total',
    label: 'Ingreso Total',
    getValue: (p: SummaryCardsProps) => p.totalIncome,
    accent: 'border-t-[var(--primary)]',
    iconBg: 'bg-primary/10 text-primary',
    textColor: 'text-primary',
    Icon: Wallet,
  },
];

export function SummaryCards(props: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <Card
          key={card.key}
          className={`p-5 border-t-2 ${card.accent} animate-fade-in-up stagger-${i + 1}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className={`text-2xl font-semibold font-mono ${card.textColor} animate-count-up`}>
                ${card.getValue(props).toLocaleString()}
              </p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
              <card.Icon size={20} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
