import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants';

const CalendarScreen: React.FC = () => {
  const [selected, setSelected] = useState('');
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const eventScale = useRef(new Animated.Value(1)).current;

  // Пример событий
  const events = [
    {
      id: '1',
      title: 'День народження мами',
      date: '2024-03-15',
      time: '18:00',
      type: 'birthday',
      participants: ['Мама', 'Тато', 'Діти'],
    },
    {
      id: '2',
      title: 'Похід у кіно',
      date: '2024-03-20',
      time: '16:30',
      type: 'entertainment',
      participants: ['Вся сім\'я'],
    },
    {
      id: '3',
      title: 'Сімейна вечеря',
      date: '2024-03-25',
      time: '19:00',
      type: 'dinner',
      participants: ['Вся сім\'я', 'Бабуся'],
    },
  ];

  const markedDates = events.reduce((acc, event) => {
    acc[event.date] = {
      marked: true,
      dotColor: COLORS.primary,
      selected: selected === event.date,
      selectedColor: COLORS.primary,
    };
    return acc;
  }, {} as any);

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
    Alert.alert(
      'Нова подія',
      'Тут буде форма створення нової події',
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Створити', onPress: () => console.log('Create event') },
      ]
    );
  };

  const handleEventPress = (event: typeof events[0]) => {
    animateEvent();
    Alert.alert(
      event.title,
      `Час: ${event.time}\nУчасники: ${event.participants.join(', ')}`,
      [
        { text: 'Закрити', style: 'cancel' },
        { text: 'Редагувати', onPress: () => console.log('Edit event') },
      ]
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return 'cake-variant';
      case 'entertainment':
        return 'movie';
      case 'dinner':
        return 'food';
      default:
        return 'calendar';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
      >
        <Text style={styles.title}>Календар</Text>
        <Animated.View style={{ transform: [{ scale: addButtonScale }] }}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddEvent}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="plus" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day: DateData) => setSelected(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: COLORS.dark,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.white,
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.dark,
              textDisabledColor: COLORS.grayLight,
              dotColor: COLORS.primary,
              selectedDotColor: COLORS.white,
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.dark,
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>
            Майбутні події
          </Text>
          {events.map((event) => (
            <TouchableOpacity
              key={event.id}
              onPress={() => handleEventPress(event)}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.eventCard, { transform: [{ scale: eventScale }] }]}>
                <View style={styles.eventIcon}>
                  <MaterialCommunityIcons
                    name={getEventIcon(event.type)}
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventTime}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color={COLORS.gray} />
                    {' '}{event.time}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={COLORS.gray}
                />
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  },
  calendarContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    ...SHADOWS.medium,
  },
  eventsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
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
  },
});

export default CalendarScreen; 