'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { fetchExpenses, fetchAllExpenses, deleteExpense } from '@/lib/actions/expenses.action'
import type { Expense } from '@/lib/actions/expenses.action'
import { ExpenseDialog } from '@/components/expenses/ExpenseDialog'
import { ExpenseSummaryCards } from '@/components/expenses/ExpenseSummaryCards'
import { ExpenseTable } from '@/components/expenses/ExpenseTable'
import { useToast } from '@/components/ui/Toast'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { SummarySkeleton, ChartSkeleton, TableSkeleton } from '@/components/expenses/Skeletons'
import { PageHeader } from '@/components/PageHeader'
import { EXPENSE_CATEGORIES, getCategoryByValue } from '@/constants/expense-categories'

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload: { name: string; value: number; percentage: number; categoryValue: string } }> }) => {
  if (!active || !payload?.[0]) return null
  const data = payload[0].payload as { name: string; value: number; percentage: number; categoryValue: string }
  const category = getCategoryByValue(data.categoryValue)
  const Icon = category?.icon

  return (
    <div className="flex flex-col gap-2 p-3 border border-border rounded-lg bg-popover text-popover-foreground">
      <p className="font-medium flex items-center gap-1.5">
        {Icon && <Icon size={14} />}
        {data.name}
      </p>
      <p className="font-mono font-semibold">$ {data.value.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground">{data.percentage}% de gastos</p>
    </div>
  )
}

const ExpensesPage = () => {
  const { addToast } = useToast()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCharts, setLoadingCharts] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null })
  const [page] = useState(1)
  const pageSize = 10
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const selectedDateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-01`

  const handlePrevMonth = () =>
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))

  const handleNextMonth = () =>
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchError } = await fetchExpenses(page, pageSize, selectedDateString)

    if (fetchError) {
      addToast(fetchError, 'error')
    } else if (data) {
      setExpenses(data.data || [])
    }
    setLoading(false)
  }, [addToast, page, pageSize, selectedDateString])

  const loadAllExpenses = useCallback(async () => {
    setLoadingCharts(true)
    const { data, error: fetchError } = await fetchAllExpenses(selectedDateString)

    if (fetchError) {
      console.error('Error fetching all expenses:', fetchError)
    } else {
      setAllExpenses(data || [])
    }
    setLoadingCharts(false)
  }, [selectedDateString])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  useEffect(() => {
    loadAllExpenses()
  }, [loadAllExpenses])

  const openCreateDialog = () => {
    setEditingExpense(null)
    setDialogOpen(true)
  }

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense)
    setDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    loadExpenses()
    loadAllExpenses()
  }

  const handleDeleteExpense = (id: string) => {
    setConfirmModal({ isOpen: true, id })
  }

  const confirmDeleteExpense = async () => {
    if (!confirmModal.id) return

    try {
      const { success, error: deleteError } = await deleteExpense(confirmModal.id)

      if (deleteError) {
        addToast(deleteError, 'error')
      } else if (success) {
        setExpenses(expenses.filter(e => e.id !== confirmModal.id))
        addToast('Gasto eliminado correctamente', 'success')
        loadAllExpenses()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido'
      addToast(message, 'error')
    } finally {
      setConfirmModal({ isOpen: false, id: null })
    }
  }

  // Cálculos con datos reales
  const totalExpenses = useMemo(() =>
    allExpenses.reduce((sum, e) => sum + e.amount, 0),
    [allExpenses]
  )

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    allExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount
    })
    return totals
  }, [allExpenses])

  const topCategory = useMemo(() => {
    let maxValue = ''
    let maxAmount = 0
    Object.entries(categoryTotals).forEach(([key, amount]) => {
      if (amount > maxAmount) {
        maxValue = key
        maxAmount = amount
      }
    })
    return { value: maxValue || null, amount: maxAmount }
  }, [categoryTotals])

  // Pie chart data agrupado por categoría
  const pieData = useMemo(() => {
    return EXPENSE_CATEGORIES
      .filter(cat => categoryTotals[cat.value])
      .map(cat => ({
        name: cat.label,
        value: categoryTotals[cat.value],
        categoryValue: cat.value,
        color: cat.color,
        percentage: totalExpenses > 0
          ? Number(((categoryTotals[cat.value] / totalExpenses) * 100).toFixed(0))
          : 0,
      }))
  }, [categoryTotals, totalExpenses])

  // Top 3 categorías
  const top3Categories = useMemo(() =>
    [...pieData].sort((a, b) => b.value - a.value).slice(0, 3),
    [pieData]
  )

  return (
    <>
      <PageHeader>
        <PageHeader.Title>
          <div className="flex items-center justify-between gap-2">
            Gastos
            <div className="flex items-center gap-3">
              <MonthSelector
                selectedDate={selectedDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />
              <Button onClick={openCreateDialog}>
                <Plus size={16} />Agregar Gasto
              </Button>
            </div>
          </div>
        </PageHeader.Title>
        <PageHeader.Description>
          Administra y analiza tus gastos aquí. Agrega, edita o elimina gastos, y visualiza estadísticas detalladas para un mejor control financiero.
        </PageHeader.Description>
      </PageHeader>

      {/* Summary Cards */}
      {loadingCharts ? <SummarySkeleton /> : (
        <ExpenseSummaryCards
          totalExpenses={totalExpenses}
          topCategoryValue={topCategory.value}
          topCategoryAmount={topCategory.amount}
          expenseCount={allExpenses.length}
        />
      )}

      {/* Charts */}
      {loadingCharts ? <ChartSkeleton /> : allExpenses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="sm:col-span-1 animate-fade-in-up stagger-1">
            <CardHeader>
              <CardTitle>Distribución por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="80%"
                    outerRadius="100%"
                    cornerRadius="50%"
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={CustomTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4 sm:col-span-1 animate-fade-in-up stagger-2">
            <h3 className="text-lg font-semibold">Top 3 Categorías</h3>
            {top3Categories.map((item, index) => {
              const category = getCategoryByValue(item.categoryValue)
              const Icon = category?.icon
              return (
                <Card key={item.categoryValue} className="card-interactive">
                  <CardContent>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-muted-foreground">#{index + 1}</span>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      {Icon && <Icon size={16} className="text-muted-foreground" />}
                      <span>{item.name}</span>
                    </div>
                    <p className="text-2xl font-semibold font-mono text-expense animate-count-up">${item.value.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.percentage}% del total</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* Expenses Table */}
      {loading ? <TableSkeleton /> : (
        <ExpenseTable
          expenses={expenses}
          loading={loading}
          onEdit={openEditDialog}
          onDelete={handleDeleteExpense}
        />
      )}

      {/* Expense Dialog */}
      <ExpenseDialog
        expense={editingExpense}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Eliminar Gasto"
        message="¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={confirmDeleteExpense}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />
    </>
  )
}

export default ExpensesPage
