import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useApp } from '../context/AppContext';
import { Event } from '../types';
import EventForm from '../components/forms/EventForm';

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
  };
}

const CalendarScreen: React.FC = () => {
  const { events, addEvent, getEvents, updateEvent, deleteEvent } = useApp();
  const [selected, setSelected] = useState('');
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const eventScale = useRef(new Animated.Value(1)).current;
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (fetchedRef.current) return;
      
      try {
        console.log('Начинаем загрузку событий...');
        setLoading(true);
        const result = await getEvents();
        console.log('События загружены:', result);
        fetchedRef.current = true;
      } catch (error) {
        console.error('Ошибка при загрузке событий:', error);
        Alert.alert('Ошибка', 'Не удалось загрузить события');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (date: Date): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const markedDates = events.reduce((acc: MarkedDates, event: Event) => {
    const startDateStr = formatDate(event.startDate);
    acc[startDateStr] = {
      marked: true,
      dotColor: COLORS.primary,
      selected: selected === startDateStr,
      selectedColor: COLORS.primary,
    };
    return acc;
  }, {});

  if (selected && !markedDates[selected]) {
    markedDates[selected] = {
      selected: true,
      selectedColor: COLORS.primary,
    };
  }

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

  const animateEvent = () => {
    Animated.sequence([
      Animated.timing(eventScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(eventScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAddEvent = () => {
    animateButton();
    setShowModal(true);
  };

  const handleSubmitEvent = async (eventData: Omit<Event, '_id'>) => {
    try {
      setIsSubmitting(true);
      await addEvent(eventData);
      setShowModal(false);
      Alert.alert('Успіх', 'Подію успішно створено');
      // Обновляем список событий после создания нового
      fetchedRef.current = false;
      await getEvents();
    } catch (error) {
      console.error('Помилка при створенні події:', error);
      Alert.alert('Помилка', 'Не вдалося створити подію');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEventPress = (event: Event) => {
    animateEvent();
    Alert.alert(
      event.title,
      `${event.description}\n\nПочаток: ${new Date(event.startDate).toLocaleString('uk-UA')}\nКінець: ${new Date(event.endDate).toLocaleString('uk-UA')}\nМісце: ${event.location || 'Не вказано'}\nУчасники: ${event.participants.join(', ') || 'Немає учасників'}`,
      [
        { text: 'Закрити', style: 'cancel' },
        { 
          text: 'Видалити', 
          style: 'destructive',
          onPress: () => confirmDeleteEvent(event._id)
        },
        { 
          text: 'Редагувати', 
          onPress: () => console.log('Редагування події')
        },
      ]
    );
  };

  const confirmDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Видалення події',
      'Ви впевнені, що хочете видалити цю подію?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { 
          text: 'Видалити', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(eventId);
              Alert.alert('Успіх', 'Подію успішно видалено');
              // Обновляем список событий после удаления
              fetchedRef.current = false;
              await getEvents();
            } catch (error) {
              console.error('Помилка при видаленні події:', error);
              Alert.alert('Помилка', 'Не вдалося видалити подію');
            }
          }
        },
      ]
    );
  };

  const handleDayPress = (day: DateData) => {
    setSelected(day.dateString);
    // Анимация выбора дня
    Animated.sequence([
      Animated.timing(eventScale, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(eventScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getEventIcon = (event: Event) => {
    // Анализируем название или описание события, чтобы определить иконку
    const title = event.title.toLowerCase();
    const description = event.description.toLowerCase();
    
    if (title.includes('день народження') || description.includes('день народження')) {
      return 'cake-variant';
    } else if (title.includes('кіно') || description.includes('кіно') || 
              title.includes('фільм') || description.includes('фільм')) {
      return 'movie';
    } else if (title.includes('вечеря') || description.includes('вечеря') || 
              title.includes('обід') || description.includes('обід')) {
      return 'food';
    } else if (title.includes('зустріч') || description.includes('зустріч')) {
      return 'account-group';
    } else if (title.includes('спорт') || description.includes('спорт')) {
      return 'run';
    } else {
      return 'calendar';
    }
  };

  const filteredEvents = events
    .filter(event => selected ? formatDate(event.startDate) === selected : true)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
      >
        <Text style={styles.title}>Календар</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            theme={{
              todayTextColor: COLORS.primary,
              arrowColor: COLORS.primary,
              dotColor: COLORS.primary,
              selectedDayBackgroundColor: COLORS.primary,
              calendarBackground: COLORS.white,
              textSectionTitleColor: COLORS.grayDark,
              dayTextColor: COLORS.dark,
              textDisabledColor: COLORS.grayLight,
              monthTextColor: COLORS.dark,
            }}
          />
        </View>

        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>
            {selected
              ? `Події на ${new Date(selected).toLocaleDateString('uk-UA')}`
              : 'Майбутні події'}
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Завантаження подій...</Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={48} color={COLORS.gray} />
              <Text style={styles.emptyText}>
                {selected 
                  ? 'Немає подій на обрану дату' 
                  : 'Немає запланованих подій'}
              </Text>
            </View>
          ) : (
            <Animated.View style={{ transform: [{ scale: eventScale }] }}>
              {filteredEvents.map((event) => (
                <TouchableOpacity
                  key={event._id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event)}
                  activeOpacity={0.7}
                >
                  <View style={styles.eventIcon}>
                    <MaterialCommunityIcons
                      name={getEventIcon(event)}
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text>
  {new Date().toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
</Text>

                    {event.location && (
                      <Text style={styles.eventLocation} numberOfLines={1}>
                        <MaterialCommunityIcons name="map-marker" size={12} color={COLORS.gray} />
                        {' ' + event.location}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
          
          <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
            <TouchableOpacity
              style={styles.addEventButton}
              onPress={handleAddEvent}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
              <Text style={styles.addEventText}>Додати подію</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.centeredModalContainer}>
          <View style={styles.centeredModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Нова подія</Text>
              <TouchableOpacity 
                onPress={() => !isSubmitting && setShowModal(false)}
                style={styles.closeButton}
                disabled={isSubmitting}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.dark} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollViewContent}
              showsVerticalScrollIndicator={false}
            >
              <EventForm 
                onSubmit={handleSubmitEvent}
                onCancel={() => !isSubmitting && setShowModal(false)}
                initialValues={selected ? { 
                  title: '',
                  description: '',
                  startDate: new Date(selected),
                  endDate: new Date(new Date(selected).getTime() + 3600000), // +1 час
                  participants: [],
                } : undefined}
                isSubmitting={isSubmitting}
              />
            </ScrollView>
            {isSubmitting && (
              <View style={styles.overlayLoader}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.overlayLoaderText}>Створення події...</Text>
              </View>
            )}
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
  content: {
    flex: 1,
  },
  calendarContainer: {
    margin: 16,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    ...SHADOWS.medium,
  },
  eventsSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
    marginTop: 16,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
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
  eventTime: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40, 
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginTop: 10,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 30,
    ...SHADOWS.medium,
  },
  addEventText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '500',
    marginLeft: 8,
  },
  centeredModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  centeredModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    width: '95%',
    maxHeight: '90%',
    minHeight: 300,
    ...SHADOWS.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
    marginBottom: 0,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  closeButton: {
    padding: 4,
  },
  modalScrollView: {
    flexGrow: 0,
  },
  modalScrollViewContent: {
    paddingBottom: 20,
  },
  overlayLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
  },
  overlayLoaderText: {
    marginTop: 12,
    color: COLORS.primary,
    fontSize: SIZES.font,
    fontWeight: '500',
  },
});

export default CalendarScreen; 