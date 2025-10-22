"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { User, Company, UserSession } from "@/types";
import { authApi } from "@/lib/api";
import { RotateSpinner } from "@/components/ui/loading";

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
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const refreshTokenStored = localStorage.getItem("refreshToken");
        
        console.log('🔄 Initializing auth state...', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshTokenStored });
        
        if (accessToken && refreshTokenStored) {
          // Try to get user profile with current token
          try {
            console.log('📡 Fetching user profile...');
            const profile = await authApi.getProfile();
            
            console.log('✅ Profile loaded successfully:', profile);
            
            setState({
              user: profile.user || profile,
              company: null,
              session: null,
              isLoading: false,
              isAuthenticated: true,
            });
          } catch (error) {
            // Token might be expired, clear auth
            console.error('❌ Failed to load profile:', error);
            clearAuth();
          }
        } else {
          console.log('ℹ️ No tokens found, user not authenticated');
          setState(prev => ({
            ...prev,
            isLoading: false,
            isAuthenticated: false,
          }));
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          isAuthenticated: false,
        }));
      }
    };

    initializeAuth();
  }, [clearAuth]);

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
      // Send logout request to invalidate session on server
      // Backend will clear HTTP-only cookies and invalidate session
      await authApi.logout();
      
      console.log('🍪 Cookies cleared by server');
      console.log('🗑️ Session invalidated on server');
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Continue with logout even if server request fails
    } finally {
      // Always clear local storage and state, even if server request fails
      clearAuth();
      console.log('✅ Local auth state cleared');
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
    const router = useRouter();
    
    React.useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        console.log('🔒 Not authenticated, redirecting to login...');
        router.push('/auth/login');
      }
    }, [isLoading, isAuthenticated, router]);
    
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <RotateSpinner size={60} color="#eab308" className="mx-auto mb-4" />
            <p className="text-slate-600 text-sm font-medium">Cargando...</p>
          </div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      // Show nothing while redirecting
      return null;
    }
    
    return <Component {...props} />;
  };
}