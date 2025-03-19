import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useApp } from '../context/AppContext';
import TransactionStats from '../components/TransactionStats';
import ExpensesChart from '../components/ExpensesChart';
import { Task } from '../types';

const FinanceScreen: React.FC = () => {
  const { budget, updateBudget, tasks, allocateTaskBudget } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.totalBudget.toString());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [allocateAmount, setAllocateAmount] = useState('');
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(addButtonScale, {
        toValue: 0.9,
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

  const animateCard = () => {
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddBudget = () => {
    animateButton();
    setIsEditing(true);
  };

  const handleSaveBudget = () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Помилка', 'Будь ласка, введіть коректну суму');
      return;
    }
    updateBudget({ totalBudget: amount });
    setIsEditing(false);
  };

  const handleAllocateBudget = () => {
    if (!selectedTask) return;
    
    const amount = parseFloat(allocateAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Помилка', 'Будь ласка, введіть коректну суму');
      return;
    }

    try {
      allocateTaskBudget(selectedTask.id, amount);
      setShowAllocateModal(false);
      setSelectedTask(null);
      setAllocateAmount('');
      Alert.alert('Успіх', 'Бюджет успішно розподілено');
    } catch (error) {
      Alert.alert('Помилка', error instanceof Error ? error.message : 'Не вдалося розподілити бюджет');
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('uk-UA', {
      style: 'currency',
      currency: 'UAH',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (allocated: number, total: number) => {
    return total > 0 ? (allocated / total) * 100 : 0;
  };

  const chartData = {
    labels: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(108, 92, 231, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
      >
        <Text style={styles.title}>Бюджет</Text>
        <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddBudget}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Animated.View 
          style={[styles.budgetCard, { transform: [{ scale: cardScale }] }]}
        >
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>Загальний бюджет</Text>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  value={newBudget}
                  onChangeText={setNewBudget}
                  keyboardType="numeric"
                  placeholder="Введіть суму"
                  placeholderTextColor={COLORS.gray}
                />
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveBudget}
                >
                  <Text style={styles.saveButtonText}>Зберегти</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.budgetAmount}>
                {formatMoney(budget.totalBudget)}
              </Text>
            )}
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${calculateProgress(budget.allocatedBudget, budget.totalBudget)}%` }
                ]}
              />
            </View>
            <View style={styles.budgetStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Розподілено</Text>
                <Text style={styles.statValue}>
                  {formatMoney(budget.allocatedBudget)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Доступно</Text>
                <Text style={[
                  styles.statValue,
                  { color: budget.availableBudget < 0 ? COLORS.danger : COLORS.success }
                ]}>
                  {formatMoney(budget.availableBudget)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Розподіл бюджету</Text>
            <TouchableOpacity 
              style={styles.helpButton}
              onPress={() => Alert.alert(
                'Як це працює?',
                'Натисніть на завдання, щоб розподілити бюджет. Ви можете виділити кошти тільки з доступного бюджету. При виконанні завдання з бюджетом, учасники отримають винагороду.'
              )}
            >
              <MaterialCommunityIcons name="help-circle-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => {
                animateCard();
                setSelectedTask(task);
                setAllocateAmount(task.budget?.toString() || '');
                setShowAllocateModal(true);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.taskCard}>
                <View style={styles.taskIcon}>
                  <MaterialCommunityIcons
                    name={task.completed ? "check-circle" : "clock-outline"}
                    size={24}
                    color={task.completed ? COLORS.success : COLORS.primary}
                  />
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskDescription} numberOfLines={1}>
                    {task.description}
                  </Text>
                  {task.budget ? (
                    <Text style={styles.taskBudget}>
                      Бюджет: {formatMoney(task.budget)}
                    </Text>
                  ) : (
                    <Text style={styles.taskNoBudget}>
                      Бюджет не призначено
                    </Text>
                  )}
                </View>
                <MaterialCommunityIcons
                  name="cash-plus"
                  size={24}
                  color={COLORS.primary}
                />
              </View>
            </TouchableOpacity>
          ))}

          {tasks.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={48} color={COLORS.gray} />
              <Text style={styles.emptyStateText}>Немає доступних завдань</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showAllocateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllocateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Розподіл бюджету
            </Text>
            <Text style={styles.modalTaskTitle}>
              {selectedTask?.title}
            </Text>
            
            <View style={styles.modalInfo}>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Поточний бюджет</Text>
                <Text style={styles.modalInfoValue}>
                  {formatMoney(selectedTask?.budget || 0)}
                </Text>
              </View>
              <View style={styles.modalInfoItem}>
                <Text style={styles.modalInfoLabel}>Доступно</Text>
                <Text style={[
                  styles.modalInfoValue,
                  { color: budget.availableBudget < 0 ? COLORS.danger : COLORS.success }
                ]}>
                  {formatMoney(budget.availableBudget)}
                </Text>
              </View>
            </View>

            <Text style={styles.inputLabel}>Новий бюджет</Text>
            <TextInput
              style={styles.modalInput}
              value={allocateAmount}
              onChangeText={setAllocateAmount}
              keyboardType="numeric"
              placeholder="Введіть суму"
              placeholderTextColor={COLORS.gray}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAllocateModal(false)}
              >
                <Text style={styles.modalButtonText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleAllocateBudget}
              >
                <Text style={[styles.modalButtonText, { color: COLORS.white }]}>
                  Зберегти
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  budgetCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...SHADOWS.medium,
  },
  budgetHeader: {
    marginBottom: 16,
  },
  budgetTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  budgetAmount: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    color: COLORS.dark,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.grayLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.dark,
  },
  tasksSection: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  helpButton: {
    padding: 4,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    ...SHADOWS.light,
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
  taskDescription: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 4,
  },
  taskBudget: {
    fontSize: SIZES.small,
    color: COLORS.primary,
  },
  taskNoBudget: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 8,
  },
  modalTaskTitle: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    marginBottom: 16,
  },
  modalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalInfoItem: {
    alignItems: 'center',
  },
  modalInfoLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 4,
  },
  modalInfoValue: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.dark,
  },
  inputLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 8,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: SIZES.medium,
    color: COLORS.dark,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.light,
  },
  modalButtonSave: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    fontSize: SIZES.medium,
    fontWeight: '500',
  },
});

export default FinanceScreen; 