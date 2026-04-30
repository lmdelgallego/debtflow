'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Calculator } from 'lucide-react';
import { fetchDebts, fetchAllDebts, deleteDebt } from '@/lib/actions/debts.action';
import type { Debt } from '@/lib/actions/debts.action';
import { fetchAllIncomes } from '@/lib/actions/incomes.action';
import { fetchAllExpenses } from '@/lib/actions/expenses.action';
import { DebtDialog } from '@/components/debts/DebtDialog';
import { DebtSummaryCards } from '@/components/debts/DebtSummaryCards';
import { DebtTargetCard } from '@/components/debts/DebtTargetCard';
import { MethodComparisonCard } from '@/components/debts/MethodComparisonCard';
import { DebtTable } from '@/components/debts/DebtTable';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DebtSummarySkeleton, DebtTableSkeleton } from '@/components/debts/Skeletons';
import { PageHeader } from '@/components/PageHeader';
import { MonthSelector } from '@/components/ui/MonthSelector';

function filterByMonth<T extends { created_at?: string; date?: string }>(
  items: T[],
  selectedDate: Date,
  dateField: 'created_at' | 'date' = 'created_at',
): T[] {
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  return items.filter((item) => {
    const d = new Date(
      (dateField === 'date' && 'date' in item ? item.date : item.created_at) || item.created_at || '',
    );
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });
}

const Debts = () => {
  const { addToast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [allDebts, setAllDebts] = useState<Debt[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [activeMobileSection, setActiveMobileSection] = useState<'add' | 'simulate'>('add');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const pageSize = 10;

  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const sectionMap: Array<{ id: string; action: 'add' | 'simulate' }> = [
      { id: 'listado-deudas', action: 'add' },
      { id: 'simular-deudas', action: 'simulate' },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length === 0) return;

        const topVisible = visibleEntries[0];
        const match = sectionMap.find((section) => section.id === topVisible.target.id);
        if (match) {
          setActiveMobileSection(match.action);
        }
      },
      { threshold: [0.2, 0.45, 0.7] },
    );

    sectionMap.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [loadingAll, loading, debts.length, allDebts.length]);

  // Fetch debts (para tabla paginada)
  const loadDebts = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await fetchDebts(page, pageSize);

    if (fetchError) {
      addToast(fetchError, 'error');
    } else if (data) {
      setDebts(data.data || []);
    }
    setLoading(false);
  }, [addToast, page, pageSize]);

  // Fetch all debts + income + expenses (para summary cards y target card)
  // Filter income/expenses by selected month for accurate budget calculation
  const loadAllDebts = useCallback(async () => {
    setLoadingAll(true);
    const [debtRes, incomeRes, expenseRes] = await Promise.all([
      fetchAllDebts(),
      fetchAllIncomes(),
      fetchAllExpenses(),
    ]);

    if (debtRes.error) {
      console.error('Error fetching all debts:', debtRes.error);
    } else {
      setAllDebts(debtRes.data || []);
    }

    // Filter by selected month for budget calculation
    const monthlyIncomes = filterByMonth(incomeRes.data || [], selectedDate, 'created_at');
    const monthlyExpenses = filterByMonth(expenseRes.data || [], selectedDate, 'date');
    
    // Calculate totals excluding debt payments to avoid double counting
    const nonDebtExpenses = monthlyExpenses.filter(e => e.category !== 'debt');
    
    setTotalIncome(monthlyIncomes.reduce((s, i) => s + i.amount, 0));
    setTotalExpenses(nonDebtExpenses.reduce((s, e) => s + e.amount, 0));
    setLoadingAll(false);
  }, [selectedDate]);

  useEffect(() => {
    loadDebts();
    loadAllDebts();
  }, [loadDebts, loadAllDebts]);


  const openCreateDialog = () => {
    setEditingDebt(null);
    setDialogOpen(true);
  };

  const openEditDialog = (debt: Debt) => {
    setEditingDebt(debt);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    loadDebts();
    loadAllDebts();
  };

  const handleDeleteDebt = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDeleteDebt = async () => {
    if (!confirmModal.id) return;

    try {
      const { success, error: deleteError } = await deleteDebt(confirmModal.id);

      if (deleteError) {
        addToast(deleteError, 'error');
      } else if (success) {
        setDebts(debts.filter(d => d.id !== confirmModal.id));
        addToast('Deuda eliminada correctamente', 'success');
        loadAllDebts();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      addToast(message, 'error');
    } finally {
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  // Filter by name
  const filteredDebts = debts.filter(debt => {
    return searchTerm === '' || debt.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Compute summary values from allDebts
  const activeDebts = allDebts.filter(d => d.balance > 0);
  const totalDebt = activeDebts.reduce((sum, d) => sum + d.balance, 0);
  const debtCount = activeDebts.length;
  // Weighted average by balance (more representative than simple average)
  const avgInterestRate = totalDebt > 0
    ? activeDebts.reduce((sum, d) => sum + d.interest_rate * d.balance, 0) / totalDebt
    : 0;
  const totalMinimumPayment = activeDebts.reduce((sum, d) => sum + d.minimum_payment, 0);
  
  const MONTH_NAMES_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const monthLabel = `${MONTH_NAMES_ES[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

  return (
    <>
      <PageHeader>
        <PageHeader.Title>
          <div className="flex items-center justify-between gap-2">
            Deudas
            <div className="flex items-center gap-2">
              <MonthSelector
                selectedDate={selectedDate}
                onPrevMonth={handlePrevMonth}
                onNextMonth={handleNextMonth}
              />
              <Button onClick={openCreateDialog}>
                <Plus size={16} />Agregar Deuda
              </Button>
            </div>
          </div>
        </PageHeader.Title>
        <PageHeader.Description>
          Administra tus deudas y visualiza el resumen de tu situación de endeudamiento.
        </PageHeader.Description>
      </PageHeader>

      {/* Summary Cards */}
      {loadingAll ? <DebtSummarySkeleton /> : (
        <DebtSummaryCards
          totalDebt={totalDebt}
          debtCount={debtCount}
          avgInterestRate={avgInterestRate}
          totalMinimumPayment={totalMinimumPayment}
        />
      )}

      {/* Target Card — Próxima deuda a atacar */}
      {!loadingAll && activeDebts.length > 0 && (
        <div id="objetivo-deuda">
          <DebtTargetCard
            debts={allDebts}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            monthLabel={monthLabel}
          />
        </div>
      )}

      {/* Method Comparison */}
      {!loadingAll && activeDebts.length > 0 && (
        <div id="simular-deudas">
          <MethodComparisonCard
            debts={allDebts}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            monthLabel={monthLabel}
          />
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Debts Table */}
      {loading ? <DebtTableSkeleton /> : (
        <div id="listado-deudas">
          <DebtTable
            debts={debts}
            loading={loading}
            filteredDebts={filteredDebts}
            onEdit={openEditDialog}
            onDelete={handleDeleteDebt}
            onCreate={openCreateDialog}
          />
        </div>
      )}

      {/* Debt Dialog */}
      <DebtDialog
        debt={editingDebt}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Eliminar Deuda"
        message="¿Estás seguro de que deseas eliminar esta deuda? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        isDangerous={true}
        onConfirm={confirmDeleteDebt}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
      />

      <div className="sm:hidden fixed bottom-3 inset-x-0 z-40 px-4">
        <div className="mx-auto max-w-md rounded-xl border border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-2 shadow-lg">
          <div className="grid grid-cols-2 gap-2">
            <Button
              className={`h-9 text-xs transition-all duration-200 ${activeMobileSection === 'add' ? 'scale-[1.02] shadow-sm' : ''}`}
              variant={activeMobileSection === 'add' ? 'default' : 'outline'}
              onClick={openCreateDialog}
            >
              <Plus size={14} />
              Agregar
            </Button>
            <Button
              className={`h-9 text-xs transition-all duration-200 ${activeMobileSection === 'simulate' ? 'scale-[1.02] shadow-sm' : ''}`}
              variant={activeMobileSection === 'simulate' ? 'default' : 'outline'}
              onClick={() => {
                const section = document.getElementById('simular-deudas');
                section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <Calculator size={14} />
              Simular
            </Button>
          </div>
        </div>
      </div>
      <div className="h-20 sm:hidden" />
    </>
  );
};

export default Debts;
