// ============================================================
// STAGEY MOBILE — APP ENTRY
// Provider stack: GestureHandler → SafeArea → QueryClient → Theme → Auth
// Loads DM Sans / Outfit fonts, holds the splash screen until ready.
// ============================================================
import 'react-native-gesture-handler';
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigation from './navigation';
import { FontMap } from './constants/typography';
import { setupNotifications, Notifications } from './services/notifications';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FontMap);

  useEffect(() => {
    void setupNotifications();
    const responseSub = Notifications.addNotificationResponseReceivedListener(() => {
      // A user tapped a notification. Deep-link handling can be added here
      // once a navigation ref is wired up.
    });
    return () => {
      responseSub.remove();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <ThemedStatusBar />
              <View style={{ flex: 1 }}>
                <AppNavigation />
                <Toast />
              </View>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
