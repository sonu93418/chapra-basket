/**
 * Chapra Basket — Badge Component
 * Used for cart count, notification dots, order status
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../theme';

type BadgeVariant = 'error' | 'success' | 'warning' | 'primary' | 'neutral';

interface BadgeProps {
  count?: number;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  label?: string;
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  error: { bg: Colors.error, text: Colors.white },
  success: { bg: Colors.success, text: Colors.white },
  warning: { bg: Colors.warning, text: Colors.white },
  primary: { bg: Colors.primary, text: Colors.white },
  neutral: { bg: Colors.surfaceVariant, text: Colors.textSecondary },
};

export const Badge: React.FC<BadgeProps> = ({
  count,
  variant = 'error',
  size = 'md',
  label,
  style,
}) => {
  const { bg, text } = VARIANT_COLORS[variant];
  const displayText = label ?? (count !== undefined ? (count > 99 ? '99+' : String(count)) : '');
  const isSmall = size === 'sm';

  if (!displayText) return null;

  return (
    <View style={[
      styles.base,
      { backgroundColor: bg },
      isSmall ? styles.small : styles.medium,
      style,
    ]}>
      <Text style={[styles.text, { color: text }, isSmall && styles.textSmall]}>
        {displayText}
      </Text>
    </View>
  );
};

// ─── Dot Badge (notification indicator) ────────────────────────────────────
export const DotBadge: React.FC<{ color?: string; style?: ViewStyle }> = ({
  color = Colors.error,
  style,
}) => (
  <View style={[styles.dot, { backgroundColor: color }, style]} />
);

// ─── Status Badge (order status labels) ────────────────────────────────────
interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant = 'primary' }) => {
  const { bg, text } = VARIANT_COLORS[variant];
  return (
    <View style={[styles.statusBadge, { backgroundColor: bg + '22' }]}>
      <View style={[styles.statusDot, { backgroundColor: bg }]} />
      <Text style={[styles.statusText, { color: bg }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    minWidth: 18, paddingHorizontal: 5,
  },
  medium: { height: 18 },
  small: { height: 14, minWidth: 14, paddingHorizontal: 3 },
  text: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, lineHeight: 18 },
  textSmall: { fontSize: 9, lineHeight: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: Colors.white },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12 },
});
