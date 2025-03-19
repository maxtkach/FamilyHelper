import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants';

const ProfileScreen: React.FC = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Анимации
  const avatarScale = useRef(new Animated.Value(1)).current;
  const settingsScale = useRef(new Animated.Value(1)).current;
  const achievementAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  const achievements = [
    {
      id: '1',
      title: 'Супер-помічник',
      description: 'Виконав 100 завдань',
      icon: 'trophy',
      progress: 75,
    },
    {
      id: '2',
      title: 'Економіст',
      description: 'Зекономив 10000 ₴',
      icon: 'currency-usd',
      progress: 60,
    },
    {
      id: '3',
      title: 'Командний гравець',
      description: 'Взяв участь у 50 сімейних подіях',
      icon: 'account-group',
      progress: 90,
    },
  ];

  // Инициализация анимаций для достижений
  achievements.forEach(achievement => {
    if (!achievementAnimations[achievement.id]) {
      achievementAnimations[achievement.id] = new Animated.Value(1);
    }
  });

  const animateAvatar = () => {
    Animated.sequence([
      Animated.timing(avatarScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(avatarScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateAchievement = (id: string) => {
    Animated.sequence([
      Animated.timing(achievementAnimations[id], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(achievementAnimations[id], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAvatarPress = () => {
    animateAvatar();
    Alert.alert('Фото профиля', 'Здесь будет возможность изменить фото профиля');
  };

  const handleAchievementPress = (achievement: typeof achievements[0]) => {
    animateAchievement(achievement.id);
    Alert.alert(achievement.title, achievement.description);
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  return (
    <View style={styles.background}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
      >
        <Text style={styles.title}>Профіль</Text>
      </LinearGradient>

      <ScrollView style={styles.container}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.8}>
            <Animated.View 
              style={[
                styles.avatarContainer,
                { transform: [{ scale: avatarScale }] }
              ]}
            >
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="account" size={60} color={COLORS.primary} />
              </View>
              <View style={styles.editIcon}>
                <MaterialCommunityIcons name="pencil" size={16} color={COLORS.white} />
              </View>
            </Animated.View>
          </TouchableOpacity>
          <Text style={styles.userName}>Іван Іванов</Text>
          <Text style={styles.userRole}>Голова сім'ї</Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>1250</Text>
            <Text style={styles.statLabel}>Бали</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>15</Text>
            <Text style={styles.statLabel}>Завдання</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Події</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Досягнення</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsContainer}
          >
            {achievements.map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                onPress={() => handleAchievementPress(achievement)}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.achievementCard,
                    { transform: [{ scale: achievementAnimations[achievement.id] }] }
                  ]}
                >
                  <MaterialCommunityIcons 
                    name={achievement.icon as any} 
                    size={32} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${achievement.progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{achievement.progress}%</Text>
                </Animated.View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Налаштування</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="bell" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Уведомления</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="theme-light-dark" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Темна тема</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="volume-high" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Звуки</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: COLORS.grayLight, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('Язык', 'Здесь будет выбор языка')}
            >
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="translate" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Язык</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('О приложении', 'Версия 1.0.0')}
            >
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>О приложении</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.white} />
          <Text style={styles.logoutText}>Выйти</Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
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
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  userName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 4,
  },
  userRole: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    margin: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 16,
  },
  achievementsContainer: {
    paddingRight: 16,
  },
  achievementCard: {
    width: 150,
    padding: 16,
    marginRight: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  achievementTitle: {
    fontSize: SIZES.font,
    fontWeight: '500',
    color: COLORS.dark,
    marginVertical: 8,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.grayLight,
    borderRadius: 2,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  settingsContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    ...SHADOWS.light,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: SIZES.medium,
    color: COLORS.dark,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.danger,
    borderRadius: 16,
    ...SHADOWS.medium,
  },
  logoutText: {
    fontSize: SIZES.medium,
    fontWeight: '500',
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default ProfileScreen; 