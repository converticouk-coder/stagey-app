// ============================================================
// STAGEY MOBILE — THEME CONTEXT
// Dark-default colour scheme with a persisted light/dark toggle.
// Reads/writes STORAGE_KEYS.THEME via AsyncStorage.
// ============================================================
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, type ColorScheme, type ThemeColors } from '../constants/colors';
import { STORAGE_KEYS } from '../constants';

interface ThemeContextValue {
  scheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setScheme: (scheme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark is the default scheme until a stored preference loads.
  const [scheme, setSchemeState] = useState<ColorScheme>('dark');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (stored === 'light' || stored === 'dark') {
          setSchemeState(stored);
        }
      } catch {
        // ignore — fall back to dark default
      }
    })();
  }, []);

  const persist = useCallback(async (next: ColorScheme) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, next);
    } catch {
      // ignore persistence failures
    }
  }, []);

  const setScheme = useCallback(
    (next: ColorScheme) => {
      setSchemeState(next);
      void persist(next);
    },
    [persist],
  );

  const toggleTheme = useCallback(() => {
    setSchemeState((prev) => {
      const next: ColorScheme = prev === 'dark' ? 'light' : 'dark';
      void persist(next);
      return next;
    });
  }, [persist]);

  return (
    <ThemeContext.Provider
      value={{
        scheme,
        colors: Colors[scheme],
        isDark: scheme === 'dark',
        toggleTheme,
        setScheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
