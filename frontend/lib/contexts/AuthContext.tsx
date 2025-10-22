"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Company, UserSession } from "@/types";
import { authApi } from "@/lib/api";

interface AuthState {
  user: User | null;
  company: Company | null;
  session: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    company: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const clearAuth = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setState({
      user: null,
      company: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshTokenStored = localStorage.getItem("refreshToken");
      
      if (accessToken && refreshTokenStored) {
        // Try to get user profile with current token
        try {
          const profile = await authApi.getProfile();
          
          setState({
            user: profile.user || profile,
            company: null,
            session: null,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch {
          // Token might be expired, clear auth
          clearAuth();
        }
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
    }
  }, [clearAuth]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authApi.login({ email, password });
      
      console.log('✅ Login response:', response);
      
      // Backend returns: { user: {...}, accessToken: "...", refreshToken: "..." }
      // AND sets HTTP-only cookies automatically
      if (!response || !response.accessToken) {
        console.error('❌ Invalid response structure:', response);
        throw new Error('Invalid login response from server');
      }
      
      // Store tokens in localStorage as backup (cookies are primary)
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      
      console.log('✅ Tokens stored in localStorage (backup)');
      console.log('🍪 Cookies set by server (primary)');
      
      setState({
        user: response.user,
        company: null,
        session: null,
        isLoading: false,
        isAuthenticated: true,
      });
      
      console.log('✅ Login successful');
    } catch (error) {
      console.error('❌ Login error:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      console.log('🍪 Cookies cleared by server');
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuth();
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenStored = localStorage.getItem("refreshToken");
      if (!refreshTokenStored) {
        throw new Error("No refresh token available");
      }
      
      const response = await authApi.refreshToken();
      
      // Backend returns: { accessToken: "...", refreshToken: "..." }
      if (!response || !response.accessToken) {
        throw new Error('Invalid refresh response from server');
      }
      
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      
      // Get fresh user profile
      const profile = await authApi.getProfile();
      
      setState({
        user: profile.user || profile,
        company: null,
        session: null,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    refreshToken,
    clearAuth,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protecting routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      // Redirect to login will be handled by middleware
      return null;
    }
    
    return <Component {...props} />;
  };
}