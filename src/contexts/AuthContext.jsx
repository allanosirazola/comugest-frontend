import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '@/api/auth';
import { tokenStorage } from '@/api/client';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
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
    return () => {
      cancelled = true;
    };
  }, []);

  const applyAuthResponse = (res) => {
    tokenStorage.set(res.accessToken, res.refreshToken);
    setUser(res.user);
  };

  const handleLogin = async (input) => {
    const res = await authApi.login(input);
    applyAuthResponse(res);
    return res.user;
  };

  const handleRegister = async (input) => {
    // Devuelve { requiresEmailVerification, email }, no autentica
    return authApi.register(input);
  };

  const handleLogout = async () => {
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
