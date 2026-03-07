import { Card } from '@/components/ui/card';
import { Landmark, Hash, Percent, CreditCard } from 'lucide-react';

interface DebtSummaryCardsProps {
  totalDebt: number;
  debtCount: number;
  avgInterestRate: number;
  totalMinimumPayment: number;
}

const cards = [
  {
    key: 'totalDebt',
    label: 'Deuda Total',
    getValue: (p: DebtSummaryCardsProps) => `$${p.totalDebt.toLocaleString()}`,
    accent: 'border-t-debt',
    iconBg: 'bg-debt/10 text-debt',
    textColor: 'text-debt',
    Icon: Landmark,
  },
  {
    key: 'debtCount',
    label: 'Deudas Activas',
    getValue: (p: DebtSummaryCardsProps) => p.debtCount.toString(),
    accent: 'border-t-debt',
    iconBg: 'bg-debt/10 text-debt',
    textColor: 'text-debt',
    Icon: Hash,
  },
  {
    key: 'avgRate',
    label: 'Tasa Promedio',
    getValue: (p: DebtSummaryCardsProps) => `${p.avgInterestRate.toFixed(1)}%`,
    accent: 'border-t-[var(--primary)]',
    iconBg: 'bg-primary/10 text-primary',
    textColor: 'text-primary',
    Icon: Percent,
  },
  {
    key: 'minPayment',
    label: 'Pago Mínimo Total',
    getValue: (p: DebtSummaryCardsProps) => `$${p.totalMinimumPayment.toLocaleString()}`,
    accent: 'border-t-expense',
    iconBg: 'bg-expense/10 text-expense',
    textColor: 'text-expense',
    Icon: CreditCard,
  },
];

export function DebtSummaryCards(props: DebtSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <Card
          key={card.key}
          className={`p-5 border-t-2 ${card.accent} card-hover animate-fade-in-up stagger-${i + 1}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className={`text-2xl font-semibold font-mono ${card.textColor} animate-count-up`}>
                {card.getValue(props)}
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
