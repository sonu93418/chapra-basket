import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../src/theme';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function RiderLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="history" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🧾" label="History" focused={focused} /> }} />
      <Tabs.Screen name="wallet" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💰" label="Wallet" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(26,18,16,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    height: 72,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.lg, gap: 2, minWidth: 56 },
  tabItemActive: { backgroundColor: 'rgba(255,107,0,0.15)' },
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  tabLabelActive: { color: Colors.primary },
});
