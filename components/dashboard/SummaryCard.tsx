'use client';

import { Card } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
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
}: SummaryCardProps) {
  const chartData = sparklineData?.map((v) => ({ value: v })) || [];

  return (
    <Card className={`p-5 border-t-2 ${accentClass} card-hover animate-fade-in-up stagger-${index + 1}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold font-mono animate-count-up">
            ${value.toLocaleString()}
          </p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={20} />
        </div>
      </div>
      {chartData.length > 1 && (
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
