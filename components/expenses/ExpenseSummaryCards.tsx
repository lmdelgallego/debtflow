import { Card } from '@/components/ui/card';
import { Wallet, TrendingUp, Hash } from 'lucide-react';
import { getCategoryByValue } from '@/constants/expense-categories';

interface ExpenseSummaryCardsProps {
  totalExpenses: number;
  topCategoryValue: string | null;
  topCategoryAmount: number;
  expenseCount: number;
}

export function ExpenseSummaryCards({ totalExpenses, topCategoryValue, topCategoryAmount, expenseCount }: ExpenseSummaryCardsProps) {
  const topCategory = topCategoryValue ? getCategoryByValue(topCategoryValue) : null;
  const TopIcon = topCategory?.icon || TrendingUp;

  const cards = [
    {
      key: 'total',
      label: 'Total de Gastos',
      value: `$${totalExpenses.toLocaleString()}`,
      accent: 'border-t-expense',
      iconBg: 'bg-expense/10 text-expense',
      textColor: 'text-expense',
      Icon: Wallet,
    },
    {
      key: 'top',
      label: 'Categoría más alta',
      value: topCategory ? `${topCategory.label}: $${topCategoryAmount.toLocaleString()}` : 'N/A',
      accent: 'border-t-expense',
      iconBg: 'bg-expense/10 text-expense',
      textColor: 'text-expense',
      Icon: TopIcon,
    },
    {
      key: 'count',
      label: 'Número de Gastos',
      value: expenseCount.toString(),
      accent: 'border-t-expense',
      iconBg: 'bg-expense/10 text-expense',
      textColor: 'text-expense',
      Icon: Hash,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <Card
          key={card.key}
          className={`p-5 border-t-2 ${card.accent} card-hover animate-fade-in-up stagger-${i + 1}`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className={`text-2xl font-semibold font-mono ${card.textColor} animate-count-up`}>
                {card.value}
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
