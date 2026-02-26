import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import {
  OpenSans_400Regular,
  OpenSans_600SemiBold,
  OpenSans_700Bold,
} from '@expo-google-fonts/open-sans';
import { StatusBar } from 'expo-status-bar';
import { useStore } from '@/stores/useStore';
import { supabase } from '@/lib/supabase';
import { registerForPushNotifications, addNotificationResponseListener } from '@/lib/notifications';
import "@/global.css";

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const session = useStore((s) => s.session);
  const isGuest = useStore((s) => s.isGuest);
  const isLoading = useStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAuthed = session !== null || isGuest;

    if (!isAuthed && !inAuthGroup) {
      router.replace('/(auth)/welcome');
    } else if (isAuthed && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, isGuest, isLoading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const initialize = useStore((s) => s.initialize);
  const setSession = useStore((s) => s.setSession);
  const fetchProfile = useStore((s) => s.fetchProfile);

  const [fontsLoaded, fontError] = useFonts({
    Montserrat_700Bold,
    OpenSans_400Regular,
    OpenSans_600SemiBold,
    OpenSans_700Bold,
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    initialize();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session) {
          await fetchProfile();
          // Register for push notifications on login
          registerForPushNotifications(session.user.id).catch(() => {});
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Handle notification taps (deep link to action_url)
  useEffect(() => {
    const cleanup = addNotificationResponseListener((actionUrl) => {
      if (actionUrl) {
        // Navigate to the action URL from the notification
        const router = require('expo-router').router;
        router.push(actionUrl);
      }
    });
    return cleanup;
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="ambassador-agreement"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Ambassador Agreement',
          }}
        />
        <Stack.Screen
          name="alert/[alertId]"
          options={{
            headerShown: true,
            title: 'Action Alert',
          }}
        />
        <Stack.Screen
          name="lobby/[eventId]"
          options={{
            headerShown: true,
            title: 'Lobby Day',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </AuthGuard>
  );
}
