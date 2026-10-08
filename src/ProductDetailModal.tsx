import React, { useState } from 'react';
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { getProductImageSource } from './productImages';
import { useAppTheme } from './ThemeContext';
import { theme } from './theme';
import type { Product } from './types';

interface ProductDetailModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  onAddedToCart?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  visible,
  onClose,
  onAddedToCart,
}) => {
  const { colors, isDark } = useAppTheme();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  // Initialize or reset variants when product opens
  React.useEffect(() => {
    if (product) {
      setQuantity(1);
      setSelectedSize(product.options?.sizes?.[0] ?? null);
      setSelectedColor(product.options?.colors?.[0] ?? null);
      setAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const favorited = isFavorite(product.id);
  const imageSource = getProductImageSource(product.image_url, product.slug);
  const priceNum = Number.parseFloat(product.price);
  const compareNum = product.compare_at_price
    ? Number.parseFloat(product.compare_at_price)
    : null;
  const savings = compareNum && compareNum > priceNum ? compareNum - priceNum : null;

  const handleAddToCart = async () => {
    await addItem(product, quantity, selectedSize, selectedColor);
    setAdded(true);
    if (onAddedToCart) onAddedToCart();
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
        {/* Top Navbar */}
        <View style={[styles.navBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.iconCircle, { backgroundColor: colors.surface2 }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
            {product.category?.name || 'Product Details'}
          </Text>
          <TouchableOpacity
            onPress={() => toggleFavorite(product)}
            style={[styles.iconCircle, { backgroundColor: colors.surface2 }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={favorited ? 'heart' : 'heart-outline'}
              size={22}
              color={favorited ? colors.danger : colors.text}
            />
          </TouchableOpacity>
        </View>

        <ScrollView style={[styles.scroll, { backgroundColor: colors.surface }]} contentContainerStyle={styles.scrollContent}>
          {/* Main Hero Image */}
          <View style={[styles.imageBox, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc' }]}>
            {imageSource ? (
              <Image source={imageSource} style={styles.image} resizeMode="contain" />
            ) : (
              <Text style={styles.emoji}>{product.emoji || '🛍️'}</Text>
            )}
            {product.is_deal && (
              <View style={[styles.dealPill, { backgroundColor: colors.danger }]}>
                <Text style={styles.dealPillText}>SPECIAL DEAL</Text>
              </View>
            )}
          </View>

          {/* Product Header */}
          <View style={styles.infoSection}>
            <View style={styles.brandRow}>
              <Text style={[styles.brandName, { color: colors.text3 }]}>
                {product.brand?.name || product.category?.name || 'MLC EXCLUSIVE'}
              </Text>
              {product.stock > 0 ? (
                <View style={[styles.stockBadge, { backgroundColor: isDark ? '#10231a' : '#ecfdf5' }]}>
                  <Text style={[styles.stockBadgeText, { color: colors.success }]}>In Stock ({product.stock})</Text>
                </View>
              ) : (
                <View style={[styles.stockBadge, { backgroundColor: isDark ? '#2a1517' : '#fef2f2' }]}>
                  <Text style={[styles.stockBadgeText, { color: colors.danger }]}>Out of Stock</Text>
                </View>
              )}
            </View>

            <Text style={[styles.productTitle, { color: colors.text }]}>{product.name}</Text>

            {/* Rating and Reviews */}
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(Number(product.rating)) ? 'star' : 'star-outline'}
                    size={16}
                    color="#f59e0b"
                  />
                ))}
              </View>
              <Text style={[styles.ratingValue, { color: colors.text }]}>{Number(product.rating).toFixed(1)}</Text>
              <Text style={[styles.reviewsText, { color: colors.text2 }]}>· {product.reviews_count} verified reviews</Text>
            </View>

            {/* Price and Savings */}
            <View style={styles.priceRow}>
              <Text style={[styles.currentPrice, { color: colors.text }]}>${priceNum.toFixed(2)}</Text>
              {compareNum && (
                <Text style={[styles.comparePrice, { color: colors.text3 }]}>${compareNum.toFixed(2)}</Text>
              )}
              {savings && (
                <View style={[styles.savingsPill, { backgroundColor: isDark ? '#33260c' : '#fef3c7' }]}>
                  <Text style={[styles.savingsText, { color: isDark ? '#fbbf24' : '#b45309' }]}>Save ${savings.toFixed(2)}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.text2 }]}>
              {product.description ||
                'Crafted with premium materials for maximum durability and everyday comfort. Backed by MLC Shop quality guarantee.'}
            </Text>

            {/* Size Options */}
            {product.options?.sizes && product.options.sizes.length > 0 && (
              <View style={styles.optionSection}>
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Select Size</Text>
                <View style={styles.variantChips}>
                  {product.options.sizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeChip,
                        { backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border },
                        selectedSize === size && { backgroundColor: colors.accent, borderColor: colors.accent },
                      ]}
                      onPress={() => setSelectedSize(size)}
                    >
                      <Text
                        style={[
                          styles.sizeChipText,
                          { color: colors.text },
                          selectedSize === size && { color: '#fff', fontWeight: '700' },
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Color Options */}
            {product.options?.colors && product.options.colors.length > 0 && (
              <View style={styles.optionSection}>
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Select Color</Text>
                <View style={styles.variantChips}>
                  {product.options.colors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorChip,
                        { backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border },
                        selectedColor === color && { backgroundColor: colors.accent, borderColor: colors.accent },
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      <Text
                        style={[
                          styles.colorChipText,
                          { color: colors.text },
                          selectedColor === color && { color: '#fff', fontWeight: '700' },
                        ]}
                      >
                        {color}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Quantity Stepper */}
            <View style={styles.optionSection}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Quantity</Text>
              <View style={[styles.stepperContainer, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.surface }]}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={18} color={quantity <= 1 ? colors.border : colors.text} />
                </TouchableOpacity>
                <Text style={[styles.stepperValue, { color: colors.text }]}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: colors.surface }]}
                  onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={quantity >= product.stock ? colors.border : colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Delivery Info */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={[styles.deliveryBox, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc' }]}>
              <View style={styles.deliveryItem}>
                <Ionicons name="car-outline" size={20} color={colors.accent} />
                <View style={styles.deliveryTextCol}>
                  <Text style={[styles.deliveryTitle, { color: colors.text }]}>Standard Delivery</Text>
                  <Text style={[styles.deliveryDesc, { color: colors.text2 }]}>Free on all orders over $100</Text>
                </View>
              </View>
              <View style={styles.deliveryItem}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
                <View style={styles.deliveryTextCol}>
                  <Text style={[styles.deliveryTitle, { color: colors.text }]}>Authenticity & Guarantee</Text>
                  <Text style={[styles.deliveryDesc, { color: colors.text2 }]}>100% Genuine MLC products</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.bottomPriceCol}>
            <Text style={[styles.bottomTotalLabel, { color: colors.text2 }]}>Total Price</Text>
            <Text style={[styles.bottomTotalVal, { color: colors.text }]}>${(priceNum * quantity).toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.addToCartBtn,
              { backgroundColor: colors.accent },
              added && { backgroundColor: '#10b981' },
              product.stock <= 0 && { backgroundColor: '#94a3b8' },
            ]}
            onPress={handleAddToCart}
            disabled={product.stock <= 0}
            activeOpacity={0.85}
          >
            <Ionicons
              name={added ? 'checkmark-circle' : 'cart'}
              size={20}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.addToCartBtnText}>
              {product.stock <= 0
                ? 'Out of Stock'
                : added
                ? 'Added to Cart!'
                : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 15,
    fontWeight: '700',
    maxWidth: '60%',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageBox: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 20,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  emoji: {
    fontSize: 90,
  },
  dealPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dealPillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  infoSection: {
    padding: 20,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 6,
    lineHeight: 26,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewsText: {
    fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
  },
  currentPrice: {
    fontSize: 26,
    fontWeight: '900',
  },
  comparePrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  savingsPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  optionSection: {
    marginTop: 16,
  },
  variantChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  sizeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  colorChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  colorChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    padding: 3,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
  },
  deliveryBox: {
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  deliveryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryTextCol: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  deliveryDesc: {
    fontSize: 12,
    marginTop: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 4,
  },
  bottomPriceCol: {
    flexDirection: 'column',
  },
  bottomTotalLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomTotalVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  addToCartBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
