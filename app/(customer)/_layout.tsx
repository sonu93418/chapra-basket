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

export default function CustomerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📦" label="Categories" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" label="Search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Orders" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    height: 72,
    paddingBottom: 8,
    paddingTop: 4,
    elevation: 20,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
    gap: 2,
    minWidth: 56,
  },
  tabItemActive: {
    backgroundColor: Colors.primaryContainer,
  },
  tabEmoji: { fontSize: 22 },
  tabLabel: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 10,
    color: Colors.textMuted,
  },
  tabLabelActive: { color: Colors.primary },
});
