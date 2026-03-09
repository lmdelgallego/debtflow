'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MonthlyData {
  month: string;
  ingresos: number;
  gastos: number;
}

interface CashFlowChartProps {
  data: MonthlyData[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="p-3 border border-border rounded-lg bg-popover text-popover-foreground">
      <p className="font-medium mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm font-mono" style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  return (
    <Card className="animate-fade-in-up stagger-3">
      <CardHeader>
        <CardTitle>Ingresos vs Gastos</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.005 260)" />
            <XAxis dataKey="month" tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'oklch(0.65 0 0)', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="ingresos" fill="oklch(0.72 0.17 162)" radius={[4, 4, 0, 0]} name="Ingresos" />
            <Bar dataKey="gastos" fill="oklch(0.80 0.15 80)" radius={[4, 4, 0, 0]} name="Gastos" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
