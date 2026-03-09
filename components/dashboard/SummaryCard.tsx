'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SummaryCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accentClass: string;
  iconBg: string;
  sparklineData?: number[];
  sparklineColor?: string;
  index?: number;
  size?: 'default' | 'hero';
  /** If provided, shows a positive/negative trend indicator */
  trend?: 'positive' | 'negative' | 'neutral';
  /** Small descriptive note below the value */
  hint?: string;
  /** Optional top items list to display below the card */
  topItems?: { name: string; amount: number }[];
}

export function SummaryCard({
  label,
  value,
  icon: Icon,
  accentClass,
  iconBg,
  sparklineData,
  sparklineColor = 'oklch(0.65 0.15 250)',
  index = 0,
  size = 'default',
  trend,
  hint,
  topItems,
}: SummaryCardProps) {
  const chartData = sparklineData?.map((v) => ({ value: v })) || [];

  const isHero = size === 'hero';

  const TrendIcon = trend === 'positive' ? TrendingUp : TrendingDown;
  const trendColor =
    trend === 'positive' ? 'text-income' : trend === 'negative' ? 'text-expense' : 'text-muted-foreground';

  return (
    <Card
      className={cn(
        `border-t-2 ${accentClass} card-hover animate-fade-in-up stagger-${index + 1}`,
        isHero ? 'p-6' : 'p-5',
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('space-y-1', isHero ? 'space-y-2' : '')}>
          <p className={cn('text-muted-foreground', isHero ? 'text-sm font-medium uppercase tracking-wider' : 'text-sm')}>
            {label}
          </p>
          <p
            className={cn(
              'font-semibold font-mono animate-count-up',
              isHero ? 'text-4xl' : 'text-2xl',
              trend === 'positive' && 'text-income',
              trend === 'negative' && 'text-expense',
            )}
          >
            ${value.toLocaleString()}
          </p>
          {trend && trend !== 'neutral' && (
            <div className={cn('flex items-center gap-1.5 text-xs font-medium', trendColor)}>
              <TrendIcon size={12} />
              <span>{trend === 'positive' ? 'Flujo positivo' : 'Flujo negativo'}</span>
            </div>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn('flex shrink-0 items-center justify-center rounded-lg', iconBg, isHero ? 'h-12 w-12' : 'h-10 w-10')}>
          <Icon size={isHero ? 22 : 20} />
        </div>
      </div>
      {chartData.length > 1 && (
        <div className={cn('mt-3', isHero ? 'h-14' : 'h-10')}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={isHero ? 2 : 1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Top Items section */}
      {topItems && topItems.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-border/40 pt-3">
          {topItems.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate pr-2 max-w-[65%]">
                {item.name}
              </span>
              <span className="font-mono font-medium truncate">
                ${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
