import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { formatCurrency } from '../utils';

interface TransactionStatsProps {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

const TransactionStats: React.FC<TransactionStatsProps> = ({
  totalIncome,
  totalExpenses,
  balance,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.glassCard}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Доходы</Text>
          <Text style={[styles.statValue, styles.income]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Расходы</Text>
          <Text style={[styles.statValue, styles.expenses]}>
            {formatCurrency(totalExpenses)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Баланс</Text>
          <Text
            style={[
              styles.statValue,
              balance >= 0 ? styles.income : styles.expenses,
            ]}
          >
            {formatCurrency(balance)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    ...SHADOWS.medium,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  income: {
    color: COLORS.success,
  },
  expenses: {
    color: COLORS.danger,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.grayLight,
    marginHorizontal: 8,
  },
});

export default TransactionStats; 