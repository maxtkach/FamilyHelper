import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '../constants';
import { useApp } from '../context/AppContext';

import HomeScreen from '../screens/HomeScreen';
import TasksScreen from '../screens/TasksScreen';
import CalendarScreen from '../screens/CalendarScreen';
import FinanceScreen from '../screens/FinanceScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Компонент-обертка для центрирования иконок
interface TabBarIconProps {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
}

const TabBarIcon = ({ name, color }: TabBarIconProps) => {
  return (
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name={name} color={color} size={28} />
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 20 : 16,
          left: 16,
          right: 16,
          backgroundColor: COLORS.white,
          borderRadius: 24,
          height: 64,
          ...SHADOWS.medium,
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          height: 64,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
      }}
    >
      <Tab.Screen
        name="Головна"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Завдання"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="format-list-checks" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Календар"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="calendar" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Бюджет"
        component={FinanceScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="wallet" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Профіль"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="account" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { auth } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!auth.isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  }
});

export default AppNavigator; 