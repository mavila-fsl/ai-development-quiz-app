import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@ai-quiz-app/shared';
import { createUser as createUserApi, loginUser as loginUserApi, logoutUser as logoutUserApi, getUser } from '../services/api';

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  createUser: (username: string, password: string) => Promise<User>;
  loginUser: (username: string, password: string) => Promise<User>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'ai_quiz_current_user';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = async () => {
      try {
        const storedUserId = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUserId) {
          const userData = await getUser(storedUserId);
          setUserState(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem(USER_STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const setUser = (user: User | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, user.id);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const createUser = async (username: string, password: string): Promise<User> => {
    const newUser = await createUserApi({ username, password });
    setUser(newUser);
    return newUser;
  };

  const loginUser = async (username: string, password: string): Promise<User> => {
    const existingUser = await loginUserApi({ username, password });
    setUser(existingUser);
    return existingUser;
  };

  const logout = async () => {
    try {
      // Call backend to clear authentication cookie
      await logoutUserApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local user state regardless of API call success
      setUser(null);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, setUser, createUser, loginUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
