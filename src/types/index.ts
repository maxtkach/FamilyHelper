export interface User {
  id: string;
  name: string;
  role: string;
  points: number;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline?: string;
  assignedTo: string[];
  budget?: number; // бюджет, выделенный на задачу
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  participants: string[];
  location?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
}

export interface BudgetInfo {
  totalBudget: number; // общий бюджет
  allocatedBudget: number; // распределенный бюджет
  availableBudget: number; // доступный для распределения бюджет
}

export interface AppContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  budget: BudgetInfo;
  updateBudget: (updates: Partial<BudgetInfo>) => void;
  allocateTaskBudget: (taskId: string, amount: number) => void;
} 