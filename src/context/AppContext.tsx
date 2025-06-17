import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Task, BudgetInfo, AppContextType, AuthState, User, UserRole, Event, BudgetCategory } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

// Выбираем URL в зависимости от платформы и окружения
// Для iOS и Android используем относительный URL к локальному серверу
// или Ngrok для временного решения

// Локальный IP-адрес сервера - заменить на IP вашего компьютера в локальной сети
// Выполните 'ipconfig' в Windows или 'ifconfig' в macOS/Linux, чтобы узнать IP
const LOCAL_IP = '192.168.0.104'; // Замените на ваш локальный IP
const SERVER_PORT = '5000';

// Использование Ngrok для разработки (если локальный IP не работает)
// Для запуска:
// 1. Установите Ngrok: npm install -g ngrok
// 2. Запустите backend: cd backend && npm start
// 3. Запустите в другом терминале: ngrok http 5000
// 4. Скопируйте URL в переменную NGROK_URL ниже
const NGROK_URL = 'https://8baf-109-200-235-234.ngrok-free.app'; // Замените на ваш ngrok URL

// Выбор URL API в зависимости от платформы
const getApiUrl = () => {
  // Для отладки - влияет на выбор URL
  const useNgrok = true; // Используем Ngrok для стабильного подключения

  if (useNgrok) {
    // Проверка, что NGROK_URL обновлен
    console.log('Используем Ngrok:', NGROK_URL);
    return `${NGROK_URL}/api`;
  }

  if (Platform.OS === 'android') {
    // Для эмулятора Android
    console.log('Используем URL для Android эмулятора: http://10.0.2.2:5000/api');
    return 'http://10.0.2.2:5000/api';
  } else if (Platform.OS === 'ios') {
    // Для эмулятора iOS
    console.log('Используем URL для iOS эмулятора: http://localhost:5000/api');
    return 'http://localhost:5000/api';
  } else {
    // Для веб-версии или тестирования
    console.log('Используем локальный IP:', `http://${LOCAL_IP}:${SERVER_PORT}/api`);
    return `http://${LOCAL_IP}:${SERVER_PORT}/api`;
  }
};

const API_URL = getApiUrl();
console.log(`Используемый API URL: ${API_URL} [Platform: ${Platform.OS}]`);

export const AppContext = createContext<AppContextType>({
  // Auth state
  auth: {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  login: async () => {},
  register: async () => {},
  logout: () => {},
  updateUserProfile: async () => {},
  
  // Tasks
  tasks: [],
  addTask: async () => ({ id: '', title: '', description: '', completed: false, assignedTo: [], createdAt: '' }),
  updateTask: async () => ({}),
  deleteTask: async () => {},
  
  // Budget
  budget: {
    totalBudget: 0,
    allocatedBudget: 0,
    availableBudget: 0,
    categories: [],
  },
  updateBudget: async () => {},
  allocateTaskBudget: () => {},
  
  // Budget categories
  addBudgetCategory: async () => {},
  updateBudgetCategory: async () => {},
  deleteBudgetCategory: async () => {},
  addTransaction: () => {},
  
  // Finance
  transactions: [],
  getTotalExpenses: () => 0,
  getTotalIncome: () => 0,
  calculateBalance: () => 0,
  
  // Events
  events: [],
  addEvent: async () => ({ _id: '', title: '', description: '', startDate: new Date(), endDate: new Date(), participants: [] }),
  updateEvent: async () => ({ _id: '', title: '', description: '', startDate: new Date(), endDate: new Date(), participants: [] }),
  deleteEvent: async () => {},
  getEvents: async () => [],
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budget, setBudget] = useState<BudgetInfo>({
    totalBudget: 0,
    allocatedBudget: 0,
    availableBudget: 0,
    categories: [],
  });

  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  const [events, setEvents] = useState<Event[]>([]);

  // Загрузка бюджета из AsyncStorage при старте
  useEffect(() => {
    const loadBudget = async () => {
      try {
        const budgetData = await AsyncStorage.getItem('@family_helper_budget');
        if (budgetData) {
          const savedBudget = JSON.parse(budgetData);
          console.log('Загружен сохраненный бюджет:', savedBudget);
          setBudget(savedBudget);
        }
      } catch (error) {
        console.error('Ошибка при загрузке бюджета:', error);
      }
    };

    loadBudget();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('@family_helper_token');
        const userData = await AsyncStorage.getItem('@family_helper_user');
        
        if (token && userData) {
          const user = JSON.parse(userData);
          setAuth({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error);
      }
    };

    loadUser();
  }, []);

  // Проверка соединения с сервером при старте
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        console.log('Проверяем соединение с сервером:', API_URL.replace('/api', ''));
        const response = await fetch(`${API_URL.replace('/api', '')}`, { 
          timeout: 5000 // Устанавливаем таймаут в 5 секунд
        } as RequestInit);
        
        if (response.ok) {
          console.log('Соединение с сервером установлено');
        } else {
          console.error('Сервер недоступен:', response.status);
        }
      } catch (error) {
        console.error('Ошибка при проверке соединения с сервером:', error);
      }
    };

    checkServerConnection();
  }, []);

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Отправка запроса на регистрацию:', { name, email, password: '***', role });
      console.log('URL запроса:', `${API_URL}/users`);
      
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      console.log('Ответ от сервера:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при регистрации');
      }

      await AsyncStorage.setItem('@family_helper_token', data.token);
      await AsyncStorage.setItem('@family_helper_user', JSON.stringify(data));

      setAuth({
        user: {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          points: data.points || 0,
          token: data.token,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      
      // Улучшенная обработка и отображение ошибок
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ошибка при регистрации. Проверьте соединение с сервером.';
      
      // Показываем предупреждение пользователю через Alert
      Alert.alert(
        'Ошибка регистрации',
        errorMessage,
        [{ text: 'OK' }]
      );
      
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Отправка запроса на вход:', { email, password: '***' });
      console.log('URL запроса:', `${API_URL}/users/login`);
      
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Ответ от сервера:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при входе');
      }

      await AsyncStorage.setItem('@family_helper_token', data.token);
      await AsyncStorage.setItem('@family_helper_user', JSON.stringify(data));

      setAuth({
        user: {
          id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          points: 0,
          token: data.token,
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Ошибка входа:', error);
      
      // Улучшенная обработка и отображение ошибок
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ошибка при входе. Проверьте соединение с сервером.';
      
      // Показываем предупреждение пользователю через Alert
      Alert.alert(
        'Ошибка входа',
        errorMessage,
        [{ text: 'OK' }]
      );
      
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@family_helper_token');
      await AsyncStorage.removeItem('@family_helper_user');

      setAuth({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

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

  // Методы для работы с задачами
  const fetchTasks = async () => {
    try {
      console.log('Загружаем задачи...');
      const token = auth.user?.token;
      if (!token) {
        console.log('Не удалось загрузить задачи: токен отсутствует');
        return;
      }

      // Проверяем, есть ли сохраненные задачи в AsyncStorage
      try {
        const savedTasks = await AsyncStorage.getItem('@family_helper_tasks');
        if (savedTasks) {
          console.log('Загружены сохраненные задачи из AsyncStorage');
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error('Ошибка при загрузке задач из AsyncStorage:', error);
      }

      // Пытаемся загрузить задачи с сервера
      try {
        console.log('Отправляем запрос на получение задач с сервера:', `${API_URL}/tasks`);
        const response = await fetch(`${API_URL}/tasks`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('Не удалось загрузить задачи с сервера:', response.status);
          return;
        }

        const data = await response.json();
        console.log(`Получено ${data.length} задач с сервера`);
        
        // Преобразуем данные из формата бэкенда в формат фронтенда
        const formattedTasks = data.map((task: any) => ({
          id: task._id,
          title: task.title,
          description: task.description || '',
          completed: task.completed,
          deadline: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
          assignedTo: [task.assignedTo._id],
          assignedToName: task.assignedTo.name,
          createdAt: new Date(task.createdAt).toISOString(),
          points: 10, // Добавим потом в модель на бэкенде
        }));

        // Сохраняем задачи в AsyncStorage
        await AsyncStorage.setItem('@family_helper_tasks', JSON.stringify(formattedTasks));
        console.log('Задачи сохранены в AsyncStorage');

        setTasks(formattedTasks);
      } catch (error) {
        console.error('Ошибка при загрузке задач с сервера:', error);
      }
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
    }
  };

  // Вызываем загрузку задач при изменении статуса авторизации
  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [auth.isAuthenticated]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const token = auth.user?.token;
      if (!token) throw new Error('Пользователь не авторизован');

      console.log('Отправка запроса на создание задачи:', taskData);
      
      // Преобразование для API
      const apiTaskData = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.deadline,
        // Если assignedTo не указан, задача назначается на текущего пользователя
        assignedTo: taskData.assignedTo && taskData.assignedTo.length > 0 
          ? taskData.assignedTo[0] 
          : auth.user?.id,
        // Временно, пока нет семей
        familyId: "65f9b760cf36f9aa65ca33e5" 
      };

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(apiTaskData),
      });

      const data = await response.json();
      console.log('Ответ от сервера:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при создании задачи');
      }

      // Добавляем новую задачу в состояние
      const newTask: Task = {
        id: data._id,
        title: data.title,
        description: data.description || '',
        completed: data.completed,
        deadline: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        assignedTo: [data.assignedTo],
        createdAt: new Date(data.createdAt).toISOString(),
      };

      setTasks(prevTasks => [...prevTasks, newTask]);
      
      return newTask;
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      throw error;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const token = auth.user?.token;
      if (!token) throw new Error('Пользователь не авторизован');

      // Преобразование для API
      const apiTaskData: any = {};
      
      if (updates.title !== undefined) apiTaskData.title = updates.title;
      if (updates.description !== undefined) apiTaskData.description = updates.description;
      if (updates.completed !== undefined) apiTaskData.completed = updates.completed;
      if (updates.deadline !== undefined) apiTaskData.dueDate = updates.deadline;
      if (updates.assignedTo !== undefined && updates.assignedTo.length > 0) {
        apiTaskData.assignedTo = updates.assignedTo[0];
      }

      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(apiTaskData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при обновлении задачи');
      }

      // Обновляем задачу в состоянии
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );

      return data;
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const token = auth.user?.token;
      if (!token) throw new Error('Пользователь не авторизован');

      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка при удалении задачи');
      }

      // Удаляем задачу из состояния
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      return data;
    } catch (error) {
      console.error('Ошибка при удалении задачи:', error);
      throw error;
    }
  };

  // Обновление бюджета
  const updateBudget = async (updates: Partial<BudgetInfo>) => {
    try {
      // Сначала обновляем локальное состояние
      const newBudget = await new Promise<BudgetInfo>((resolve) => {
    setBudget(prev => {
          const newBudget = { ...prev };
          
          if (updates.totalBudget !== undefined) {
            newBudget.totalBudget = updates.totalBudget;
            // Пересчитываем доступный бюджет
            newBudget.availableBudget = updates.totalBudget - newBudget.allocatedBudget;
          }
          
          if (updates.allocatedBudget !== undefined) {
            newBudget.allocatedBudget = updates.allocatedBudget;
      // Пересчитываем доступный бюджет
            newBudget.availableBudget = newBudget.totalBudget - updates.allocatedBudget;
          }
          
          if (updates.categories) {
            newBudget.categories = updates.categories;
          }
          
          console.log('Обновили бюджет локально:', newBudget);
          resolve(newBudget);
          return newBudget;
        });
      });
      
      // Сохраняем бюджет в AsyncStorage
      try {
        await AsyncStorage.setItem('@family_helper_budget', JSON.stringify(newBudget));
        console.log('Бюджет сохранен в AsyncStorage');
      } catch (error) {
        console.error('Ошибка при сохранении бюджета в AsyncStorage:', error);
        Alert.alert('Помилка', 'Не вдалося зберегти бюджет локально');
      }
      
      // Также пытаемся отправить данные на сервер
      try {
        const token = auth.user?.token;
        if (token) {
          console.log('Пытаемся отправить бюджет на сервер...');
          console.log('API URL:', API_URL);
          console.log('Отправляем данные:', { ...updates, familyId: "65f9b760cf36f9aa65ca33e5" });
          
          const response = await fetch(`${API_URL}/budget`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              ...updates,
              familyId: "65f9b760cf36f9aa65ca33e5" // Временно хардкодим ID семьи
            }),
          });
          
          if (response.ok) {
            console.log('Бюджет успешно сохранен на сервере');
          } else {
            console.log('Ошибка при сохранении бюджета на сервере:', response.status);
          }
        } else {
          console.log('Не удалось сохранить бюджет на сервере: токен отсутствует');
        }
      } catch (error) {
        // Просто логируем ошибку, но не показываем пользователю
        console.error('Ошибка при отправке бюджета на сервер:', error);
      }
    } catch (error) {
      console.error('Помилка при оновленні бюджету:', error);
      Alert.alert('Помилка', error instanceof Error ? error.message : 'Не вдалося оновити бюджет');
      throw error;
    }
  };

  // Распределение бюджета для задачи
  const allocateTaskBudget = (taskId: string, amount: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Задача не найдена');
    }

    // Уже распределенный бюджет для этой задачи
    const existingBudget = task.budget || 0;

    // Рассчитываем, сколько дополнительного бюджета нужно выделить
    const additionalBudget = amount - existingBudget;

    // Проверяем, есть ли столько свободного бюджета
    if (additionalBudget > 0 && additionalBudget > budget.availableBudget) {
      throw new Error('Недостаточно доступного бюджета');
    }

    // Обновляем бюджет задачи
    updateTask(taskId, { budget: amount });

    // Обновляем общий распределенный и доступный бюджет
    setBudget(prev => ({
      ...prev,
      allocatedBudget: prev.allocatedBudget + additionalBudget,
      availableBudget: prev.availableBudget - additionalBudget
    }));
  };

  // Добавление новой категории бюджета
  const addBudgetCategory = async (categoryData: Omit<BudgetCategory, 'id' | 'spent'>) => {
    try {
      const id = Math.random().toString(36).substring(2, 9);
      const newCategory: BudgetCategory = {
        ...categoryData,
        id,
        spent: 0
      };

      // Проверяем, достаточно ли свободного бюджета
      if (categoryData.budget > budget.availableBudget) {
        throw new Error('Недостаточно доступного бюджета для этой категории');
      }

      // Обновляем список категорий
      const newBudget = await new Promise<BudgetInfo>((resolve) => {
        setBudget(prev => {
          const newCategories = [...prev.categories, newCategory];
          // Пересчитываем доступный и распределенный бюджет
          const totalAllocated = prev.allocatedBudget + categoryData.budget;
          const updatedBudget = {
            ...prev,
            categories: newCategories,
            allocatedBudget: totalAllocated,
            availableBudget: prev.totalBudget - totalAllocated
          };
          resolve(updatedBudget);
          return updatedBudget;
        });
      });

      // Сохраняем бюджет в AsyncStorage
      try {
        await AsyncStorage.setItem('@family_helper_budget', JSON.stringify(newBudget));
        console.log('Бюджет с новой категорией сохранен в AsyncStorage');
      } catch (error) {
        console.error('Ошибка при сохранении бюджета в AsyncStorage:', error);
      }
    } catch (error) {
      console.error('Ошибка при добавлении категории:', error);
      Alert.alert('Помилка', error instanceof Error ? error.message : 'Не вдалося додати категорію');
      throw error;
    }
  };

  // Обновление категории бюджета
  const updateBudgetCategory = async (categoryId: string, updates: Partial<BudgetCategory>) => {
    try {
      const category = budget.categories.find(c => c.id === categoryId);
      if (!category) {
        throw new Error('Категория не найдена');
      }

      let newBudget: BudgetInfo;

      // Если меняется сумма бюджета для категории
      if (updates.budget !== undefined) {
        const budgetDifference = updates.budget - category.budget;
        
        // Проверяем, достаточно ли свободного бюджета
        if (budgetDifference > 0 && budgetDifference > budget.availableBudget) {
          throw new Error('Недостаточно доступного бюджета для увеличения бюджета категории');
        }

        // Обновляем общий распределенный и доступный бюджет
        newBudget = await new Promise<BudgetInfo>((resolve) => {
          setBudget(prev => {
            const newCategories = prev.categories.map(c => 
              c.id === categoryId ? { ...c, ...updates } : c
            );
            
            const totalAllocated = prev.allocatedBudget + budgetDifference;
            
            const updatedBudget = {
              ...prev,
              categories: newCategories,
              allocatedBudget: totalAllocated,
              availableBudget: prev.totalBudget - totalAllocated
            };
            resolve(updatedBudget);
            return updatedBudget;
          });
        });
      } else {
        // Если другие поля, просто обновляем категорию
        newBudget = await new Promise<BudgetInfo>((resolve) => {
          setBudget(prev => {
            const updatedBudget = {
              ...prev,
              categories: prev.categories.map(c => 
                c.id === categoryId ? { ...c, ...updates } : c
              )
            };
            resolve(updatedBudget);
            return updatedBudget;
          });
        });
      }

      // Сохраняем бюджет в AsyncStorage
      try {
        await AsyncStorage.setItem('@family_helper_budget', JSON.stringify(newBudget));
        console.log('Бюджет с обновленной категорией сохранен в AsyncStorage');
      } catch (error) {
        console.error('Ошибка при сохранении бюджета в AsyncStorage:', error);
      }
    } catch (error) {
      console.error('Ошибка при обновлении категории:', error);
      Alert.alert('Помилка', error instanceof Error ? error.message : 'Не вдалося оновити категорію');
      throw error;
    }
  };

  // Удаление категории бюджета
  const deleteBudgetCategory = async (categoryId: string) => {
    try {
      const category = budget.categories.find(c => c.id === categoryId);
      if (!category) {
        throw new Error('Категория не найдена');
      }

      // Обновляем список категорий и перераспределяем бюджет
      const newBudget = await new Promise<BudgetInfo>((resolve) => {
        setBudget(prev => {
          const newCategories = prev.categories.filter(c => c.id !== categoryId);
          const updatedBudget = {
            ...prev,
            categories: newCategories,
            allocatedBudget: prev.allocatedBudget - category.budget,
            availableBudget: prev.availableBudget + category.budget
          };
          resolve(updatedBudget);
          return updatedBudget;
        });
      });

      // Сохраняем бюджет в AsyncStorage
      try {
        await AsyncStorage.setItem('@family_helper_budget', JSON.stringify(newBudget));
        console.log('Бюджет после удаления категории сохранен в AsyncStorage');
      } catch (error) {
        console.error('Ошибка при сохранении бюджета в AsyncStorage:', error);
      }
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      Alert.alert('Помилка', error instanceof Error ? error.message : 'Не вдалося видалити категорію');
      throw error;
    }
  };

  // Добавление новой транзакции
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newTransaction: Transaction = {
      ...transaction,
      id,
      date: new Date()
    };

    // Добавляем транзакцию
    setTransactions(prev => [...prev, newTransaction]);

    // Если транзакция связана с категорией, обновляем потраченную сумму
    if (transaction.categoryId) {
      setBudget(prev => ({
        ...prev,
        categories: prev.categories.map(c => 
          c.id === transaction.categoryId 
            ? { ...c, spent: c.spent + Math.abs(transaction.amount) } 
            : c
        )
      }));
    }
  };

  const updateUserProfile = async (updates: { name?: string; email?: string; password?: string; role?: UserRole }) => {
    try {
      const token = auth.user?.token;
      if (!token) throw new Error('Пользователь не авторизован');

      console.log('Отправка запроса на обновление профиля:', updates);
      console.log('URL запроса:', `${API_URL}/users/profile`);
      
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      console.log('Полный ответ от сервера:', data);

      if (!response.ok) {
        console.error('Сервер вернул ошибку:', response.status, data);
        throw new Error(data.message || 'Ошибка при обновлении профиля');
      }

      if (auth.user) {
        // Создаем обновленный объект пользователя с данными с сервера
        const updatedUser: User = {
          id: auth.user.id,
          name: data.name,
          email: data.email,
          role: data.role,
          points: data.points || auth.user.points,
          token: data.token || auth.user.token,
          avatar: auth.user.avatar,
        };

        console.log('Обновляем пользователя в контексте:', {
          старая_роль: auth.user.role,
          новая_роль: updatedUser.role
        });

        // Обновляем состояние приложения
        setAuth(prev => ({
          ...prev,
          user: updatedUser,
        }));

        // Обновляем данные в AsyncStorage
        await AsyncStorage.setItem('@family_helper_user', JSON.stringify(updatedUser));
        if (data.token) {
          await AsyncStorage.setItem('@family_helper_token', data.token);
        }

        // Показываем уведомление об успешном обновлении роли
        if (updates.role) {
          Alert.alert(
            'Роль изменена',
            'Ваша роль была успешно обновлена',
            [{ text: 'OK' }]
          );
        }
      }

      return data;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      
      Alert.alert(
        'Ошибка обновления профиля',
        error instanceof Error ? error.message : 'Произошла ошибка при обновлении профиля',
        [{ text: 'OK' }]
      );
      
      throw error;
    }
  };

  // Получение событий
  const getEvents = async (): Promise<Event[]> => {
    console.log('Получаем события...');
    try {
      // Пытаемся загрузить события из AsyncStorage
      const storedEvents = await AsyncStorage.getItem('events');
      const initialEvents: Event[] = storedEvents ? JSON.parse(storedEvents) : [];
      
      if (initialEvents.length > 0) {
        console.log(`Загружено ${initialEvents.length} событий из хранилища`);
        setEvents(initialEvents);
      }
      
      // Пытаемся получить события с сервера
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/events`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Получено ${data.length} событий с сервера`);
            
            // Обновляем события в состоянии и хранилище
            setEvents(data);
            await AsyncStorage.setItem('events', JSON.stringify(data));
            return data;
          }
        } catch (serverError) {
          console.error('Ошибка при получении событий с сервера:', serverError);
          // Если не получилось загрузить с сервера, возвращаем что есть из хранилища
          return initialEvents;
        }
      }
      
      return initialEvents;
    } catch (error) {
      console.error('Ошибка при получении событий:', error);
      return [];
    }
  };

  // Добавление события
  const addEvent = async (eventData: Omit<Event, '_id'>): Promise<Event> => {
    console.log('Добавляем событие:', eventData);
    
    try {
      // Создаем событие с временным локальным ID
      const newEvent: Event = {
        ...eventData,
        _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Сразу обновляем локальное состояние
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      
      // Сохраняем в AsyncStorage
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      
      // Пробуем отправить на сервер
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
          });
          
          if (response.ok) {
            const createdEvent = await response.json();
            console.log('Событие успешно создано на сервере:', createdEvent);
            
            // Обновляем локальный список событий, заменяя временное на серверное
            const eventsWithServer = events.map(event => 
              event._id === newEvent._id ? { ...createdEvent } : event
            );
            
            setEvents(eventsWithServer);
            await AsyncStorage.setItem('events', JSON.stringify(eventsWithServer));
            
            return createdEvent;
          } else {
            console.error('Ошибка при создании события на сервере:', await response.text());
          }
        } catch (serverError) {
          console.error('Ошибка при отправке события на сервер:', serverError);
        }
      }
      
      // Если не удалось создать на сервере, возвращаем локальную версию
      return newEvent;
    } catch (error) {
      console.error('Ошибка при добавлении события:', error);
      throw error;
    }
  };

  // Обновление события
  const updateEvent = async (eventData: Event): Promise<Event> => {
    console.log('Обновляем событие:', eventData);
    
    try {
      // Обновляем локальное состояние
      const updatedEvents = events.map(event => 
        event._id === eventData._id ? { ...eventData } : event
      );
      
      setEvents(updatedEvents);
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      
      // Если ID начинается с "local_", событие еще не на сервере
      if (eventData._id.startsWith('local_')) {
        return eventData;
      }
      
      // Пробуем обновить на сервере
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/events/${eventData._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventData)
          });
          
          if (response.ok) {
            const updatedEvent = await response.json();
            console.log('Событие успешно обновлено на сервере:', updatedEvent);
            return updatedEvent;
          } else {
            console.error('Ошибка при обновлении события на сервере:', await response.text());
          }
        } catch (serverError) {
          console.error('Ошибка при отправке обновления события на сервер:', serverError);
        }
      }
      
      // Если не удалось обновить на сервере, возвращаем локальную версию
      return eventData;
    } catch (error) {
      console.error('Ошибка при обновлении события:', error);
      throw error;
    }
  };

  // Удаление события
  const deleteEvent = async (eventId: string): Promise<void> => {
    console.log('Удаляем событие:', eventId);
    
    try {
      // Обновляем локальное состояние
      const updatedEvents = events.filter(event => event._id !== eventId);
      setEvents(updatedEvents);
      
      // Сохраняем в AsyncStorage
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      
      // Если ID начинается с "local_", событие еще не на сервере
      if (eventId.startsWith('local_')) {
        return;
      }
      
      // Пробуем удалить на сервере
      const token = await AsyncStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/events/${eventId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            console.log('Событие успешно удалено на сервере');
          } else {
            console.error('Ошибка при удалении события на сервере:', await response.text());
          }
        } catch (serverError) {
          console.error('Ошибка при отправке запроса на удаление события:', serverError);
        }
      }
    } catch (error) {
      console.error('Ошибка при удалении события:', error);
      throw error;
    }
  };

  const contextValue: AppContextType = {
    auth,
    login,
    register,
    logout,
    updateUserProfile,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        budget,
        updateBudget,
        allocateTaskBudget,
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    calculateBalance,
    getTotalExpenses,
    getTotalIncome,
    transactions,
    addTransaction,
    events,
    getEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  };

  return (
    <AppContext.Provider
      value={contextValue}
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