import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="otp-verify" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="user-type" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
