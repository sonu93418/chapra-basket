import { Stack, Redirect } from 'expo-router';
import { useAppSelector } from '../../src/hooks/useAppDispatch';

export default function AdminLayout() {
  const { isAuthenticated, user, isLoading } = useAppSelector(s => s.auth);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role !== 'admin') {
    if (user.role === 'customer') return <Redirect href="/(customer)" />;
    if (user.role === 'rider') return <Redirect href="/(rider)" />;
    if (user.role === 'store_owner') return <Redirect href="/(store)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
