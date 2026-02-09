'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { Plus, X, Edit2 } from 'lucide-react';
import { fetchIncomes, fetchAllIncomes, createIncome, updateIncome, deleteIncome } from '@/lib/actions/incomes.action';
import type { Income } from '@/lib/actions/incomes.action';
import { SummaryCards } from '@/components/incomes/SummaryCards';
import { IncomeCharts } from '@/components/incomes/IncomeCharts';
import { Statistics } from '@/components/incomes/Statistics';
import { IncomeTable } from '@/components/incomes/IncomeTable';
import { IncomeFilters } from '@/components/incomes/IncomeFilters';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { SummarySkeleton, ChartSkeleton, StatisticsSkeleton, TableSkeleton, LineChartSkeleton } from '@/components/incomes/Skeletons';
import { PageHeader } from '@/components/PageHeader';

const Incomes = () => {
  const { addToast } = useToast();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [allIncomes, setAllIncomes] = useState<Income[]>([]); // Para gráficos y cálculos globales
  const [loading, setLoading] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [formData, setFormData] = useState({ type: 'fixed', amount: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'fixed' | 'variable'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const pageSize = 10;

  // Fetch incomes (para tabla paginada)
  const loadIncomes = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await fetchIncomes(page, pageSize);

    if (fetchError) {
      addToast(fetchError, 'error');
      console.error('Error fetching incomes:', fetchError);
    } else if (data) {
      setIncomes(data.data || []);
    }
    setLoading(false);
  }, [addToast, page, pageSize]);

  // Fetch all incomes (para gráficos, estadísticas y cálculos)
  const loadAllIncomesForCharts = useCallback(async () => {
    setLoadingCharts(true);
    const { data, error: fetchError } = await fetchAllIncomes();

    if (fetchError) {
      console.error('Error fetching all incomes:', fetchError);
    } else {
      setAllIncomes(data || []);
    }
    setLoadingCharts(false);
  }, []);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  useEffect(() => {
    loadAllIncomesForCharts();
  }, [loadAllIncomesForCharts]);

  // Add or Update income
  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) return;

    setSubmitting(true);

    try {
      const amount = parseFloat(formData.amount);

      if (editingId) {
        // Update
        const { data, error: updateError } = await updateIncome({
          id: editingId,
          type: formData.type as 'fixed' | 'variable',
          amount,
          description: formData.description || undefined,
        });

        if (updateError) {
          addToast(updateError, 'error');
          console.error('Error updating income:', updateError);
        } else if (data) {
          setIncomes(incomes.map(income =>
            income.id === editingId
              ? {
                  ...data,
                  description: data.description || undefined,
                }
              : income
          ));
          addToast('Ingreso actualizado correctamente', 'success');
          setEditingId(null);
          setFormData({ type: 'fixed', amount: '', description: '' });
          loadAllIncomesForCharts();
        }
      } else {
        // Create
        const { data, error: createError } = await createIncome({
          type: formData.type as 'fixed' | 'variable',
          amount,
          description: formData.description || undefined,
        });

        if (createError) {
          addToast(createError, 'error');
          console.error('Error creating income:', createError);
        } else if (data) {
          setIncomes([data, ...incomes]);
          addToast('Ingreso creado correctamente', 'success');
          setFormData({ type: 'fixed', amount: '', description: '' });
          loadAllIncomesForCharts();
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      addToast(message, 'error');
      console.error('Error submitting income:', err);
    } finally {
      setSubmitting(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ type: 'fixed', amount: '', description: '' });
  };

  // Delete income
  const handleDeleteIncome = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDeleteIncome = async () => {
    if (!confirmModal.id) return;

    try {
      const { success, error: deleteError } = await deleteIncome(confirmModal.id);

      if (deleteError) {
        addToast(deleteError, 'error');
        console.error('Error deleting income:', deleteError);
      } else if (success) {
        setIncomes(incomes.filter(income => income.id !== confirmModal.id));
        addToast('Ingreso eliminado correctamente', 'success');
        loadAllIncomesForCharts();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      addToast(message, 'error');
      console.error('Error deleting income:', err);
    } finally {
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  // Filter and search incomes (usa la tabla paginada)
  const filteredIncomes = incomes.filter(income => {
    const matchesType = filterType === 'all' || income.type === filterType;
    const matchesSearch = income.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return matchesType && (searchTerm === '' || matchesSearch);
  });

  // Calculate totals (usa todos los ingresos)
  const fixedTotal = allIncomes
    .filter(i => i.type === 'fixed')
    .reduce((sum, i) => sum + i.amount, 0);

  const variableTotal = allIncomes
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
  const monthlyData = allIncomes.reduce((acc, income) => {
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

  // Calculate statistics (usa todos los ingresos)
  const stats = {
    averageFixed: fixedTotal > 0 ? fixedTotal / allIncomes.filter(i => i.type === 'fixed').length : 0,
    averageVariable: variableTotal > 0 ? variableTotal / allIncomes.filter(i => i.type === 'variable').length : 0,
    maxIncome: allIncomes.length > 0 ? Math.max(...allIncomes.map(i => i.amount)) : 0,
    minIncome: allIncomes.length > 0 ? Math.min(...allIncomes.map(i => i.amount)) : 0,
    fixedCount: allIncomes.filter(i => i.type === 'fixed').length,
    variableCount: allIncomes.filter(i => i.type === 'variable').length,
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Descripción', 'Tipo', 'Monto', 'Fecha'];
    const rows = allIncomes.map(income => [
      income.description || 'Sin descripción',
      income.type === 'fixed' ? 'Fijo' : 'Variable',
      income.amount.toFixed(2),
      new Date(income.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      '',
      ['RESUMEN', '', '', ''].join(','),
      ['Ingresos Fijos', '', fixedTotal.toFixed(2), ''].join(','),
      ['Ingresos Variables', '', variableTotal.toFixed(2), ''].join(','),
      ['Ingreso Total', '', totalIncome.toFixed(2), ''].join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ingresos_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
      <>
        {/* Header */}
        <PageHeader>
          <PageHeader.Title>Ingresos</PageHeader.Title>
          <PageHeader.Description>
            Administra y analiza tus ingresos aquí. Agrega, edita o elimina ingresos, y visualiza estadísticas detalladas para un mejor control financiero.
          </PageHeader.Description>
        </PageHeader>

        {/* Summary Cards */}
        {loadingCharts ? <SummarySkeleton /> : (
          <SummaryCards
            fixedTotal={fixedTotal}
            variableTotal={variableTotal}
            totalIncome={totalIncome}
          />
        )}

        {/* Advanced Charts */}
        {loadingCharts ? (
          <>
            <ChartSkeleton />
            <StatisticsSkeleton />
            <LineChartSkeleton />
          </>
        ) : allIncomes.length > 0 ? (
          <>
            <IncomeCharts
              chartData={chartData}
              pieData={pieData}
              monthlyData={monthlyData}
            />

            {/* Statistics */}
            <Statistics
              averageFixed={stats.averageFixed}
              averageVariable={stats.averageVariable}
              maxIncome={stats.maxIncome}
              minIncome={stats.minIncome}
              fixedCount={stats.fixedCount}
              variableCount={stats.variableCount}
            />
          </>
        ) : null}

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
              <Button type="submit" className="flex-1 gap-2" disabled={submitting}>
                {editingId ? (
                  <>
                    <Edit2 size={18} />
                    {submitting ? 'Guardando...' : 'Guardar Cambios'}
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    {submitting ? 'Agregando...' : 'Agregar Ingreso'}
                  </>
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className="gap-2"
                  disabled={submitting}
                >
                  <X size={18} />
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Filters and Export */}
        <IncomeFilters
          incomes={allIncomes}
          filterType={filterType}
          searchTerm={searchTerm}
          onFilterChange={setFilterType}
          onSearchChange={setSearchTerm}
          onExportCSV={handleExportCSV}
        />

        {/* Incomes Table */}
        {loading ? <TableSkeleton /> : (
          <IncomeTable
            incomes={incomes}
            loading={loading}
            filteredIncomes={filteredIncomes}
            filteredFixedTotal={filteredFixedTotal}
            filteredVariableTotal={filteredVariableTotal}
            onEdit={startEdit}
            onDelete={handleDeleteIncome}
          />
        )}

        {/* Confirm Delete Modal */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title="Eliminar Ingreso"
          message="¿Estás seguro de que deseas eliminar este ingreso? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          isDangerous={true}
          onConfirm={confirmDeleteIncome}
          onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        />
      </>
  );
};

export default Incomes;
