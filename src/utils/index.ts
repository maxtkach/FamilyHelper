import { Task, Event, Transaction } from '../types';

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(amount);
};

export const calculateTaskPoints = (task: Task): number => {
  let points = task.points;
  
  // Бонус за своевременное выполнение
  if (task.dueDate && new Date() <= new Date(task.dueDate)) {
    points *= 1.2;
  }
  
  // Бонус за сложность задачи
  if (task.assignedTo.length > 1) {
    points *= 1.1;
  }
  
  return Math.round(points);
};

export const calculateEventDuration = (event: Event): string => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const diff = end.getTime() - start.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours} ч ${minutes} мин`;
  }
  return `${minutes} мин`;
};

export const calculateTransactionSplit = (
  transaction: Transaction
): { [key: string]: number } => {
  const splitAmount = transaction.amount / transaction.splitBetween.length;
  const result: { [key: string]: number } = {};
  
  transaction.splitBetween.forEach((participant) => {
    result[participant] = splitAmount;
  });
  
  return result;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}; 