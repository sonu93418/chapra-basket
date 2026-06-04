import { Redirect } from 'expo-router';

// Default redirect to auth flow
export default function Index() {
  return <Redirect href="/(auth)/splash" />;
}
