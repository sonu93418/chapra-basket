import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, TextStyles, Radius } from '../../theme';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  size = 'md',
  dark = false,
}) => {
  const sizeStyle = SIZE_STYLES[size];

  return (
    <View style={[styles.container, dark && styles.containerDark, { borderRadius: sizeStyle.radius }]}>
      <TouchableOpacity
        onPress={onDecrement}
        disabled={quantity <= min}
        style={[styles.btn, { width: sizeStyle.btnSize, height: sizeStyle.btnSize }]}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, { fontSize: sizeStyle.iconSize }, dark && styles.iconDark, quantity <= min && styles.iconDisabled]}>−</Text>
      </TouchableOpacity>

      <Text style={[styles.qty, { fontSize: sizeStyle.fontSize, minWidth: sizeStyle.qtyWidth }, dark && styles.qtyDark]}>
        {quantity}
      </Text>

      <TouchableOpacity
        onPress={onIncrement}
        disabled={quantity >= max}
        style={[styles.btn, { width: sizeStyle.btnSize, height: sizeStyle.btnSize }]}
        activeOpacity={0.7}
      >
        <Text style={[styles.icon, { fontSize: sizeStyle.iconSize }, dark && styles.iconDark, quantity >= max && styles.iconDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const SIZE_STYLES = {
  sm: { btnSize: 28, iconSize: 16, fontSize: 13, qtyWidth: 22, radius: Radius.md },
  md: { btnSize: 36, iconSize: 20, fontSize: 15, qtyWidth: 28, radius: Radius.lg },
  lg: { btnSize: 44, iconSize: 22, fontSize: 17, qtyWidth: 32, radius: Radius.xl },
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    overflow: 'hidden',
  },
  containerDark: {
    backgroundColor: Colors.primaryDark,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: Colors.white,
    fontWeight: '700',
    lineHeight: 24,
  },
  iconDark: { color: Colors.white },
  iconDisabled: { opacity: 0.4 },
  qty: {
    color: Colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  qtyDark: { color: Colors.white },
});
