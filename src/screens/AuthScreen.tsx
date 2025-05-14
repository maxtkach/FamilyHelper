import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import LoginForm from '../components/forms/LoginForm';
import RegisterForm from '../components/forms/RegisterForm';
import { COLORS } from '../constants';

const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { auth } = useApp();
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    // Если пользователь аутентифицирован, перенаправляем на главную страницу
    if (auth.isAuthenticated) {
      navigation.replace('MainTabs');
    }
  }, [auth.isAuthenticated, navigation]);

  const handleAuthSuccess = () => {
    // Нет необходимости в действиях, useEffect выполнит перенаправление
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={COLORS.gradient.primary}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.content}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollView} 
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              {showLogin ? (
                <LoginForm
                  onSuccess={handleAuthSuccess}
                  onRegisterClick={() => setShowLogin(false)}
                />
              ) : (
                <RegisterForm
                  onSuccess={handleAuthSuccess}
                  onLoginClick={() => setShowLogin(true)}
                />
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  formContainer: {
    width: '90%',
    maxWidth: 400,
  },
});

export default AuthScreen; 