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
import { Task, BudgetCategory } from '../types';

const BudgetCategoryCard: React.FC<{
  category: BudgetCategory;
  onUpdate: (id: string, updates: Partial<BudgetCategory>) => void;
  onDelete: (id: string) => void;
}> = ({ category, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBudget, setEditedBudget] = useState(category.budget.toString());

  const handleSave = () => {
    const amount = parseFloat(editedBudget);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Помилка', 'Будь ласка, введіть коректну суму');
      return;
    }
    onUpdate(category.id, { budget: amount });
    setIsEditing(false);
  };

  const progress = (category.spent / category.budget) * 100;

  return (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryTitleContainer}>
          <MaterialCommunityIcons 
            name={category.icon as any} 
            size={24} 
            color={category.color} 
          />
          <Text style={styles.categoryTitle}>{category.name}</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(category.id)}>
          <MaterialCommunityIcons name="delete" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContent}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              value={editedBudget}
              onChangeText={setEditedBudget}
              keyboardType="numeric"
              placeholder="Введіть суму"
              placeholderTextColor={COLORS.gray}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Зберегти</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Text style={styles.categoryBudget}>
              {new Intl.NumberFormat('uk-UA', {
                style: 'currency',
                currency: 'UAH',
                minimumFractionDigits: 0,
              }).format(category.budget)}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: progress > 100 ? COLORS.danger : COLORS.success
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {`${Math.round(progress)}% використано`}
          </Text>
        </View>

        <View style={styles.categoryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Витрачено</Text>
            <Text style={styles.statValue}>
              {new Intl.NumberFormat('uk-UA', {
                style: 'currency',
                currency: 'UAH',
                minimumFractionDigits: 0,
              }).format(category.spent)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Залишилось</Text>
            <Text style={[
              styles.statValue,
              { color: category.budget - category.spent < 0 ? COLORS.danger : COLORS.success }
            ]}>
              {new Intl.NumberFormat('uk-UA', {
                style: 'currency',
                currency: 'UAH',
                minimumFractionDigits: 0,
              }).format(category.budget - category.spent)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const FinanceScreen: React.FC = () => {
  const { 
    budget, 
    updateBudget, 
    addBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory
  } = useApp();
  
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.totalBudget.toString());
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    budget: '',
    icon: 'folder' as const,
    color: COLORS.primary
  });
  
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.budget) {
      Alert.alert('Помилка', 'Будь ласка, заповніть усі поля');
      return;
    }

    const amount = parseFloat(newCategory.budget);
    if (isNaN(amount) || amount < 0) {
      Alert.alert('Помилка', 'Будь ласка, введіть коректну суму');
      return;
    }

    try {
      addBudgetCategory({
        name: newCategory.name,
        budget: amount,
        icon: newCategory.icon,
        color: newCategory.color
      });
      setShowAddCategory(false);
      setNewCategory({ name: '', budget: '', icon: 'folder' as const, color: COLORS.primary });
    } catch (error) {
      Alert.alert('Помилка', error instanceof Error ? error.message : 'Не вдалося додати категорію');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
      >
        <Text style={styles.title}>Бюджет</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.iconButton, styles.addButton]}
            onPress={() => setShowAddCategory(true)}
          >
            <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.budgetCard}>
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
              </View>
            ) : (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Text style={styles.budgetAmount}>
                  {new Intl.NumberFormat('uk-UA', {
                    style: 'currency',
                    currency: 'UAH',
                    minimumFractionDigits: 0,
                  }).format(budget.totalBudget)}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.budgetProgress}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Використано бюджету:</Text>
              <Text style={styles.progressValue}>
                {Math.round((budget.allocatedBudget / budget.totalBudget) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.min((budget.allocatedBudget / budget.totalBudget) * 100, 100)}%`,
                    backgroundColor: budget.allocatedBudget > budget.totalBudget ? COLORS.danger : COLORS.success
                  }
                ]}
              />
            </View>
            <View style={styles.budgetStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Розподілено</Text>
                <Text style={styles.statValue}>
                  {new Intl.NumberFormat('uk-UA', {
                    style: 'currency',
                    currency: 'UAH',
                    minimumFractionDigits: 0,
                  }).format(budget.allocatedBudget)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Доступно</Text>
                <Text style={[
                  styles.statValue,
                  { color: budget.availableBudget < 0 ? COLORS.danger : COLORS.success }
                ]}>
                  {new Intl.NumberFormat('uk-UA', {
                    style: 'currency',
                    currency: 'UAH',
                    minimumFractionDigits: 0,
                  }).format(budget.availableBudget)}
                </Text>
              </View>
            </View>
          </View>

          {isEditing && (
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => {
                  setNewBudget(budget.totalBudget.toString());
                  setIsEditing(false);
                }}
              >
                <Text style={styles.editButtonText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={async () => {
                  const amount = parseFloat(newBudget);
                  if (!isNaN(amount) && amount >= 0) {
                    try {
                      console.log('Сохраняем бюджет:', amount);
                      await updateBudget({ totalBudget: amount });
                      setIsEditing(false);
                    } catch (error) {
                      console.error('Ошибка при сохранении бюджета:', error);
                      // Ошибка уже обработана в updateBudget
                    }
                  } else {
                    Alert.alert('Помилка', 'Будь ласка, введіть коректну суму');
                  }
                }}
              >
                <Text style={styles.editButtonText}>Зберегти</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Категорії витрат</Text>
          {budget.categories.map(category => (
            <BudgetCategoryCard
              key={category.id}
              category={category}
              onUpdate={updateBudgetCategory}
              onDelete={deleteBudgetCategory}
            />
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showAddCategory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddCategory(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Нова категорія</Text>
            
            <TextInput
              style={styles.modalInput}
              value={newCategory.name}
              onChangeText={(text) => setNewCategory(prev => ({ ...prev, name: text }))}
              placeholder="Назва категорії"
              placeholderTextColor={COLORS.gray}
            />

            <TextInput
              style={styles.modalInput}
              value={newCategory.budget}
              onChangeText={(text) => setNewCategory(prev => ({ ...prev, budget: text }))}
              keyboardType="numeric"
              placeholder="Бюджет"
              placeholderTextColor={COLORS.gray}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddCategory(false)}
              >
                <Text style={styles.modalButtonText}>Скасувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddCategory}
              >
                <Text style={styles.modalButtonText}>Додати</Text>
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
    padding: SIZES.padding,
    paddingTop: SIZES.padding * 2,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: SIZES.base,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: SIZES.h2,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  budgetCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  budgetTitle: {
    fontSize: SIZES.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  budgetAmount: {
    fontSize: SIZES.h2,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  editContainer: {
    flex: 1,
    marginLeft: SIZES.base,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    color: COLORS.text,
    fontSize: SIZES.h3,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SIZES.base,
    marginTop: SIZES.base,
  },
  editButton: {
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.radius,
    minWidth: 100,
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: SIZES.font,
  },
  budgetProgress: {
    marginTop: SIZES.base,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  progressLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  progressValue: {
    fontSize: SIZES.font,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SIZES.padding,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
  },
  budgetStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  categoriesSection: {
    marginTop: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
  },
  categoryTitle: {
    fontSize: SIZES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  categoryContent: {
    gap: SIZES.base,
  },
  categoryBudget: {
    fontSize: SIZES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginVertical: SIZES.base,
  },
  progressText: {
    fontSize: SIZES.body4,
    color: COLORS.gray,
    marginTop: 4,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.base,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: SIZES.body4,
    color: COLORS.gray,
  },
  statValue: {
    fontSize: SIZES.h4,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: SIZES.padding,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    gap: SIZES.padding,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    color: COLORS.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.padding,
  },
  modalButton: {
    flex: 1,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.gray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.base,
    borderRadius: SIZES.radius,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default FinanceScreen; 