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

export function IncomeCharts({
  chartData,
  pieData,
  monthlyData,
}: IncomeChartsProps) {
  return (
    <div className="space-y-6">
      {/* Bar Chart and Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Comparativa de Ingresos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Fixed" fill="oklch(0.62 0.22 280)" name="Fijos" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Variable" fill="oklch(0.68 0.22 30)" name="Variables" radius={[8, 8, 0, 0]} />
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
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${(value as number).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Line Chart - Monthly Trend */}
      {monthlyData.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Tendencia Mensual de Ingresos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value as number).toFixed(2)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="fixed"
                stroke="oklch(0.62 0.22 280)"
                name="Fijos"
                strokeWidth={2}
                dot={{ fill: 'oklch(0.62 0.22 280)', r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="variable"
                stroke="oklch(0.68 0.22 30)"
                name="Variables"
                strokeWidth={2}
                dot={{ fill: 'oklch(0.68 0.22 30)', r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="oklch(0.72 0.19 42)"
                name="Total"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: 'oklch(0.72 0.19 42)', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
