'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Trash2, Plus, Edit2, X, Download } from 'lucide-react';

interface Income {
  id: string;
  type: 'fixed' | 'variable';
  amount: number;
  description?: string;
  created_at: string;
}

const Incomes = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ type: 'fixed', amount: '', description: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'variable'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const supabase = createClient();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchIncomes(user.id);
      }
    };
    getUser();
  }, []);

  // Fetch incomes
  const fetchIncomes = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncomes(data || []);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add or Update income
  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !formData.amount) return;

    try {
      if (editingId) {
        // Update
        const { error } = await supabase
          .from('incomes')
          .update({
            type: formData.type,
            amount: parseFloat(formData.amount),
            description: formData.description || null,
          })
          .eq('id', editingId);

        if (error) throw error;
        setIncomes(incomes.map(income =>
          income.id === editingId
            ? {
                ...income,
                type: formData.type as 'fixed' | 'variable',
                amount: parseFloat(formData.amount),
                description: formData.description || undefined,
              }
            : income
        ));
        setEditingId(null);
      } else {
        // Insert
        const { data, error } = await supabase
          .from('incomes')
          .insert([
            {
              user_id: userId,
              type: formData.type,
              amount: parseFloat(formData.amount),
              description: formData.description || null,
            },
          ])
          .select();

        if (error) throw error;
        setIncomes([...(data || []), ...incomes]);
      }
      setFormData({ type: 'fixed', amount: '', description: '' });
    } catch (error) {
      console.error('Error submitting income:', error);
    }
  };

  // Start editing
  const startEdit = (income: Income) => {
    setFormData({
      type: income.type,
      amount: income.amount.toString(),
      description: income.description || '',
    });
    setEditingId(income.id);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ type: 'fixed', amount: '', description: '' });
  };

  // Delete income
  const handleDeleteIncome = async (id: string) => {
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIncomes(incomes.filter(income => income.id !== id));
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  // Filter and search incomes
  const filteredIncomes = incomes.filter(income => {
    const matchesType = filterType === 'all' || income.type === filterType;
    const matchesSearch = income.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return matchesType && (searchTerm === '' || matchesSearch);
  });

  // Calculate totals (all incomes)
  const fixedTotal = incomes
    .filter(i => i.type === 'fixed')
    .reduce((sum, i) => sum + i.amount, 0);

  const variableTotal = incomes
    .filter(i => i.type === 'variable')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalIncome = fixedTotal + variableTotal;

  // Calculate filtered totals for display
  const filteredFixedTotal = filteredIncomes
    .filter(i => i.type === 'fixed')
    .reduce((sum, i) => sum + i.amount, 0);

  const filteredVariableTotal = filteredIncomes
    .filter(i => i.type === 'variable')
    .reduce((sum, i) => sum + i.amount, 0);

  // Chart data
  const chartData = [
    { name: 'Ingresos', Fixed: fixedTotal, Variable: variableTotal }
  ];

  // Pie chart data
  const pieData = [
    { name: 'Fijos', value: fixedTotal, fill: 'oklch(0.62 0.22 280)' },
    { name: 'Variables', value: variableTotal, fill: 'oklch(0.68 0.22 30)' }
  ];

  // Monthly trend data
  const monthlyData = incomes.reduce((acc, income) => {
    const date = new Date(income.created_at);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    const existing = acc.find(item => item.month === monthYear);

    if (existing) {
      if (income.type === 'fixed') {
        existing.fixed += income.amount;
      } else {
        existing.variable += income.amount;
      }
      existing.total += income.amount;
    } else {
      acc.push({
        month: monthYear,
        fixed: income.type === 'fixed' ? income.amount : 0,
        variable: income.type === 'variable' ? income.amount : 0,
        total: income.amount
      });
    }
    return acc;
  }, [] as Array<{ month: string; fixed: number; variable: number; total: number }>);

  // Calculate statistics
  const stats = {
    averageFixed: fixedTotal > 0 ? fixedTotal / incomes.filter(i => i.type === 'fixed').length : 0,
    averageVariable: variableTotal > 0 ? variableTotal / incomes.filter(i => i.type === 'variable').length : 0,
    maxIncome: incomes.length > 0 ? Math.max(...incomes.map(i => i.amount)) : 0,
    minIncome: incomes.length > 0 ? Math.min(...incomes.map(i => i.amount)) : 0,
    fixedCount: incomes.filter(i => i.type === 'fixed').length,
    variableCount: incomes.filter(i => i.type === 'variable').length,
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Descripción', 'Tipo', 'Monto', 'Fecha'];
    const rows = incomes.map(income => [
      income.description || 'Sin descripción',
      income.type === 'fixed' ? 'Fijo' : 'Variable',
      income.amount.toFixed(2),
      new Date(income.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      '',
      ['RESUMEN', '', '', ''],
      ['Ingresos Fijos', '', fixedTotal.toFixed(2), ''],
      ['Ingresos Variables', '', variableTotal.toFixed(2), ''],
      ['Ingreso Total', '', totalIncome.toFixed(2), ''],
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ingresos_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <MaxWidthWrapper>
      <div className="py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Ingresos</h1>
          <p className="text-muted-foreground">Administra tus ingresos fijos y variables</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Ingresos Fijos</p>
            <p className="text-2xl font-bold text-primary mt-2">${fixedTotal.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Ingresos Variables</p>
            <p className="text-2xl font-bold text-accent mt-2">${variableTotal.toFixed(2)}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Ingreso Total</p>
            <p className="text-2xl font-bold text-secondary mt-2">${totalIncome.toFixed(2)}</p>
          </Card>
        </div>

        {/* Advanced Charts */}
        {incomes.length > 0 && (
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
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
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
                      label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
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
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
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

            {/* Statistics */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Estadísticas</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Promedio Fijos</p>
                  <p className="text-lg font-bold text-primary">${stats.averageFixed.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Promedio Variables</p>
                  <p className="text-lg font-bold text-accent">${stats.averageVariable.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Ingreso Máximo</p>
                  <p className="text-lg font-bold text-secondary">${stats.maxIncome.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Ingreso Mínimo</p>
                  <p className="text-lg font-bold">${stats.minIncome.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Ingresos Fijos</p>
                  <p className="text-lg font-bold text-primary">{stats.fixedCount}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Ingresos Variables</p>
                  <p className="text-lg font-bold text-accent">{stats.variableCount}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Add/Edit Income Form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar Ingreso' : 'Agregar Ingreso'}
          </h2>
          <form onSubmit={handleSubmitIncome} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'fixed' | 'variable' })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="fixed">Fijo</option>
                  <option value="variable">Variable</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción (opcional)</label>
              <Input
                type="text"
                placeholder="Ej: Sueldo, Freelance, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 gap-2">
                {editingId ? (
                  <>
                    <Edit2 size={18} />
                    Guardar Cambios
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Agregar Ingreso
                  </>
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className="gap-2"
                >
                  <X size={18} />
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Filters and Export */}
        {incomes.length > 0 && (
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
              <div className="w-full md:w-auto space-y-2">
                <label className="text-sm font-medium">Filtrar por Tipo</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'fixed' | 'variable')}
                  className="w-full md:w-48 px-3 py-2 border border-border rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">Todos</option>
                  <option value="fixed">Fijos</option>
                  <option value="variable">Variables</option>
                </select>
              </div>
              <div className="w-full md:w-auto space-y-2">
                <label className="text-sm font-medium">Buscar por Descripción</label>
                <Input
                  type="text"
                  placeholder="Ej: Sueldo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-48"
                />
              </div>
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="w-full md:w-auto gap-2"
              >
                <Download size={18} />
                Exportar CSV
              </Button>
            </div>
          </Card>
        )}

        {/* Incomes Table */}
        <Card className="p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold mb-4">Listado de Ingresos</h2>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Cargando...</p>
          ) : incomes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No hay ingresos registrados</p>
          ) : filteredIncomes.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No hay ingresos que coincidan con los filtros</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Descripción</th>
                    <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                    <th className="text-right py-3 px-4 font-semibold">Monto</th>
                    <th className="text-left py-3 px-4 font-semibold">Fecha</th>
                    <th className="text-center py-3 px-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncomes.map((income) => (
                    <tr key={income.id} className="border-b border-border hover:bg-muted/50 transition">
                      <td className="py-3 px-4">{income.description || 'Sin descripción'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            income.type === 'fixed'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-accent/20 text-accent'
                          }`}
                        >
                          {income.type === 'fixed' ? 'Fijo' : 'Variable'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">${income.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(income.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => startEdit(income)}
                            className="text-primary hover:bg-primary/20 p-2 rounded transition"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteIncome(income.id)}
                            className="text-destructive hover:bg-destructive/20 p-2 rounded transition"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 pt-4 border-t border-border text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-muted-foreground">Fijos (filtrados)</p>
                    <p className="font-semibold">${filteredFixedTotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Variables (filtrados)</p>
                    <p className="font-semibold">${filteredVariableTotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total (filtrados)</p>
                    <p className="font-semibold">${(filteredFixedTotal + filteredVariableTotal).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </MaxWidthWrapper>
  );
};

export default Incomes;
