import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { apiClient } from '@/lib/api';
import type { Debt } from '@debtflow/types';

export default function DebtsScreen() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await apiClient.debts.getAll();
    if (data) setDebts(data);
    setLoading(false);
  };

  const formatCurrency = (amount: number) =>
    `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4a6fa5" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={debts}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No hay deudas registradas</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>
              Tasa: {item.interest_rate}% · Mínimo: {formatCurrency(item.minimum_payment)}
            </Text>
          </View>
          <Text style={styles.balance}>{formatCurrency(item.balance)}</Text>
        </View>
      )}
    />
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
    paddingTop: 64,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  row: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  details: {
    color: '#999',
    fontSize: 12,
    marginTop: 2,
  },
  balance: {
    color: '#f87171',
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
});
