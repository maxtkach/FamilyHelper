export interface User {
  id: string;
  name: string;
  role: UserRole;
  points: number;
  avatar?: string;
  email?: string;
  token?: string;
}

export type UserRole = 'parent' | 'child' | 'personal' | 'boyfriend' | 'girlfriend';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  deadline?: string;
  dueDate?: string; // дата выполнения задачи
  assignedTo: string[];
  assignedToName?: string; // Имя исполнителя
  points?: number; // количество баллов за задачу
  budget?: number; // бюджет, выделенный на задачу
  createdAt: string;
}

export interface Event {
  _id: string; // ID события с сервера, используем это как основной ID
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  participants: string[];
  location?: string;
  isAllDay?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  categoryId?: string; // ID категории, к которой относится транзакция
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget: number; // Бюджет для этой категории
  spent: number; // Текущие расходы по этой категории
}

export interface BudgetInfo {
  totalBudget: number; // общий бюджет
  allocatedBudget: number; // распределенный бюджет
  availableBudget: number; // доступный для распределения бюджет
  categories: BudgetCategory[]; // категории бюджета
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AppContextType {
  // Auth state
  auth: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (updates: { name?: string; email?: string; password?: string; role?: UserRole }) => Promise<any>;
  
  // Existing context
  transactions: Transaction[];
  getTotalExpenses: () => number;
  getTotalIncome: () => number;
  calculateBalance: () => number;
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  budget: BudgetInfo;
  updateBudget: (updates: Partial<BudgetInfo>) => Promise<void>;
  allocateTaskBudget: (taskId: string, amount: number) => void;
  
  // Budget categories
  addBudgetCategory: (category: Omit<BudgetCategory, 'id' | 'spent'>) => void;
  updateBudgetCategory: (categoryId: string, updates: Partial<BudgetCategory>) => void;
  deleteBudgetCategory: (categoryId: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  
  // Events
  events: Event[];
  addEvent: (eventData: Omit<Event, '_id'>) => Promise<Event>;
  updateEvent: (eventData: Event) => Promise<Event>;
  deleteEvent: (eventId: string) => Promise<void>;
  getEvents: () => Promise<Event[]>;
} 