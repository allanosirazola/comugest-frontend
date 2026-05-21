import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '@/api/auth';
import { tokenStorage } from '@/api/client';
import type { AuthResponse, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: authApi.LoginInput) => Promise<void>;
  register: (input: authApi.RegisterInput) => Promise<{ requiresEmailVerification: true; email: string }>;
  applyAuthResponse: (res: AuthResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap(): Promise<void> {
      if (!tokenStorage.getAccess()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authApi.getMe();
        if (!cancelled) setUser(me);
      } catch {
        tokenStorage.clear();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void bootstrap();
    return (): void => {
      cancelled = true;
    };
  }, []);

  const applyAuthResponse = (res: AuthResponse): void => {
    tokenStorage.set(res.accessToken, res.refreshToken);
    setUser(res.user);
  };

  const handleLogin = async (input: authApi.LoginInput): Promise<void> => {
    const res = await authApi.login(input);
    applyAuthResponse(res);
  };

  const handleRegister = async (
    input: authApi.RegisterInput
  ): Promise<{ requiresEmailVerification: true; email: string }> => {
    // Devuelve { requiresEmailVerification, email }, no autentica
    return authApi.register(input);
  };

  const handleLogout = async (): Promise<void> => {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {
      // logout robusto
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login: handleLogin,
        register: handleRegister,
        applyAuthResponse,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
