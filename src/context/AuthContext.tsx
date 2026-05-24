"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useConvex } from 'convex/react';
import { api } from '@cvx/_generated/api';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNo?: string;
  role: string;
  profileImageUrl?: string;
  location?: string;
}

interface SignupData {
  email: string;
  name: string;
  password: string;
  role: string;
  phoneNo?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_MAP: Record<string, 'buyer' | 'vendor' | 'mentor' | 'super_admin'> = {
  Customer: 'buyer',
  Vendor: 'vendor',
  Mentor: 'mentor',
  buyer: 'buyer',
  vendor: 'vendor',
  mentor: 'mentor',
  super_admin: 'super_admin',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const convex = useConvex();
  const [userId, setUserId] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('userId') : null
  );

  const userData = useQuery(api.auth.getMe, userId ? { id: userId } : 'skip');
  const loading = userId !== null && userData === undefined;

  useEffect(() => {
    if (userData === null && userId !== null) {
      localStorage.removeItem('userId');
      setUserId(null);
    }
  }, [userData, userId]);

  const login = async (email: string, password: string) => {
    const result = await convex.mutation(api.auth.login, { email, password });
    localStorage.setItem('userId', result.id);
    setUserId(result.id);
  };

  const signup = async (data: SignupData) => {
    const role = ROLE_MAP[data.role] ?? 'buyer';
    const result = await convex.mutation(api.auth.signup, {
      email: data.email,
      name: data.name,
      password: data.password,
      role,
      phoneNo: data.phoneNo,
      location: data.location,
    });
    localStorage.setItem('userId', result.id);
    setUserId(result.id);
  };

  const logout = () => {
    localStorage.removeItem('userId');
    setUserId(null);
  };

  const user: User | null = userData
    ? {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phoneNo: userData.phoneNo,
        role: userData.role,
        profileImageUrl: userData.profileImageUrl,
        location: userData.location,
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
