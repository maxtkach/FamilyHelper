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
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const HomeScreen: React.FC = () => {
  const { tasks, events, getEvents, auth } = useApp();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  
  // Анимации
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const addButtonScale = useRef(new Animated.Value(1)).current;

  // Получаем события при загрузке компонента
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        await getEvents();
      } catch (error) {
        console.error('Ошибка при загрузке событий:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Получаем 3 ближайших предстоящих события
  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startDate) > now)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3);
  };

  const formatEventDate = (date: Date) => {
    const eventDate = new Date(date);
    
    // Проверяем, сегодня ли событие
    const today = new Date();
    const isToday = eventDate.getDate() === today.getDate() && 
                   eventDate.getMonth() === today.getMonth() && 
                   eventDate.getFullYear() === today.getFullYear();
    
    // Проверяем, завтра ли событие
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = eventDate.getDate() === tomorrow.getDate() && 
                       eventDate.getMonth() === tomorrow.getMonth() && 
                       eventDate.getFullYear() === tomorrow.getFullYear();
    
    if (isToday) {
      return `Сьогодні, ${eventDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Завтра, ${eventDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return eventDate.toLocaleDateString('uk-UA', { 
        day: 'numeric', 
        month: 'long',
        hour: '2-digit', 
        minute: '2-digit'
      });
    }
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

  // Получаем иконку для события в зависимости от его типа и содержания
  const getEventIcon = (eventTitle: string) => {
    const title = eventTitle.toLowerCase();
    
    if (title.includes('день рождения') || title.includes('др')) {
      return 'cake-variant';
    } else if (title.includes('встреча') || title.includes('собрание')) {
      return 'account-group';
    } else if (title.includes('поход') || title.includes('кино') || title.includes('театр')) {
      return 'ticket';
    } else if (title.includes('ужин') || title.includes('обед') || title.includes('завтрак')) {
      return 'food-fork-drink';
    } else if (title.includes('спорт') || title.includes('тренировка')) {
      return 'dumbbell';
    } else if (title.includes('школа') || title.includes('уроки')) {
      return 'school';
    } else if (title.includes('доктор') || title.includes('врач') || title.includes('больница')) {
      return 'medical-bag';
    } else {
      return 'calendar-check';
    }
  };

  // Заглушка для статуса задачи, т.к. не все свойства определены в типе Task
  const getTaskStatus = (task: any) => {
    return task.status || 'todo';
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

  const navigateToCalendar = () => {
    // @ts-ignore - тип навигации можно уточнить позже
    navigation.navigate('Calendar');
  };

  const navigateToEventDetails = (eventId: string) => {
    // @ts-ignore - тип навигации можно уточнить позже
    navigation.navigate('Calendar', { eventId });
  };

  const upcomingEvents = getUpcomingEvents();

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
                    name={completedTasks.includes(task.id) ? 'checkbox-marked-circle' : getStatusIcon(getTaskStatus(task))}
                    size={24}
                    color={completedTasks.includes(task.id) ? COLORS.success : getStatusColor(getTaskStatus(task))}
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
                        Виконавець: {task.assignedTo?.join(', ') || 'Не назначено'}
                      </Text>
                      <Text style={styles.taskDetailText}>
                        Термін: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Не установлен'}
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Сімейні події</Text>
            <TouchableOpacity onPress={navigateToCalendar}>
              <Text style={styles.seeAllText}>Всі події</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <TouchableOpacity 
                key={event._id} 
                style={styles.eventCard}
                onPress={() => navigateToEventDetails(event._id)}
                activeOpacity={0.7}
              >
                <View style={[styles.eventIcon, event.isAllDay && styles.allDayEventIcon]}>
                  <MaterialCommunityIcons
                    name={getEventIcon(event.title)}
                    size={24}
                    color={event.isAllDay ? COLORS.secondary : COLORS.primary}
                  />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>
                    {event.isAllDay 
                      ? `Весь день, ${new Date(event.startDate).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })}` 
                      : formatEventDate(event.startDate)
                    }
                  </Text>
                  {event.location && (
                    <Text style={styles.eventLocation}>{event.location}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={40} color={COLORS.grayLight} />
              <Text style={styles.emptyStateText}>Немає найближчих подій</Text>
              <TouchableOpacity 
                style={styles.createEventButton}
                onPress={navigateToCalendar}
              >
                <Text style={styles.createEventText}>Створити подію</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистика користувача</Text>
          <TouchableOpacity 
            style={styles.statsCard}
            onPress={() => Alert.alert('Статистика', 'Тут буде детальна статистика')}
            activeOpacity={0.7}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {tasks.filter(t => t.assignedTo && t.assignedTo.includes(auth.user?.id || '')).length}
                </Text>
                <Text style={styles.statLabel}>Завдань</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {tasks.filter(t => t.assignedTo && t.assignedTo.includes(auth.user?.id || '') && t.completed).length}
                </Text>
                <Text style={styles.statLabel}>Виконано</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{auth.user?.points || 0}</Text>
                <Text style={styles.statLabel}>Очків</Text>
              </View>
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
    backgroundColor: COLORS.light,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.extraLarge,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.light,
  },
  container: {
    flex: 1,
    padding: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    color: COLORS.dark,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: SIZES.font,
    color: COLORS.primary,
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 10,
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  taskContent: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskIcon: {
    marginRight: 15,
    padding: 5,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  taskDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
  },
  taskDetailText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 5,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.gray,
  },
  taskPoints: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 10,
    ...SHADOWS.light,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  allDayEventIcon: {
    backgroundColor: COLORS.light,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  eventDate: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    ...SHADOWS.light,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.grayLight,
  },
  emptyStateContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  emptyStateText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginVertical: 10,
  },
  createEventButton: {
    backgroundColor: COLORS.light,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  createEventText: {
    color: COLORS.primary,
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  loader: {
    marginVertical: 20,
  },
});

export default HomeScreen; 