import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../src/theme';
import { useAppSelector } from '../../src/hooks/useAppDispatch';
import {
  House, LayoutGrid, ShoppingCart, Package, User
} from '../../src/components/ui/Icon';
import type { LucideIcon } from 'lucide-react-native';

interface TabIconProps {
  Icon: LucideIcon;
  label: string;
  focused: boolean;
  badge?: number;
}

function TabIcon({ Icon, label, focused, badge }: TabIconProps) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <View style={styles.iconWrapper}>
        <Icon
          size={22}
          color={focused ? Colors.primary : Colors.textMuted}
          strokeWidth={focused ? 2.5 : 1.8}
        />
        {!!badge && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>{label}</Text>
    </View>
  );
}

export default function CustomerLayout() {
  const cartItems = useAppSelector(s => s.cart.items);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

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
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={House} label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={LayoutGrid} label="Categories" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={Package} label="Orders" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={ShoppingCart} label="Cart" focused={focused} badge={cartCount} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={User} label="Profile" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="order-confirmed" options={{ href: null }} />
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
    shadowOpacity: 0.07,
    shadowRadius: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.lg,
    gap: 3,
    minWidth: 54,
  },
  tabItemActive: { backgroundColor: Colors.primaryContainer },
  iconWrapper: { position: 'relative' },
  badge: {
    position: 'absolute', top: -6, right: -8,
    backgroundColor: Colors.error,
    borderRadius: 999, minWidth: 16, height: 16,
    paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: Colors.white,
  },
  badgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 9, color: Colors.white, lineHeight: 13 },
  tabLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 10, color: Colors.textMuted },
  tabLabelActive: { color: Colors.primary },
});
