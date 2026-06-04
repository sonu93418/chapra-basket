import { Stack } from 'expo-router';
import { useEffect } from 'react';
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

SplashScreen.preventAutoHideAsync();

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
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(customer)" />
            <Stack.Screen name="(rider)" />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}
