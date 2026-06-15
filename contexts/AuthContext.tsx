// ============================================================
// STAGEY MOBILE — AUTH CONTEXT
// Drop this file into: contexts/AuthContext.tsx
//
// Wrap your root layout with <AuthProvider>
// Use the useAuth() hook anywhere to access user state.
// ============================================================
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import type { User } from '../types';
import { AuthAPI } from '../services/api';
import { registerDeviceToken, unregisterDeviceToken } from '../services/notifications';

// ── Types ─────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMinor: boolean;
  isGuardianPending: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  profileTypes?: string[];
  dateOfBirth?: string;
  guardianEmail?: string;
}

// ── Context ───────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Helpers ───────────────────────────────────────────────────

function calculateIsMinor(dateOfBirth: string | null | undefined): boolean {
  if (!dateOfBirth) return false;
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 18;
}

// ── Provider ──────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);

  const fetchUser = useCallback(async () => {
    try {
      const fetchedUser = await AuthAPI.getUser();
      setUser(fetchedUser);
      // Restored session — make sure this device is registered for push.
      void registerDeviceToken();
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchUser();
    }
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = await AuthAPI.login(email, password);
    setUser(loggedInUser);
    void registerDeviceToken();
  }, []);

  const logout = useCallback(async () => {
    // Detach this device from the account first so it stops getting pushes.
    await unregisterDeviceToken();
    await AuthAPI.logout();
    setUser(null);
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const newUser = await AuthAPI.register(data);
    setUser(newUser);
    void registerDeviceToken();
  }, []);

  const refreshUser = useCallback(async () => {
    const refreshedUser = await AuthAPI.getUser();
    setUser(refreshedUser);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'platform_admin';
  const isMinor = calculateIsMinor(user?.dateOfBirth);
  const isGuardianPending = user?.guardianConsentStatus === 'pending';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        isMinor,
        isGuardianPending,
        login,
        logout,
        register,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ── Higher-order component for protected screens ───────────────

/**
 * Wraps a screen component to require authentication.
 * If not authenticated, renders the fallback component (or a default prompt).
 *
 * Usage:
 *   export default withAuth(MyScreen);
 *   export default withAuth(MyScreen, <SignInPrompt />);
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
): React.ComponentType<P> {
  return function AuthGuard(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return null; // or a loading spinner
    }

    if (!isAuthenticated) {
      return fallback ? <>{fallback}</> : <DefaultSignInPrompt />;
    }

    return <Component {...props} />;
  };
}

// ── Default sign-in prompt (import and replace with your own) ──

function DefaultSignInPrompt() {
  // Import your navigation hook and replace this with your actual UI
  return null;
}
