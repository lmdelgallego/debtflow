'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { fetchDebts, fetchAllDebts, deleteDebt } from '@/lib/actions/debts.action';
import type { Debt } from '@/lib/actions/debts.action';
import { DebtDialog } from '@/components/debts/DebtDialog';
import { DebtSummaryCards } from '@/components/debts/DebtSummaryCards';
import { DebtTable } from '@/components/debts/DebtTable';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DebtSummarySkeleton, DebtTableSkeleton } from '@/components/debts/Skeletons';
import { PageHeader } from '@/components/PageHeader';

const Debts = () => {
  const { addToast } = useToast();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [allDebts, setAllDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const pageSize = 10;

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

  // Fetch all debts (para summary cards)
  const loadAllDebts = useCallback(async () => {
    setLoadingAll(true);
    const { data, error: fetchError } = await fetchAllDebts();

    if (fetchError) {
      console.error('Error fetching all debts:', fetchError);
    } else {
      setAllDebts(data || []);
    }
    setLoadingAll(false);
  }, []);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  useEffect(() => {
    loadAllDebts();
  }, [loadAllDebts]);

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
  const avgInterestRate = debtCount > 0
    ? activeDebts.reduce((sum, d) => sum + d.interest_rate, 0) / debtCount
    : 0;
  const totalMinimumPayment = activeDebts.reduce((sum, d) => sum + d.minimum_payment, 0);

  return (
    <>
      <PageHeader>
        <PageHeader.Title>
          <div className="flex items-center justify-between gap-2">
            Deudas
            <Button onClick={openCreateDialog}>
              <Plus size={16} />Agregar Deuda
            </Button>
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
        <DebtTable
          debts={debts}
          loading={loading}
          filteredDebts={filteredDebts}
          onEdit={openEditDialog}
          onDelete={handleDeleteDebt}
        />
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
    </>
  );
};

export default Debts;
