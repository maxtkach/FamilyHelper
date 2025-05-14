import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Alert,
  Platform,
  Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';
import TaskForm from '../components/forms/TaskForm';
import { useApp } from '../context/AppContext';
import { Task } from '../types';

const TasksScreen: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask } = useApp();
  const [selectedFilter, setSelectedFilter] = useState('Все');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Анимации
  const filterAnimations = useRef(
    ['Все', 'Мои', 'Семья'].map(() => new Animated.Value(1))
  ).current;
  
  const taskScaleAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
  const addButtonScale = useRef(new Animated.Value(1)).current;

  // Инициализация анимаций для задач
  useEffect(() => {
    tasks.forEach(task => {
      if (!taskScaleAnimations[task.id]) {
        taskScaleAnimations[task.id] = new Animated.Value(1);
      }
    });
  }, [tasks]);

  const animateFilter = (index: number) => {
    Animated.sequence([
      Animated.timing(filterAnimations[index], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(filterAnimations[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateAddButton = () => {
    Animated.sequence([
      Animated.timing(addButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(addButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddPress = () => {
    animateAddButton();
    setModalVisible(true);
  };

  const handleFormSubmit = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await addTask(taskData);
      setModalVisible(false);
      Alert.alert('Успех', 'Задача успешно создана!');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать задачу');
    }
  };

  const handleFormCancel = () => {
    setModalVisible(false);
  };

  const handleFilterPress = (filter: string, index: number) => {
    animateFilter(index);
    setSelectedFilter(filter);
  };

  const handleTaskPress = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
    
    Animated.sequence([
      Animated.timing(taskScaleAnimations[taskId], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(taskScaleAnimations[taskId], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const isCompleted = completedTasks.includes(taskId);
      
      // Обновить статус задачи на сервере
      await updateTask(taskId, { completed: !isCompleted });

      if (isCompleted) {
        setCompletedTasks(completedTasks.filter(id => id !== taskId));
      } else {
        setCompletedTasks([...completedTasks, taskId]);
        
        // Анимация конфетти или успеха
        Alert.alert('Вітаємо! 🎉', 'Завдання виконано! Ви заробили бали! 🌟');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить статус задачи');
    }
  };

  // Загрузка статуса выполненных задач из состояния задач
  useEffect(() => {
    const completed = tasks
      .filter(task => task.completed)
      .map(task => task.id);
    
    setCompletedTasks(completed);
  }, [tasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return COLORS.gray;
      case 'in_progress':
        return COLORS.warning;
      case 'done':
        return COLORS.success;
      default:
        return COLORS.gray;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return 'checkbox-blank-circle-outline';
      case 'in_progress':
        return 'progress-clock';
      case 'done':
        return 'checkbox-marked-circle';
      default:
        return 'checkbox-blank-circle-outline';
    }
  };

  // Получаем отфильтрованные задачи
  const filteredTasks = tasks.filter(task => {
    if (selectedFilter === 'Все') return true;
    if (selectedFilter === 'Мои') return true; // Тут нужна проверка на текущего пользователя
    if (selectedFilter === 'Семья') return true; // Тут нужна проверка на семью
    return true;
  });

  return (
    <View style={styles.background}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
      >
        <Text style={styles.title}>Завдання</Text>
        <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddPress}
          >
            <MaterialCommunityIcons name="plus" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.container}>
        <View style={styles.filterContainer}>
          {['Все', 'Мои', 'Семья'].map((filter, index) => (
            <Animated.View
              key={index}
              style={{ transform: [{ scale: filterAnimations[index] }] }}
            >
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive,
                ]}
                onPress={() => handleFilterPress(filter, index)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.tasksContainer}>
          {filteredTasks.map((task) => (
            <Animated.View
              key={task.id}
              style={[
                styles.taskCard,
                { transform: [{ scale: taskScaleAnimations[task.id] || 1 }] },
              ]}
            >
              <TouchableOpacity 
                style={styles.taskContent}
                onPress={() => handleTaskPress(task.id)}
              >
                <TouchableOpacity 
                  style={styles.taskIcon}
                  onPress={() => handleTaskComplete(task.id)}
                >
                  <MaterialCommunityIcons
                    name={completedTasks.includes(task.id) ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={24}
                    color={completedTasks.includes(task.id) ? COLORS.success : COLORS.gray}
                  />
                </TouchableOpacity>
                <View style={styles.taskInfo}>
                  <Text style={[
                    styles.taskTitle,
                    completedTasks.includes(task.id) && styles.completedText
                  ]}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskDescription}>{task.description}</Text>
                  {expandedTask === task.id && (
                    <Animated.View 
                      style={[
                        styles.taskDetails,
                        { opacity: expandedTask === task.id ? 1 : 0 }
                      ]}
                    >
                      <View style={styles.taskDetailRow}>
                        <MaterialCommunityIcons name="account" size={16} color={COLORS.gray} />
                        <Text style={styles.taskDetailText}>
                          Исполнитель: {task.assignedToName || 'Не назначен'}
                        </Text>
                      </View>
                      {task.deadline && (
                        <View style={styles.taskDetailRow}>
                          <MaterialCommunityIcons name="calendar" size={16} color={COLORS.gray} />
                          <Text style={styles.taskDetailText}>
                            Срок: {new Date(task.deadline).toLocaleDateString()}
                          </Text>
                        </View>
                      )}
                      <View style={styles.taskDetailRow}>
                        <MaterialCommunityIcons name="star" size={16} color={COLORS.warning} />
                        <Text style={styles.taskDetailText}>
                          Баллы: {task.points || 10}
                        </Text>
                      </View>
                    </Animated.View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {/* Модальное окно с формой создания задачи */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Новая задача</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.grayDark} />
              </TouchableOpacity>
            </View>
            <TaskForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  addButton: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  tasksContainer: {
    marginBottom: 100,
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 12,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  taskContent: {
    flexDirection: 'row',
    padding: 16,
  },
  taskIcon: {
    marginRight: 12,
    alignSelf: 'flex-start',
    padding: 4,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  taskDescription: {
    fontSize: SIZES.font,
    color: COLORS.grayDark,
    marginBottom: 8,
  },
  taskDetails: {
    backgroundColor: COLORS.light,
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  taskDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskDetailText: {
    fontSize: SIZES.small,
    color: COLORS.grayDark,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default TasksScreen; 