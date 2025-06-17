import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task } from '../../types';
import { COLORS, SIZES, FONTS } from '../../constants';

type TaskFormProps = {
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  initialValues?: Partial<Omit<Task, 'id' | 'createdAt'>>;
};

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel, initialValues }) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [date, setDate] = useState(
    initialValues?.deadline ? new Date(initialValues.deadline) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [hasDeadline, setHasDeadline] = useState(!!initialValues?.deadline);
  
  const [errors, setErrors] = useState({
    title: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { title: '' };

    if (!title.trim()) {
      newErrors.title = 'Назва завдання обов\'язкова';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const taskData: Omit<Task, 'id' | 'createdAt'> = {
      title,
      description,
      completed: false,
      deadline: hasDeadline ? date.toISOString() : undefined,
      assignedTo: [],
    };

    onSubmit(taskData);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('uk-UA');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Назва завдання*</Text>
        <TextInput
          style={[styles.input, errors.title ? styles.inputError : null]}
          value={title}
          onChangeText={setTitle}
          placeholder="Введіть назву завдання"
          placeholderTextColor={COLORS.gray}
        />
        {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Опис</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Введіть опис завдання"
          placeholderTextColor={COLORS.gray}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setHasDeadline(!hasDeadline)}
          >
            <View 
              style={[
                styles.checkboxInner, 
                hasDeadline ? styles.checkboxChecked : null
              ]} 
            />
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>Встановити термін виконання</Text>
        </View>
      </View>

      {hasDeadline && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Термін виконання</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Скасувати</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Зберегти</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.font,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.dark,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.font,
    color: COLORS.dark,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.small,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: SIZES.font,
    color: COLORS.dark,
  },
  datePickerButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: SIZES.font,
    color: COLORS.dark,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.grayLight,
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: COLORS.grayDark,
    fontSize: SIZES.font,
    fontWeight: '500',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: '500',
  },
});

export default TaskForm; 