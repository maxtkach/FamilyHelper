import { useState, useCallback } from 'react';
import { Transaction } from '../types';
import { generateId } from '../utils';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
    };
    setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
  }, []);

  const updateTransaction = useCallback(
    (transactionId: string, updates: Partial<Transaction>) => {
      setTransactions((prevTransactions) =>
        prevTransactions.map((transaction) =>
          transaction.id === transactionId
            ? { ...transaction, ...updates }
            : transaction
        )
      );
    },
    []
  );

  const deleteTransaction = useCallback((transactionId: string) => {
    setTransactions((prevTransactions) =>
      prevTransactions.filter((transaction) => transaction.id !== transactionId)
    );
  }, []);

  const getTransactionById = useCallback(
    (transactionId: string) =>
      transactions.find((transaction) => transaction.id === transactionId),
    [transactions]
  );

  const getTransactionsByDate = useCallback(
    (date: Date) =>
      transactions.filter(
        (transaction) =>
          new Date(transaction.date).toDateString() === date.toDateString()
      ),
    [transactions]
  );

  const getTransactionsByCategory = useCallback(
    (category: string) =>
      transactions.filter((transaction) => transaction.category === category),
    [transactions]
  );

  const getTransactionsByUser = useCallback(
    (userId: string) =>
      transactions.filter(
        (transaction) =>
          transaction.paidBy === userId ||
          transaction.splitBetween.includes(userId)
      ),
    [transactions]
  );

  const calculateBalance = useCallback(
    (userId: string) => {
      return transactions.reduce((balance, transaction) => {
        const splitAmount = transaction.amount / transaction.splitBetween.length;
        if (transaction.paidBy === userId) {
          return balance + transaction.amount - splitAmount;
        }
        if (transaction.splitBetween.includes(userId)) {
          return balance - splitAmount;
        }
        return balance;
      }, 0);
    },
    [transactions]
  );

  const getTotalExpenses = useCallback(() => {
    return transactions.reduce((total, transaction) => {
      return total + (transaction.amount < 0 ? Math.abs(transaction.amount) : 0);
    }, 0);
  }, [transactions]);

  const getTotalIncome = useCallback(() => {
    return transactions.reduce((total, transaction) => {
      return total + (transaction.amount > 0 ? transaction.amount : 0);
    }, 0);
  }, [transactions]);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById,
    getTransactionsByDate,
    getTransactionsByCategory,
    getTransactionsByUser,
    calculateBalance,
    getTotalExpenses,
    getTotalIncome,
  };
}; 