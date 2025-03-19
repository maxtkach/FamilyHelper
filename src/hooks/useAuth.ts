import { useState, useCallback } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Здесь будет логика аутентификации
      const mockUser: User = {
        id: '1',
        name: 'Иван Иванов',
        role: 'Глава семьи',
        points: 150,
        avatar: 'https://via.placeholder.com/150',
      };
      setUser(mockUser);
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      try {
        // Здесь будет логика регистрации
        const mockUser: User = {
          id: '1',
          name,
          role: 'Глава семьи',
          points: 0,
          avatar: 'https://via.placeholder.com/150',
        };
        setUser(mockUser);
      } catch (error) {
        console.error('Ошибка регистрации:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Здесь будет логика выхода
      setUser(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Здесь будет логика обновления профиля
        setUser((prevUser) => (prevUser ? { ...prevUser, ...updates } : null));
      } catch (error) {
        console.error('Ошибка обновления профиля:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };
}; 