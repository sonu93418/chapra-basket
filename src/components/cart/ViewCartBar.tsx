import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, TextStyles, Radius, Shadows, Spacing } from '../../theme';

interface ViewCartBarProps {
  itemCount: number;
  totalAmount: number;
  onPress: () => void;
}

export const ViewCartBar: React.FC<ViewCartBarProps> = ({ itemCount, totalAmount, onPress }) => {
  if (itemCount === 0) return null;

  return (
    <TouchableOpacity
      style={[styles.container, Shadows.primaryGlow]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.leftSection}>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{itemCount}</Text>
        </View>
        <Text style={styles.itemLabel}>{itemCount === 1 ? 'item' : 'items'} in cart</Text>
      </View>

      <Text style={styles.viewCart}>View Cart →</Text>
      <Text style={styles.amount}>₹{totalAmount}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { ...TextStyles.labelBold, color: Colors.white },
  itemLabel: { ...TextStyles.bodySm, color: 'rgba(255,255,255,0.85)' },
  viewCart: { ...TextStyles.bodyLgSemiBold, color: Colors.white, flex: 1, textAlign: 'center' },
  amount: { ...TextStyles.bodyLgSemiBold, color: Colors.white },
});
