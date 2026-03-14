import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { apiClient } from '@/lib/api';
import type { DashboardSummary } from '@debtflow/api-client';

export default function DashboardScreen() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await apiClient.dashboard.getSummary();
    if (data) setSummary(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a6fa5" />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No se pudieron cargar los datos</Text>
      </View>
    );
  }

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        <View style={[styles.card, styles.incomeCard]}>
          <Text style={styles.cardLabel}>Ingresos</Text>
          <Text style={[styles.cardValue, styles.incomeText]}>
            {formatCurrency(summary.totalIncome)}
          </Text>
        </View>

        <View style={[styles.card, styles.expenseCard]}>
          <Text style={styles.cardLabel}>Gastos</Text>
          <Text style={[styles.cardValue, styles.expenseText]}>
            {formatCurrency(summary.totalExpenses)}
          </Text>
        </View>

        <View style={[styles.card, styles.debtCard]}>
          <Text style={styles.cardLabel}>Deuda total</Text>
          <Text style={[styles.cardValue, styles.debtText]}>
            {formatCurrency(summary.totalDebt)}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Flujo de caja</Text>
          <Text style={[styles.cardValue, summary.cashFlow >= 0 ? styles.incomeText : styles.debtText]}>
            {formatCurrency(summary.cashFlow)}
          </Text>
        </View>
      </View>

      {summary.avalanche && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avalancha de deuda</Text>
          <Text style={styles.modeText}>
            Modo: {summary.avalanche.mode === 'NORMAL' ? 'Normal' :
              summary.avalanche.mode === 'CRISIS_NO_MINIMUMS' ? 'Crisis' : 'Sin presupuesto'}
          </Text>
          {summary.avalanche.recommendedPayments.map((payment) => (
            <View key={payment.debtId} style={[styles.paymentRow, payment.isTarget && styles.targetRow]}>
              <Text style={styles.paymentName}>{payment.debtName}</Text>
              <Text style={styles.paymentAmount}>{formatCurrency(payment.recommendedPayment)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 16,
  },
  centered: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  incomeCard: { borderTopWidth: 2, borderTopColor: '#34d399' },
  expenseCard: { borderTopWidth: 2, borderTopColor: '#fbbf24' },
  debtCard: { borderTopWidth: 2, borderTopColor: '#f87171' },
  cardLabel: {
    color: '#999',
    fontSize: 13,
    marginBottom: 4,
  },
  cardValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  incomeText: { color: '#34d399' },
  expenseText: { color: '#fbbf24' },
  debtText: { color: '#f87171' },
  section: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modeText: {
    color: '#999',
    fontSize: 13,
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a4e',
  },
  targetRow: {
    backgroundColor: '#4a6fa510',
  },
  paymentName: {
    color: '#fff',
    fontSize: 14,
  },
  paymentAmount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
