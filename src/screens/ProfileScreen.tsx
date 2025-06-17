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
  TextInput,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen: React.FC = () => {
  const { auth, logout, updateUserProfile } = useApp();
  const user = auth.user;
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(user?.role || 'personal');
  
  // Новые состояния для изменения никнейма и аватарки
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

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
    Alert.alert(
      'Фото профілю', 
      'Оберіть дію',
      [
        { text: 'Скасувати', style: 'cancel' },
        { text: 'Зробити фото', onPress: takePicture },
        { text: 'Вибрати з галереї', onPress: pickImage },
      ]
    );
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Потрібен дозвіл', 'Надайте доступ до фотогалереї для вибору фото');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri);
        // Здесь должен быть код для отправки фото на сервер
        // uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Помилка при виборі зображення:', error);
      Alert.alert('Помилка', 'Не вдалося вибрати зображення');
    }
  };

  const takePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Потрібен дозвіл', 'Надайте доступ до камери для створення фото');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setAvatarUri(result.assets[0].uri);
        // Здесь должен быть код для отправки фото на сервер
        // uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Помилка при створенні фото:', error);
      Alert.alert('Помилка', 'Не вдалося створити фото');
    }
  };

  const handleNameChange = () => {
    setShowNameModal(true);
    setNewName(user?.name || '');
  };

  const saveNewName = async () => {
    if (!newName.trim()) {
      Alert.alert('Помилка', 'Ім\'я не може бути порожнім');
      return;
    }

    try {
      await updateUserProfile({ name: newName.trim() });
      setShowNameModal(false);
      Alert.alert('Успіх', 'Ім\'я успішно оновлено');
    } catch (error) {
      console.error('Помилка при оновленні імені:', error);
      Alert.alert('Помилка', 'Не вдалося оновити ім\'я');
    }
  };

  const handleAchievementPress = (achievement: typeof achievements[0]) => {
    animateAchievement(achievement.id);
    Alert.alert(achievement.title, achievement.description);
  };

  const handleLogout = () => {
    Alert.alert(
      'Вихід',
      'Ви впевнені, що хочете вийти?',
      [
        { text: 'Скасувати', style: 'cancel' },
        { 
          text: 'Вийти', 
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
        return 'Батько/Мати';
      case 'child':
        return 'Дитина';
      case 'personal':
        return 'Особисте використання';
      case 'boyfriend':
        return 'Хлопець';
      case 'girlfriend':
        return 'Дівчина';
      default:
        return 'Користувач';
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
      label: 'Батько/Мати', 
      icon: 'account-child',
      description: 'Для батьків, які хочуть організувати сімейні завдання та витрати'
    },
    { 
      value: 'child', 
      label: 'Дитина', 
      icon: 'human-child',
      description: 'Для дітей, які хочуть брати участь у сімейних завданнях і заробляти бали'
    },
    { 
      value: 'personal', 
      label: 'Особисте використання', 
      icon: 'account',
      description: 'Для індивідуального планування та управління особистими завданнями'
    },
    { 
      value: 'boyfriend', 
      label: 'Хлопець', 
      icon: 'human-male',
      description: 'Для використання додатку в парі (чоловіча частина)'
    },
    { 
      value: 'girlfriend', 
      label: 'Дівчина', 
      icon: 'human-female',
      description: 'Для використання додатку в парі (жіноча частина)'
    },
  ];

  // Функция изменения роли
  const handleRoleChange = async (role: string) => {
    try {
      if (role === user?.role) {
        Alert.alert('Інформація', 'Обрана поточна роль. Зміни не потрібні.');
        setShowRoleModal(false);
        return;
      }
      
      setSelectedRole(role);
      console.log('Змінюємо роль на:', role, 'поточна роль:', user?.role);
      
      // Запрашиваем подтверждение
      Alert.alert(
        'Зміна ролі',
        `Ви впевнені, що хочете змінити свою роль з "${getRoleText(user?.role || '')}" на "${getRoleText(role)}"?`,
        [
          {
            text: 'Скасувати',
            style: 'cancel'
          },
          {
            text: 'Змінити',
            onPress: async () => {
              try {
                const result = await updateUserProfile({ role: role as UserRole });
                console.log('Результат оновлення профілю:', result);
              } catch (error) {
                console.error('Помилка при зміні ролі:', error);
                Alert.alert('Помилка', 'Не вдалося змінити роль. Будь ласка, спробуйте знову.');
              } finally {
                setShowRoleModal(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Помилка при підготовці зміни ролі:', error);
      Alert.alert('Помилка', 'Сталася помилка. Будь ласка, спробуйте знову.');
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
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <MaterialCommunityIcons name="account" size={60} color={COLORS.primary} />
                )}
              </View>
              <View style={styles.editIcon}>
                <MaterialCommunityIcons name="camera" size={16} color={COLORS.white} />
              </View>
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNameChange}>
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{user?.name || 'Користувач'}</Text>
              <MaterialCommunityIcons name="pencil" size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
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
                <Text style={styles.settingText}>Сповіщення</Text>
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
                <Text style={styles.settingText}>Змінити роль</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('Мова', 'Тут буде вибір мови')}
            >
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="translate" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Мова</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.gray} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => Alert.alert('Про додаток', 'Версія 1.0.0')}
            >
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Про додаток</Text>
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
        <Text style={styles.logoutButtonText}>Вийти</Text>
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
              <Text style={styles.modalTitle}>Змінити роль</Text>
              <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.grayDark} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalDescription}>
                Оберіть роль, яка найкраще відповідає вашим цілям використання додатку:
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
                <Text style={styles.saveButtonText}>Зберегти</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Модальное окно для изменения имени */}
      <Modal
        visible={showNameModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, styles.nameModalContainer]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Змінити ім'я</Text>
              <TouchableOpacity onPress={() => setShowNameModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={COLORS.grayDark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.nameInputContainer}>
              <Text style={styles.nameInputLabel}>Введіть нове ім'я:</Text>
              <TextInput
                style={styles.nameInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Ваше ім'я"
                autoFocus
                maxLength={30}
              />
              
              <View style={styles.nameModalButtons}>
                <TouchableOpacity 
                  style={[styles.nameModalButton, styles.nameModalCancelButton]}
                  onPress={() => setShowNameModal(false)}
                >
                  <Text style={styles.nameModalCancelText}>Скасувати</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.nameModalButton, styles.nameModalSaveButton]}
                  onPress={saveNewName}
                >
                  <Text style={styles.nameModalSaveText}>Зберегти</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  userContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginRight: 8,
  },
  userRole: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  roleText: {
    color: COLORS.white,
    marginLeft: 5,
    fontSize: SIZES.small,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.light,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.dark,
  },
  achievementsContainer: {
    paddingBottom: 10,
  },
  achievementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 150,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  achievementTitle: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.light,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
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
    borderRadius: 15,
    ...SHADOWS.light,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: SIZES.font,
    color: COLORS.dark,
    marginLeft: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.danger,
    padding: 15,
    borderRadius: 10,
    margin: 15,
    ...SHADOWS.medium,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    ...SHADOWS.medium,
  },
  nameModalContainer: {
    height: 'auto',
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  modalContent: {
    padding: 15,
  },
  modalDescription: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: 15,
  },
  roleOption: {
    backgroundColor: COLORS.light,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  roleOptionSelected: {
    backgroundColor: COLORS.primary,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  roleOptionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginLeft: 10,
  },
  roleOptionTitleSelected: {
    color: COLORS.white,
  },
  roleOptionDescription: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  roleOptionDescriptionSelected: {
    color: COLORS.white,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  nameInputContainer: {
    padding: 15,
  },
  nameInputLabel: {
    fontSize: SIZES.font,
    color: COLORS.dark,
    marginBottom: 10,
  },
  nameInput: {
    backgroundColor: COLORS.light,
    borderRadius: 10,
    padding: 15,
    fontSize: SIZES.font,
    marginBottom: 20,
  },
  nameModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameModalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nameModalCancelButton: {
    backgroundColor: COLORS.light,
    marginRight: 10,
  },
  nameModalSaveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: 10,
  },
  nameModalCancelText: {
    color: COLORS.dark,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  nameModalSaveText: {
    color: COLORS.white,
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 