import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from './FavoritesContext';
import { getProductImageSource } from './productImages';
import { useAppTheme } from './ThemeContext';
import { theme } from './theme';
import type { Product } from './types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress, onAddToCart }) => {
  const { colors, isDark } = useAppTheme();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(product.id);
  const imageSource = getProductImageSource(product.image_url, product.slug);

  const priceNum = Number.parseFloat(product.price);
  const compareNum = product.compare_at_price
    ? Number.parseFloat(product.compare_at_price)
    : null;
  const discountPercent =
    compareNum && compareNum > priceNum
      ? Math.round(((compareNum - priceNum) / compareNum) * 100)
      : null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: isDark ? '#000' : '#0f172a',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Image Area */}
      <View style={[styles.imageBox, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc' }]}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.emoji}>{product.emoji || '🛍️'}</Text>
        )}

        {/* Favorite Heart Button */}
        <TouchableOpacity
          style={[
            styles.favoriteBtn,
            { backgroundColor: isDark ? 'rgba(30,34,45,0.9)' : 'rgba(255,255,255,0.92)' },
          ]}
          onPress={() => toggleFavorite(product)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={19}
            color={favorited ? colors.danger : colors.text2}
          />
        </TouchableOpacity>

        {/* Discount / Deal Ribbon */}
        {discountPercent ? (
          <View style={[styles.discountBadge, { backgroundColor: colors.danger }]}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        ) : product.is_deal ? (
          <View style={[styles.dealBadge, { backgroundColor: colors.accent }]}>
            <Text style={styles.discountText}>DEAL</Text>
          </View>
        ) : null}
      </View>

      {/* Details */}
      <View style={styles.details}>
        {/* Brand or Category */}
        <Text style={[styles.brandText, { color: colors.text3 }]} numberOfLines={1}>
          {product.brand?.name || product.category?.name || 'MLC COLLECTION'}
        </Text>

        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating */}
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={13} color="#f59e0b" />
          <Text style={[styles.rating, { color: colors.text }]}>{Number(product.rating || 0).toFixed(1)}</Text>
          <Text style={[styles.reviewsCount, { color: colors.text3 }]}>({product.reviews_count})</Text>
        </View>

        {/* Price & Add */}
        <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.text }]}>${priceNum.toFixed(2)}</Text>
            {compareNum && (
              <Text style={[styles.comparePrice, { color: colors.text3 }]}>${compareNum.toFixed(2)}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.accent }]}
            onPress={onAddToCart}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={15} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    overflow: 'hidden',
  },
  imageBox: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 56,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dealBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
  details: {
    padding: 12,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '700',
  },
  reviewsCount: {
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
  },
  comparePrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    gap: 4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
