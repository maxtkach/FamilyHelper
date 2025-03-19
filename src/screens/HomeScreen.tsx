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
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen: React.FC = () => {
  const { tasks } = useApp();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const addButtonScale = useRef(new Animated.Value(1)).current;

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
    Alert.alert('Новая задача', 'Здесь будет форма создания новой задачи');
  };

  const handleTaskPress = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId);
  };

  const handleTaskComplete = (taskId: string) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
      Alert.alert('Поздравляем!', 'Вы заработали очки за выполнение задачи! 🌟');
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

  return (
    <View style={styles.background}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
      >
        <Text style={styles.title}>Головна</Text>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Завдання на сьогодні</Text>
          {tasks.slice(0, 3).map((task) => (
            <Animated.View 
              key={task.id} 
              style={[
                styles.taskCard,
                {
                  opacity: completedTasks.includes(task.id) ? 0.7 : 1,
                  transform: [
                    { 
                      scale: expandedTask === task.id ? scaleAnim : 1 
                    }
                  ]
                }
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
                    <View style={styles.taskDetails}>
                      <Text style={styles.taskDetailText}>
                        Виконавець: {task.assignedTo.join(', ')}
                      </Text>
                      <Text style={styles.taskDetailText}>
                        Термін: {task.dueDate.toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.taskPoints}>+{task.points} 🌟</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Сімейні події</Text>
          {['День народження мами', 'Похід у кіно', 'Сімейна вечеря'].map((event, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.eventCard}
              onPress={() => Alert.alert('Событие', 'Здесь будут подробности события')}
              activeOpacity={0.7}
            >
              <View style={styles.eventIcon}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={24}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event}</Text>
                <Text style={styles.eventDate}>20 мая 2024</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистика сім'ї</Text>
          <TouchableOpacity 
            style={styles.statsCard}
            onPress={() => Alert.alert('Статистика', 'Здесь будет подробная статистика')}
            activeOpacity={0.7}
          >
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedTasks.length * 10}</Text>
              <Text style={styles.statLabel}>Бали</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Завдання</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>Події</Text>
            </View>
          </TouchableOpacity>
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
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
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.light,
    borderRadius: 8,
  },
  taskDetailText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 4,
  },
  taskPoints: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    ...SHADOWS.light,
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.dark,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    ...SHADOWS.medium,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.grayLight,
    marginHorizontal: 16,
  },
});

export default HomeScreen; 