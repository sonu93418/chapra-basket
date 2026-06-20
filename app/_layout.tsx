import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  useFonts,
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
  BeVietnamPro_800ExtraBold,
} from '@expo-google-fonts/be-vietnam-pro';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../src/store';
import { useSocket } from '../src/hooks/useSocket';
import { useAppDispatch } from '../src/hooks/useAppDispatch';
import { loadSession } from '../src/utils/storage';
import { loginSuccess } from '../src/features/auth/authSlice';

SplashScreen.preventAutoHideAsync();

function RealtimeBridge() {
  useSocket();
  return null;
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const session = await loadSession();
        if (session) {
          dispatch(loginSuccess(session));
        }
      } catch (err) {
        console.warn('[Hydration] Failed to load persisted session:', err);
      } finally {
        setHydrated(true);
      }
    };
    hydrate();
  }, [dispatch]);

  if (!hydrated) {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'BeVietnamPro-Regular': BeVietnamPro_400Regular,
    'BeVietnamPro-Medium': BeVietnamPro_500Medium,
    'BeVietnamPro-SemiBold': BeVietnamPro_600SemiBold,
    'BeVietnamPro-Bold': BeVietnamPro_700Bold,
    'BeVietnamPro-ExtraBold': BeVietnamPro_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <Provider store={store}>
      {/* @ts-ignore — style prop exists at runtime but was removed from GestureHandlerRootViewProps types */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppInitializer>
            <RealtimeBridge />
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(customer)" />
              <Stack.Screen name="(rider)" />
              <Stack.Screen name="(admin)" />
              <Stack.Screen name="(store)" />
            </Stack>
          </AppInitializer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
