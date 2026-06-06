import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../src/theme';
import { House, ReceiptText, Wallet, User } from '../../src/components/ui/Icon';
import type { LucideIcon } from 'lucide-react-native';

interface RiderTabIconProps {
  Icon: LucideIcon;
  label: string;
  focused: boolean;
}

function RiderTabIcon({ Icon, label, focused }: RiderTabIconProps) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Icon
        size={22}
        color={focused ? Colors.primary : 'rgba(255,255,255,0.45)'}
        strokeWidth={focused ? 2.5 : 1.8}
      />
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
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <RiderTabIcon Icon={House} label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarIcon: ({ focused }) => <RiderTabIcon Icon={ReceiptText} label="History" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarIcon: ({ focused }) => <RiderTabIcon Icon={Wallet} label="Wallet" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <RiderTabIcon Icon={User} label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(20,14,12,0.97)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    height: 72,
    paddingBottom: 8,
    paddingTop: 4,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  tabItem: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.lg, gap: 3, minWidth: 56,
  },
  tabItemActive: { backgroundColor: 'rgba(255,107,0,0.14)' },
  tabLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 10, color: 'rgba(255,255,255,0.4)' },
  tabLabelActive: { color: Colors.primary },
});
