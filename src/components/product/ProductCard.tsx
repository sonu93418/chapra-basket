import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, TextStyles, Radius, Shadows, Spacing } from '../../theme';
import { Product } from '../../types';
import { QuantitySelector } from './QuantitySelector';

interface ProductCardProps {
  product: Product;
  quantity: number;
  onPress: () => void;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  variant?: 'compact' | 'wide';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onPress,
  onAdd,
  onIncrement,
  onDecrement,
  variant = 'compact',
}) => {
  const hasDiscount = product.mrp && product.mrp > product.price;
  const isWide = variant === 'wide';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.93}
      style={[styles.card, isWide && styles.cardWide, Shadows.sm]}
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, isWide && styles.imageContainerWide]}>
        <Image source={{ uri: product.images[0] }} style={styles.image} contentFit="cover" transition={200} />
        {/* Discount Badge */}
        {hasDiscount && product.discountPercent && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discountPercent}% OFF</Text>
          </View>
        )}
        {/* Fresh Badge */}
        {product.isFresh && (
          <View style={styles.freshBadge}>
            <Text style={styles.freshText}>FRESH</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.unit}>{product.unit}</Text>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price}</Text>
          {hasDiscount && (
            <Text style={styles.mrp}>₹{product.mrp}</Text>
          )}
        </View>

        {/* Add / Qty Selector */}
        <View style={styles.actionRow}>
          {quantity === 0 ? (
            <TouchableOpacity
              style={[styles.addBtn, !product.stockQuantity && styles.addBtnDisabled]}
              onPress={product.stockQuantity > 0 ? onAdd : undefined}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>
                {product.stockQuantity > 0 ? '+ ADD' : 'Sold Out'}
              </Text>
            </TouchableOpacity>
          ) : (
            <QuantitySelector
              quantity={quantity}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              size="sm"
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    overflow: 'hidden',
    flex: 1,
    margin: 4,
  },
  cardWide: {
    flexDirection: 'row',
    margin: 0,
    marginBottom: 12,
  },

  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.surfaceVariant,
  },
  imageContainerWide: {
    width: 110,
    aspectRatio: undefined,
    height: 110,
  },
  image: { width: '100%', height: '100%' },

  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  discountText: { ...TextStyles.micro, color: Colors.white, fontWeight: '700' },

  freshBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  freshText: { ...TextStyles.micro, color: Colors.white, fontWeight: '700' },

  content: {
    padding: 10,
    flex: 1,
  },
  unit: { ...TextStyles.micro, color: Colors.textMuted, marginBottom: 2 },
  name: { ...TextStyles.bodySm, color: Colors.textPrimary, fontWeight: '600', marginBottom: 6, lineHeight: 18 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  price: { ...TextStyles.price, color: Colors.textPrimary },
  mrp: { ...TextStyles.bodySm, color: Colors.textMuted, textDecorationLine: 'line-through' },

  actionRow: { alignItems: 'flex-start' },
  addBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  addBtnDisabled: { borderColor: Colors.border, backgroundColor: Colors.surfaceVariant },
  addBtnText: { ...TextStyles.labelBold, color: Colors.primary, letterSpacing: 0.5 },
});
