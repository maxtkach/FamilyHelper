import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { useApp } from '../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { UserRole } from '../types';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { register, auth } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('personal');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [purposeStep, setPurposeStep] = useState(false);

  const roles: { value: UserRole; label: string; icon: string; description: string }[] = [
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

  const goToRoleSelection = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    // Базовая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректный email');
      return;
    }

    setPurposeStep(true);
  };

  const handleRegister = async () => {
    try {
      await register(name, email, password, selectedRole);
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  if (purposeStep) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={COLORS.gradient.primary}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setPurposeStep(false)}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Цель использования</Text>
        </LinearGradient>

        <ScrollView style={styles.formContainer}>
          <Text style={styles.purposeQuestion}>Для чего вы хотите использовать приложение?</Text>
          <Text style={styles.purposeSubtitle}>Выберите роль, которая лучше всего соответствует вашим целям:</Text>
          
          <View style={styles.roleContainerVertical}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleButtonLarge,
                  selectedRole === role.value && styles.roleButtonActive,
                ]}
                onPress={() => setSelectedRole(role.value)}
              >
                <View style={styles.roleTitleContainer}>
                  <MaterialCommunityIcons
                    name={role.icon as any}
                    size={28}
                    color={selectedRole === role.value ? COLORS.white : COLORS.primary}
                    style={styles.roleIcon}
                  />
                  <Text
                    style={[
                      styles.roleTextLarge,
                      selectedRole === role.value && styles.roleTextActive,
                    ]}
                  >
                    {role.label}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.roleDescription,
                    selectedRole === role.value && styles.roleDescriptionActive,
                  ]}
                >
                  {role.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={auth.isLoading}
          >
            {auth.isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Зарегистрироваться</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.header}
      >
        <Text style={styles.title}>Регистрация</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Имя</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="account"
              size={24}
              color={COLORS.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Введите ваше имя"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email"
              size={24}
              color={COLORS.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Введите ваш email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Пароль</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock"
              size={24}
              color={COLORS.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Введите пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity
              style={styles.visibilityIcon}
              onPress={togglePasswordVisibility}
            >
              <MaterialCommunityIcons
                name={passwordVisible ? 'eye-off' : 'eye'}
                size={24}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Подтверждение пароля</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-check"
              size={24}
              color={COLORS.gray}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!confirmPasswordVisible}
            />
            <TouchableOpacity
              style={styles.visibilityIcon}
              onPress={toggleConfirmPasswordVisibility}
            >
              <MaterialCommunityIcons
                name={confirmPasswordVisible ? 'eye-off' : 'eye'}
                size={24}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={goToRoleSelection}
        >
          <Text style={styles.buttonText}>Продолжить</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.loginText}>
            Уже есть аккаунт? <Text style={styles.loginTextBold}>Войти</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 40,
    marginBottom: 10,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: SIZES.font,
    fontWeight: '500',
    marginBottom: 8,
    color: COLORS.grayDark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayLight,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    ...SHADOWS.light,
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 10,
    fontSize: SIZES.font,
  },
  visibilityIcon: {
    padding: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    width: '48%',
    ...SHADOWS.light,
  },
  roleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  roleIcon: {
    marginRight: 8,
  },
  roleText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '500',
  },
  roleTextActive: {
    color: COLORS.white,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    ...SHADOWS.medium,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: SIZES.font,
    color: COLORS.grayDark,
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 40 : 20,
    padding: 8,
  },
  purposeQuestion: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  purposeSubtitle: {
    fontSize: SIZES.font,
    color: COLORS.grayDark,
    marginBottom: 24,
    textAlign: 'center',
  },
  roleContainerVertical: {
    marginBottom: 24,
  },
  roleButtonLarge: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.light,
  },
  roleTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleTextLarge: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  roleDescription: {
    fontSize: SIZES.small,
    color: COLORS.grayDark,
    marginLeft: 32,
  },
  roleDescriptionActive: {
    color: COLORS.white,
  },
});

export default RegisterScreen; 