import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Animated,
  Alert,
  Platform 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { LinearGradient } from 'expo-linear-gradient';

const TasksScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('Все');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  // Анимации
  const filterAnimations = useRef(
    ['Все', 'Мои', 'Семья'].map(() => new Animated.Value(1))
  ).current;
  
  const taskScaleAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;
  const addButtonScale = useRef(new Animated.Value(1)).current;

  const tasks = [
    {
      id: '1',
      title: 'Помити посуд',
      description: 'Після вечері помити весь посуд',
      points: 10,
      status: 'todo',
      assignedTo: 'Іван',
    },
    {
      id: '2',
      title: 'Пропилососити',
      description: 'Пропилососити всі кімнати',
      points: 15,
      status: 'in_progress',
      assignedTo: 'Марія',
    },
    {
      id: '3',
      title: 'Винести сміття',
      description: 'Винести сміття з усіх кошиків',
      points: 5,
      status: 'done',
      assignedTo: 'Петро',
    },
  ];

  // Инициализация анимаций для задач
  tasks.forEach(task => {
    if (!taskScaleAnimations[task.id]) {
      taskScaleAnimations[task.id] = new Animated.Value(1);
    }
  });

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
    Alert.alert('Нове завдання', 'Тут буде форма створення нового завдання');
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

  const handleTaskComplete = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
      
      // Анимация конфетти или успеха
      Alert.alert('Вітаємо! 🎉', 'Завдання виконано! Ви заробили бали! 🌟');
    }
  };

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

        <View style={styles.section}>
          {tasks.map((task) => (
            <Animated.View
              key={task.id}
              style={[
                styles.taskCard,
                {
                  transform: [{ scale: taskScaleAnimations[task.id] }],
                  opacity: completedTasks.includes(task.id) ? 0.7 : 1,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.taskContent}
                onPress={() => handleTaskPress(task.id)}
                activeOpacity={0.8}
              >
                <TouchableOpacity
                  style={styles.taskIcon}
                  onPress={() => handleTaskComplete(task.id)}
                >
                  <MaterialCommunityIcons
                    name={completedTasks.includes(task.id) ? 'checkbox-marked-circle' : getStatusIcon(task.status)}
                    size={24}
                    color={completedTasks.includes(task.id) ? COLORS.success : getStatusColor(task.status)}
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
                          Виконавець: {task.assignedTo}
                        </Text>
                      </View>
                      <View style={styles.taskDetailRow}>
                        <MaterialCommunityIcons name="star" size={16} color={COLORS.warning} />
                        <Text style={styles.taskDetailText}>
                          Бали: {task.points}
                        </Text>
                      </View>
                      <View style={styles.taskDetailRow}>
                        <MaterialCommunityIcons 
                          name={getStatusIcon(task.status)} 
                          size={16} 
                          color={getStatusColor(task.status)} 
                        />
                        <Text style={styles.taskDetailText}>
                          Статус: {task.status === 'todo' ? 'До виконання' : 
                                  task.status === 'in_progress' ? 'В процесі' : 'Виконано'}
                        </Text>
                      </View>
                    </Animated.View>
                  )}
                </View>
                <Text style={styles.taskPoints}>+{task.points} 🌟</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
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
  section: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  taskDescription: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  taskDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.light,
    borderRadius: 12,
    gap: 8,
  },
  taskDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskDetailText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    flex: 1,
  },
  taskPoints: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default TasksScreen; 