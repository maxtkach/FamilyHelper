import React, { createContext, useContext, useState } from 'react';
import { Transaction, Task, BudgetInfo, AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budget, setBudget] = useState<BudgetInfo>({
    totalBudget: 0,
    allocatedBudget: 0,
    availableBudget: 0,
  });

  const getTotalExpenses = () => {
    return transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getTotalIncome = () => {
    return transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const addTask = (task: Task) => {
    setTasks(prevTasks => [...prevTasks, task]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const deleteTask = (taskId: string) => {
    // Освобождаем бюджет при удалении задачи
    const task = tasks.find(t => t.id === taskId);
    if (task?.budget) {
      setBudget(prev => ({
        ...prev,
        allocatedBudget: prev.allocatedBudget - task.budget!,
        availableBudget: prev.availableBudget + task.budget!,
      }));
    }
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const updateBudget = (updates: Partial<BudgetInfo>) => {
    setBudget(prev => {
      const newBudget = { ...prev, ...updates };
      // Пересчитываем доступный бюджет
      if ('totalBudget' in updates) {
        newBudget.availableBudget = updates.totalBudget! - prev.allocatedBudget;
      }
      return newBudget;
    });
  };

  const allocateTaskBudget = (taskId: string, amount: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentTaskBudget = task.budget || 0;
    const budgetDifference = amount - currentTaskBudget;

    if (budgetDifference > budget.availableBudget) {
      throw new Error('Недостаточно средств в бюджете');
    }

    // Обновляем бюджет задачи
    updateTask(taskId, { budget: amount });

    // Обновляем общий бюджет
    setBudget(prev => ({
      ...prev,
      allocatedBudget: prev.allocatedBudget + budgetDifference,
      availableBudget: prev.availableBudget - budgetDifference,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        tasks,
        getTotalExpenses,
        getTotalIncome,
        calculateBalance,
        addTask,
        updateTask,
        deleteTask,
        budget,
        updateBudget,
        allocateTaskBudget,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext; 