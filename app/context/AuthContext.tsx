"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  refetchUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // If NextAuth session exists, use it
      if (session?.user) {
        const authUser: AuthUser = {
          id: (session.user as any).id || '',
          email: session.user.email || '',
          name: session.user.name || '',
          role: (session.user as any).role || 'user',
        };

        // Note: We don't fetch Appwrite user data client-side because NextAuth
        // uses JWT sessions, not Appwrite sessions. All user data comes from NextAuth.
        // If you need Appwrite user data, fetch it server-side in API routes.

        setUser(authUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true);
      return;
    }

    fetchUserData();
  }, [session, status]);

  const value: AuthContextType = {
    user,
    isLoading: status === 'loading' || isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    refetchUser: fetchUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
