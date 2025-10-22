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

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshTokenStored = localStorage.getItem("refreshToken");
      
      if (accessToken && refreshTokenStored) {
        // Try to get user profile with current token
        try {
          const profile = await authApi.getProfile();
          
          // Type assertion since we know the structure from our API
          const profileData = profile.data as {
            user: User;
            company: Company;
            session: UserSession;
            permissions: string[];
          };
          
          setState({
            user: profileData.user,
            company: profileData.company,
            session: profileData.session,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch {
          // Token might be expired, try to refresh
          try {
            await refreshToken();
          } catch {
            // Refresh failed, clear auth
            clearAuth();
          }
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
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authApi.login({ email, password });
      
      // Type assertion since we know the structure
      const loginData = response.data as {
        accessToken: string;
        refreshToken: string;
        user: User;
        company: Company;
        session: UserSession;
      };
      
      // Store tokens
      localStorage.setItem("accessToken", loginData.accessToken);
      localStorage.setItem("refreshToken", loginData.refreshToken);
      
      setState({
        user: loginData.user,
        company: loginData.company,
        session: loginData.session,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
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
      
      // Type assertion since we know the structure
      const refreshData = response.data as {
        accessToken: string;
        refreshToken: string;
        user: User;
        company: Company;
        session: UserSession;
      };
      
      localStorage.setItem("accessToken", refreshData.accessToken);
      localStorage.setItem("refreshToken", refreshData.refreshToken);
      
      setState({
        user: refreshData.user,
        company: refreshData.company,
        session: refreshData.session,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setState({
      user: null,
      company: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
    });
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