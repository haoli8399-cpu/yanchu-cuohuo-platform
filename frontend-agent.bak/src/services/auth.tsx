import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthState {
  token: string | null;
  phone: string | null;
  name: string | null;
  login: (token: string, phone: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  token: null, phone: null, name: null,
  login: () => {}, logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [phone, setPhone] = useState<string | null>(localStorage.getItem('phone'));
  const [name, setName] = useState<string | null>(localStorage.getItem('name'));

  const login = useCallback((t: string, p: string, n: string) => {
    localStorage.setItem('token', t);
    localStorage.setItem('phone', p);
    localStorage.setItem('name', n);
    setToken(t); setPhone(p); setName(n);
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setToken(null); setPhone(null); setName(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, phone, name, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
