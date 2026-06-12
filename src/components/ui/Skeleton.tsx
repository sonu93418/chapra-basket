/**
 * Blink Box — Skeleton Loading Component
 * Used for all loading states instead of spinners
 */
import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  radius = Radius.sm,
  style,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: Colors.surfaceVariant, opacity },
        style,
      ]}
    />
  );
};

// ─── ProductCard Skeleton ──────────────────────────────────────────────────
export const ProductCardSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <View style={skStyles.row}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={skStyles.card}>
        <Skeleton height={120} radius={Radius.lg} />
        <Skeleton height={12} width="80%" style={{ marginTop: 8 }} />
        <Skeleton height={10} width="60%" style={{ marginTop: 4 }} />
        <View style={skStyles.priceRow}>
          <Skeleton height={14} width={50} />
          <Skeleton height={28} width={28} radius={14} />
        </View>
      </View>
    ))}
  </View>
);

// ─── List Item Skeleton ─────────────────────────────────────────────────────
export const ListItemSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <View>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={skStyles.listItem}>
        <Skeleton width={56} height={56} radius={Radius.lg} />
        <View style={{ flex: 1, gap: 6 }}>
          <Skeleton height={14} width="70%" />
          <Skeleton height={11} width="50%" />
        </View>
        <Skeleton height={14} width={50} />
      </View>
    ))}
  </View>
);

// ─── Banner Skeleton ────────────────────────────────────────────────────────
export const BannerSkeleton: React.FC = () => (
  <Skeleton height={160} radius={Radius.xxl} style={{ marginHorizontal: 16 }} />
);

const skStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  card: { width: '47%', gap: 4, padding: 8, backgroundColor: Colors.surface, borderRadius: Radius.xl },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
});
