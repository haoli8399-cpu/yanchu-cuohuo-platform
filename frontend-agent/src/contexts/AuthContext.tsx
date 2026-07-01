import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { UserInfo, LoginResponse } from '../types';
import * as api from '../services/apiClient';

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (phone: string, code: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  // 启动时尝试从 localStorage 恢复
  useEffect(() => {
    const savedToken = api.loadToken();
    if (savedToken) {
      setState((prev) => ({ ...prev, token: savedToken, loading: false }));
    } else {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const login = useCallback(async (phone: string, code: string) => {
    const data = await api.loginByPhone(phone, code) as LoginResponse;
    api.setToken(data.token);
    setState({ user: data.user, token: data.token, loading: false });
  }, []);

  const logout = useCallback(() => {
    api.clearToken();
    setState({ user: null, token: null, loading: false });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    isLoggedIn: !!state.token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
