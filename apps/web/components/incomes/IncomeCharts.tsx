import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface IncomeChartsProps {
  chartData: Array<{ name: string; Fixed: number; Variable: number }>;
  pieData: Array<{ name: string; value: number; fill: string }>;
  monthlyData: Array<{
    month: string;
    fixed: number;
    variable: number;
    total: number;
  }>;
}

const CHART_COLORS = {
  fixed: 'oklch(0.72 0.17 162)',
  variable: 'oklch(0.80 0.15 80)',
  total: 'oklch(0.65 0.15 250)',
};

const PIE_FILLS = [
  'oklch(0.72 0.17 162)',
  'oklch(0.80 0.15 80)',
];

const chartTooltipStyle = {
  backgroundColor: 'oklch(0.17 0.005 260)',
  border: '1px solid oklch(0.25 0.005 260)',
  borderRadius: '0.5rem',
  color: 'oklch(0.93 0 0)',
};

export function IncomeCharts({
  chartData,
  pieData,
  monthlyData,
}: IncomeChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Comparativa de Ingresos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.005 260)" strokeOpacity={0.5} />
              <XAxis dataKey="name" stroke="oklch(0.65 0 0)" fontSize={12} />
              <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
              <Tooltip
                formatter={(value) => `$${(value as number).toLocaleString()}`}
                contentStyle={chartTooltipStyle}
              />
              <Legend />
              <Bar dataKey="Fixed" fill={CHART_COLORS.fixed} name="Fijos" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Variable" fill={CHART_COLORS.variable} name="Variables" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Distribución de Ingresos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: $${entry.value.toLocaleString()}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_FILLS[index % PIE_FILLS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `$${(value as number).toLocaleString()}`}
                contentStyle={chartTooltipStyle}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {monthlyData.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tendencia Mensual de Ingresos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.005 260)" strokeOpacity={0.5} />
              <XAxis dataKey="month" stroke="oklch(0.65 0 0)" fontSize={12} />
              <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
              <Tooltip
                formatter={(value) => `$${(value as number).toFixed(2)}`}
                contentStyle={chartTooltipStyle}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="fixed"
                stroke={CHART_COLORS.fixed}
                name="Fijos"
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.fixed, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="variable"
                stroke={CHART_COLORS.variable}
                name="Variables"
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.variable, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={CHART_COLORS.total}
                name="Total"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: CHART_COLORS.total, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
