import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  FlatList,
  Modal,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Event, User } from '../../types';
import { COLORS, SIZES, SHADOWS } from '../../constants';
import { useApp } from '../../context/AppContext';
import DateTimePicker from '@react-native-community/datetimepicker';

interface EventFormProps {
  onSubmit: (event: Omit<Event, '_id'>) => void;
  onCancel: () => void;
  initialValues?: Omit<Event, '_id'>;
  isSubmitting?: boolean;
}

// Компоненты выбора даты и времени
interface DateTimePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate: Date;
}

const CustomDateTimePicker: React.FC<DateTimePickerProps> = ({
  visible,
  onClose,
  onSelect,
  initialDate,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(initialDate));
  const [activeView, setActiveView] = useState<'date' | 'time'>('date');
  
  // Форматирование даты для отображения
  const formatDay = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  // Обработчики изменения даты
  const addDays = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const addMonths = (months: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + months);
    setSelectedDate(newDate);
  };

  const addHours = (hours: number) => {
    const newDate = new Date(selectedDate);
    newDate.setHours(newDate.getHours() + hours);
    setSelectedDate(newDate);
  };

  const addMinutes = (minutes: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    setSelectedDate(newDate);
  };

  // Переключение между экранами выбора даты и времени
  const toggleView = () => {
    setActiveView(activeView === 'date' ? 'time' : 'date');
  };

  // Подтверждение выбора
  const handleConfirm = () => {
    onSelect(selectedDate);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.datePickerCancel}>Відміна</Text>
            </TouchableOpacity>
            <Text style={styles.datePickerTitle}>
              {activeView === 'date' ? 'Оберіть дату' : 'Оберіть час'}
            </Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={styles.datePickerConfirm}>Готово</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.dateTimeToggle} 
            onPress={toggleView}
          >
            <Text style={styles.dateTimeToggleText}>
              {activeView === 'date' 
                ? formatDay(selectedDate) + ' · ' + formatTime(selectedDate)
                : formatDay(selectedDate) + ' · ' + formatTime(selectedDate)}
            </Text>
            <MaterialCommunityIcons 
              name={activeView === 'date' ? 'clock-outline' : 'calendar-month'} 
              size={20} 
              color={COLORS.primary} 
            />
          </TouchableOpacity>

          {activeView === 'date' ? (
            <View style={styles.datePickerContent}>
              <View style={styles.monthSelector}>
                <TouchableOpacity onPress={() => addMonths(-1)} style={styles.arrowButton}>
                  <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.monthText}>{formatMonth(selectedDate)}</Text>
                <TouchableOpacity onPress={() => addMonths(1)} style={styles.arrowButton}>
                  <MaterialCommunityIcons name="chevron-right" size={28} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.daySelector}>
                <TouchableOpacity 
                  style={[styles.dayButton, styles.mainDayButton]}
                  onPress={() => setSelectedDate(new Date())}
                >
                  <Text style={styles.todayButtonText}>Сьогодні</Text>
                </TouchableOpacity>
                
                <View style={styles.dayButtonsRow}>
                  <TouchableOpacity onPress={() => addDays(-1)} style={styles.arrowButton}>
                    <MaterialCommunityIcons name="chevron-left" size={28} color={COLORS.primary} />
                  </TouchableOpacity>
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayText}>{selectedDate.getDate()}</Text>
                    <Text style={styles.dayName}>
                      {selectedDate.toLocaleDateString('ru-RU', { weekday: 'short' })}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => addDays(1)} style={styles.arrowButton}>
                    <MaterialCommunityIcons name="chevron-right" size={28} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.quickDates}>
                  <TouchableOpacity 
                    key="tomorrow"
                    style={styles.quickDateButton}
                    onPress={() => addDays(1)}
                  >
                    <Text style={styles.quickDateText}>Завтра</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    key="dayAfterTomorrow"
                    style={styles.quickDateButton}
                    onPress={() => addDays(2)}
                  >
                    <Text style={styles.quickDateText}>Післязавтра</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    key="nextWeek"
                    style={styles.quickDateButton}
                    onPress={() => addDays(7)}
                  >
                    <Text style={styles.quickDateText}>Через тиждень</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.timePickerContent}>
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>Години</Text>
                <View style={styles.timeControls}>
                  <TouchableOpacity onPress={() => addHours(-1)} style={styles.timeButton}>
                    <MaterialCommunityIcons name="minus" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>
                    {selectedDate.getHours().toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity onPress={() => addHours(1)} style={styles.timeButton}>
                    <MaterialCommunityIcons name="plus" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.timeSeparator}>:</Text>
              
              <View style={styles.timeSection}>
                <Text style={styles.timeLabel}>Хвилини</Text>
                <View style={styles.timeControls}>
                  <TouchableOpacity onPress={() => addMinutes(-5)} style={styles.timeButton}>
                    <MaterialCommunityIcons name="minus" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.timeValue}>
                    {selectedDate.getMinutes().toString().padStart(2, '0')}
                  </Text>
                  <TouchableOpacity onPress={() => addMinutes(5)} style={styles.timeButton}>
                    <MaterialCommunityIcons name="plus" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.quickTimes}>
                <TouchableOpacity 
                  key="morning"
                  style={styles.quickTimeButton}
                  onPress={() => {
                    const date = new Date(selectedDate);
                    date.setHours(9, 0, 0);
                    setSelectedDate(date);
                  }}
                >
                  <Text style={styles.quickTimeText}>09:00</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  key="noon"
                  style={styles.quickTimeButton}
                  onPress={() => {
                    const date = new Date(selectedDate);
                    date.setHours(12, 0, 0);
                    setSelectedDate(date);
                  }}
                >
                  <Text style={styles.quickTimeText}>12:00</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  key="afternoon"
                  style={styles.quickTimeButton}
                  onPress={() => {
                    const date = new Date(selectedDate);
                    date.setHours(15, 0, 0);
                    setSelectedDate(date);
                  }}
                >
                  <Text style={styles.quickTimeText}>15:00</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  key="evening"
                  style={styles.quickTimeButton}
                  onPress={() => {
                    const date = new Date(selectedDate);
                    date.setHours(18, 0, 0);
                    setSelectedDate(date);
                  }}
                >
                  <Text style={styles.quickTimeText}>18:00</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  isSubmitting = false
}) => {
  const { auth } = useApp();
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [location, setLocation] = useState(initialValues?.location || '');
  const [startDate, setStartDate] = useState(initialValues?.startDate || new Date());
  const [endDate, setEndDate] = useState(initialValues?.endDate || new Date());
  const [isAllDay, setIsAllDay] = useState(initialValues?.isAllDay || false);
  const [participants, setParticipants] = useState<string[]>(initialValues?.participants || []);
  const [participant, setParticipant] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    dates?: string;
  }>({});

  // При создании формы автоматически добавляем текущего пользователя как участника
  useEffect(() => {
    if (auth.user && !participants.includes(auth.user.id)) {
      setParticipants([...participants, auth.user.id]);
    }
  }, [auth.user]);

  // Устанавливаем время на начало и конец дня для событий на весь день
  useEffect(() => {
    if (isAllDay) {
      // Устанавливаем startDate на начало дня (00:00:00)
      const newStartDate = new Date(startDate);
      newStartDate.setHours(0, 0, 0, 0);
      setStartDate(newStartDate);
      
      // Устанавливаем endDate на конец дня (23:59:59)
      const newEndDate = new Date(endDate);
      newEndDate.setHours(23, 59, 59, 999);
      setEndDate(newEndDate);
    }
  }, [isAllDay]);

  const validateForm = () => {
    const newErrors: {
      title?: string;
      description?: string;
      dates?: string;
    } = {};
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Назва події обов\'язкова';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Опис обов\'язковий';
      isValid = false;
    }

    if (endDate < startDate) {
      newErrors.dates = 'Дата закінчення має бути після дати початку';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    console.log('Відправляємо дані форми:', {
      title,
      description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      location,
      participants,
      isAllDay,
    });

    onSubmit({
      title,
      description,
      startDate,
      endDate,
      participants,
      location,
      isAllDay,
    });
  };

  const formatDate = (date: Date) => {
    if (isAllDay) {
      // Только дата без времени для событий на весь день
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
    // Дата и время для обычных событий
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      const newStartDate = new Date(startDate);
      newStartDate.setFullYear(newDate.getFullYear());
      newStartDate.setMonth(newDate.getMonth());
      newStartDate.setDate(newDate.getDate());
      setStartDate(newStartDate);
      
      // Если конечная дата раньше начальной, обновляем конечную дату
      if (endDate < newStartDate) {
        setEndDate(new Date(newStartDate));
      }
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const newTime = new Date(selectedTime);
      const newStartDate = new Date(startDate);
      newStartDate.setHours(newTime.getHours());
      newStartDate.setMinutes(newTime.getMinutes());
      setStartDate(newStartDate);
      
      // Если конечное время совпадает или раньше начального, обновляем конечное время
      if (endDate <= newStartDate) {
        const newEndDate = new Date(newStartDate);
        newEndDate.setHours(newStartDate.getHours() + 1);
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      const newEndDate = new Date(endDate);
      newEndDate.setFullYear(newDate.getFullYear());
      newEndDate.setMonth(newDate.getMonth());
      newEndDate.setDate(newDate.getDate());
      
      // Проверяем, что конечная дата не раньше начальной
      if (newEndDate < startDate) {
        newEndDate.setTime(startDate.getTime());
      }
      
      setEndDate(newEndDate);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const newTime = new Date(selectedTime);
      const newEndDate = new Date(endDate);
      newEndDate.setHours(newTime.getHours());
      newEndDate.setMinutes(newTime.getMinutes());
      
      // Проверяем, что конечное время не раньше начального
      if (newEndDate < startDate) {
        newEndDate.setTime(startDate.getTime());
        // Добавляем час для разницы
        newEndDate.setHours(newEndDate.getHours() + 1);
      }
      
      setEndDate(newEndDate);
    }
  };

  const handleAddParticipant = () => {
    if (participant.trim() && !participants.includes(participant.trim())) {
      setParticipants([...participants, participant.trim()]);
      setParticipant('');
    }
  };

  const handleRemoveParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Назва події</Text>
        <TextInput
          style={[styles.input, errors.title ? styles.inputError : null]}
          placeholder="Введіть назву події"
          value={title}
          onChangeText={setTitle}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Опис</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            errors.description ? styles.inputError : null,
          ]}
          placeholder="Опис події (необов'язково)"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
      </View>

      <View style={styles.datesSection}>
        <Text style={[styles.label, {marginBottom: 12}]}>Час проведення</Text>
        
        <View style={styles.allDayContainer}>
          <Text style={styles.allDayLabel}>Весь день</Text>
          <TouchableOpacity 
            style={[styles.checkboxContainer, isAllDay && styles.checkboxActive]}
            onPress={() => setIsAllDay(!isAllDay)}
          >
            {isAllDay && (
              <MaterialCommunityIcons 
                name="check" 
                size={16} 
                color={COLORS.white} 
              />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.datesContainer}>
          <View style={[styles.dateGroup]}>
            <Text style={styles.dateLabel}>Початок</Text>
        <TouchableOpacity
              style={[
                styles.dateButton,
                errors.dates ? styles.inputError : null,
              ]}
          onPress={() => setShowStartDatePicker(true)}
        >
              <View style={styles.dateButtonContent}>
                <Text style={styles.dateText} numberOfLines={1}>{formatDate(startDate)}</Text>
                <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} />
              </View>
        </TouchableOpacity>
      </View>

          <View style={[styles.dateGroup]}>
            <Text style={styles.dateLabel}>Закінчення</Text>
        <TouchableOpacity
              style={[
                styles.dateButton,
                errors.dates ? styles.inputError : null,
              ]}
          onPress={() => setShowEndDatePicker(true)}
        >
              <View style={styles.dateButtonContent}>
                <Text style={styles.dateText} numberOfLines={1}>{formatDate(endDate)}</Text>
                <MaterialCommunityIcons name="calendar-clock" size={20} color={COLORS.primary} />
              </View>
        </TouchableOpacity>
          </View>
        </View>
        {errors.dates && <Text style={styles.errorText}>{errors.dates}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Місце проведення</Text>
        <TextInput
          style={styles.input}
          placeholder="Де відбудеться подія? (необов'язково)"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Участники</Text>
        <View style={styles.participantsContainer}>
          {auth.user && (
            <View style={styles.participantBadge}>
              <Text style={styles.participantText}>{auth.user.name} (ви)</Text>
            </View>
          )}
        </View>
        <Text style={styles.helperText}>Ви будете єдиним учасником цього події</Text>
      </View>

      {/* Наши кастомные компоненты выбора даты/времени */}
      <CustomDateTimePicker
        visible={showStartDatePicker}
        onClose={() => setShowStartDatePicker(false)}
        onSelect={(date) => {
          if (isAllDay) {
            // Если событие на весь день, сохраняем только дату и устанавливаем время на 00:00
            const newDate = new Date(date);
            newDate.setHours(0, 0, 0, 0);
            setStartDate(newDate);
          } else {
            setStartDate(date);
          }
          if (errors.dates) {
            setErrors({ ...errors, dates: undefined });
          }
        }}
        initialDate={startDate}
      />

      <CustomDateTimePicker
        visible={showEndDatePicker}
        onClose={() => setShowEndDatePicker(false)}
        onSelect={(date) => {
          if (isAllDay) {
            // Если событие на весь день, сохраняем только дату и устанавливаем время на 23:59
            const newDate = new Date(date);
            newDate.setHours(23, 59, 59, 999);
            setEndDate(newDate);
          } else {
            setEndDate(date);
          }
          if (errors.dates) {
            setErrors({ ...errors, dates: undefined });
          }
        }}
        initialDate={endDate}
      />

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Скасувати</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
          <Text style={[styles.buttonText, styles.submitButtonText]}>
              Зберегти
          </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: SIZES.font,
    color: COLORS.grayDark,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateLabel: {
    fontSize: SIZES.small,
    color: COLORS.grayDark,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 12,
    fontSize: SIZES.font,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: SIZES.small,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    padding: 10,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dateButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: SIZES.small,
    color: COLORS.dark,
    flexShrink: 1,
    marginRight: 4,
  },
  datesSection: {
    marginBottom: 16,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateGroup: {
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: Platform.OS === 'ios' ? 50 : 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cancelButton: {
    backgroundColor: COLORS.grayLight,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: SIZES.medium,
    color: COLORS.grayDark,
  },
  submitButtonText: {
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.7,
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    gap: 8,
  },
  participantBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 5,
    marginBottom: 5,
  },
  participantText: {
    color: COLORS.primary,
    fontSize: SIZES.small,
    fontWeight: '500',
  },
  helperText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 4,
  },
  // Стили для кастомного выбора даты/времени
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  datePickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '95%',
    maxWidth: 400,
    padding: 16,
    ...SHADOWS.medium,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  datePickerTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  datePickerCancel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    padding: 4,
  },
  datePickerConfirm: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: 'bold',
    padding: 4,
  },
  dateTimeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  dateTimeToggleText: {
    fontSize: SIZES.font,
    color: COLORS.dark,
    marginRight: 8,
  },
  datePickerContent: {
    marginBottom: 8,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.dark,
  },
  daySelector: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dayButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    width: '100%',
  },
  dayButton: {
    marginVertical: 4,
    borderRadius: 8,
    padding: 8,
  },
  mainDayButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  dayInfo: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  dayName: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  todayButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  arrowButton: {
    padding: 8,
  },
  quickDates: {
    marginTop: 12,
    width: '100%',
  },
  quickDateButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.light,
    marginVertical: 4,
    alignItems: 'center',
  },
  quickDateText: {
    color: COLORS.dark,
  },
  timePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timeSection: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 8,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    padding: 8,
    backgroundColor: COLORS.light,
    borderRadius: 20,
    margin: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark,
    width: 40,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  quickTimes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 24,
    width: '100%',
    paddingHorizontal: 8,
  },
  quickTimeButton: {
    backgroundColor: COLORS.light,
    padding: 8,
    borderRadius: 16,
    margin: 4,
    width: '22%',
    alignItems: 'center',
  },
  quickTimeText: {
    color: COLORS.dark,
    fontSize: SIZES.small,
  },
  allDayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  allDayLabel: {
    fontSize: SIZES.small,
    color: COLORS.grayDark,
    marginRight: 8,
  },
  checkboxContainer: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
  },
});

export default EventForm; 