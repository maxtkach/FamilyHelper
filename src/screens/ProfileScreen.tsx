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
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

const ProfileScreen: React.FC = () => {
  const { auth, logout, updateUserProfile } = useApp();
  const user = auth.user;
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || 'personal');

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
        { 
          text: 'Выйти', 
          style: 'destructive', 
          onPress: () => logout() 
        },
      ]
    );
  };

  // Преобразование роли в понятный текст
  const getRoleText = (role: string) => {
    switch (role) {
      case 'parent':
        return 'Родитель';
      case 'child':
        return 'Ребенок';
      case 'personal':
        return 'Личное использование';
      case 'boyfriend':
        return 'Парень';
      case 'girlfriend':
        return 'Девушка';
      default:
        return 'Пользователь';
    }
  };

  // Получение иконки для роли
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'parent':
        return 'account-child';
      case 'child':
        return 'human-child';
      case 'boyfriend':
        return 'human-male';
      case 'girlfriend':
        return 'human-female';
      case 'personal':
        return 'account';
      default:
        return 'account';
    }
  };

  // Доступные роли
  const roles: { value: string; label: string; icon: string; description: string }[] = [
    { 
      value: 'parent', 
      label: 'Родитель', 
      icon: 'account-child',
      description: 'Для родителей, которые хотят организовать семейные задачи и расходы'
    },
    { 
      value: 'child', 
      label: 'Ребенок', 
      icon: 'human-child',
      description: 'Для детей, которые хотят участвовать в семейных задачах и зарабатывать баллы'
    },
    { 
      value: 'personal', 
      label: 'Личное использование', 
      icon: 'account',
      description: 'Для индивидуального планирования и управления личными задачами'
    },
    { 
      value: 'boyfriend', 
      label: 'Парень', 
      icon: 'human-male',
      description: 'Для использования приложения в паре (мужская часть)'
    },
    { 
      value: 'girlfriend', 
      label: 'Девушка', 
      icon: 'human-female',
      description: 'Для использования приложения в паре (женская часть)'
    },
  ];

  // Функция изменения роли
  const handleRoleChange = async (role: string) => {
    try {
      if (role === user?.role) {
        Alert.alert('Информация', 'Выбрана текущая роль. Изменения не требуются.');
        setShowRoleModal(false);
        return;
      }
      
      setSelectedRole(role);
      console.log('Меняем роль на:', role, 'текущая роль:', user?.role);
      
      // Запрашиваем подтверждение
      Alert.alert(
        'Изменение роли',
        `Вы уверены, что хотите изменить свою роль с "${getRoleText(user?.role || '')}" на "${getRoleText(role)}"?`,
        [
          {
            text: 'Отмена',
            style: 'cancel'
          },
          {
            text: 'Изменить',
            onPress: async () => {
              try {
                const result = await updateUserProfile({ role: role as UserRole });
                console.log('Результат обновления профиля:', result);
              } catch (error) {
                console.error('Ошибка при изменении роли:', error);
                Alert.alert('Ошибка', 'Не удалось изменить роль. Пожалуйста, попробуйте снова.');
              } finally {
                setShowRoleModal(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Ошибка при подготовке изменения роли:', error);
      Alert.alert('Ошибка', 'Произошла ошибка. Пожалуйста, попробуйте снова.');
    }
  };

  return (
    <View style={styles.background}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
      >
        <View style={styles.userContainer}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons name="account-circle" size={80} color={COLORS.white} />
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <View style={styles.roleContainer}>
            <MaterialCommunityIcons 
              name={getRoleIcon(user?.role || '')} 
              size={16} 
              color={COLORS.white} 
            />
            <Text style={styles.roleText}>{getRoleText(user?.role || '')}</Text>
          </View>
        </View>
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
          <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
          <Text style={styles.userRole}>{getRoleText(user?.role || '')}</Text>
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
              onPress={() => setShowRoleModal(true)}
            >
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons 
                  name={getRoleIcon(user?.role || '')} 
                  size={24} 
                  color={COLORS.primary} 
                />
                <Text style={styles.settingText}>Изменить роль</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
            </TouchableOpacity>
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
      </ScrollView>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={20} color={COLORS.white} />
        <Text style={styles.logoutButtonText}>Выйти</Text>
      </TouchableOpacity>

      {/* Модальное окно для выбора роли */}
      <Modal
        visible={showRoleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Изменить роль</Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.grayDark} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Выберите роль, которая лучше всего соответствует вашим целям использования приложения:
              </Text>
              
              {roles.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    selectedRole === role.value && styles.roleOptionSelected
                  ]}
                  onPress={() => setSelectedRole(role.value)}
                >
                  <View style={styles.roleHeader}>
                    <MaterialCommunityIcons
                      name={role.icon as any}
                      size={28}
                      color={selectedRole === role.value ? COLORS.white : COLORS.primary}
                    />
                    <Text
                      style={[
                        styles.roleOptionTitle,
                        selectedRole === role.value && styles.roleOptionTitleSelected
                      ]}
                    >
                      {role.label}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.roleOptionDescription,
                      selectedRole === role.value && styles.roleOptionDescriptionSelected
                    ]}
                  >
                    {role.description}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleRoleChange(selectedRole)}
              >
                <Text style={styles.saveButtonText}>Сохранить</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    backgroundColor: COLORS.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  logoutButtonText: {
    marginLeft: 8,
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  roleText: {
    fontSize: SIZES.font,
    color: COLORS.white,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  modalContent: {
    padding: 16,
  },
  modalDescription: {
    fontSize: SIZES.font,
    color: COLORS.grayDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  roleOption: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  roleOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleOptionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 12,
  },
  roleOptionTitleSelected: {
    color: COLORS.white,
  },
  roleOptionDescription: {
    fontSize: SIZES.small,
    color: COLORS.grayDark,
    marginLeft: 40,
  },
  roleOptionDescriptionSelected: {
    color: COLORS.light,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 