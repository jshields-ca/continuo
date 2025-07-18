'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ME_QUERY } from '@/lib/graphql/queries';
import { LOGIN_MUTATION, REGISTER_MUTATION, LOGOUT_MUTATION } from '@/lib/graphql/mutations';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  status: string;
  avatar?: string;
  phone?: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    slug: string;
    subscriptionPlan: string;
    status: string;
  };
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterInput) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

interface RegisterInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  companyName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data, loading, refetch } = useQuery(ME_QUERY, {
    skip: !isInitialized,
    errorPolicy: 'ignore'
  });

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [registerMutation] = useMutation(REGISTER_MUTATION);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsInitialized(true);
    } else {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    } else if (!loading && isInitialized) {
      setUser(null);
    }
  }, [data, loading, isInitialized]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: {
          input: { email, password }
        }
      });

      if (data?.login?.token) {
        localStorage.setItem('authToken', data.login.token);
        setUser(data.login.user);
        return { success: true };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.graphQLErrors?.[0]?.message || error.message || 'Login failed' 
      };
    }
  };

  const register = async (userData: RegisterInput) => {
    try {
      const { data } = await registerMutation({
        variables: {
          input: userData
        }
      });

      if (data?.register?.token) {
        localStorage.setItem('authToken', data.register.token);
        setUser(data.register.user);
        return { success: true };
      }

      return { success: false, error: 'Invalid response from server' };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.graphQLErrors?.[0]?.message || error.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  };

  const refetchUser = () => {
    refetch();
  };

  const value = {
    user,
    loading: loading && isInitialized,
    login,
    register,
    logout,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth() {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      window.location.href = '/auth/login';
    }
  }, [auth.loading, auth.user]);

  return auth;
}