import React from 'react';
import {
  FlatList,
  Image,
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

interface FavoritesScreenProps {
  onBrowse: () => void;
  onSelectProduct: (product: Product) => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  onBrowse,
  onSelectProduct,
}) => {
  const { colors, isDark } = useAppTheme();
  const { favorites, toggleFavorite } = useFavorites();
  const { addItem } = useCart();

  if (favorites.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.bg }]}>
        <View style={[styles.emptyCircle, { backgroundColor: colors.surface }]}>
          <Ionicons name="heart-outline" size={48} color={colors.text3} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Wishlist is Empty</Text>
        <Text style={[styles.emptySubtitle, { color: colors.text2 }]}>
          Save your favorite items here so you can easily track and add them to your cart later!
        </Text>
        <TouchableOpacity
          style={[styles.browseBtn, { backgroundColor: colors.accent }]}
          onPress={onBrowse}
          activeOpacity={0.85}
        >
          <Text style={styles.browseBtnText}>Explore Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Wishlist ({favorites.length})</Text>
        <Text style={[styles.headerSub, { color: colors.text3 }]}>Items you've saved</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const imageSource = getProductImageSource(item.image_url, item.slug);
          const priceNum = Number.parseFloat(item.price);

          return (
            <TouchableOpacity
              style={[
                styles.itemRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => onSelectProduct(item)}
              activeOpacity={0.9}
            >
              <View style={[styles.imageTile, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc' }]}>
                {imageSource ? (
                  <Image source={imageSource} style={styles.image} resizeMode="contain" />
                ) : (
                  <Text style={styles.emoji}>{item.emoji || '🛍️'}</Text>
                )}
              </View>

              <View style={styles.itemDetails}>
                <Text style={[styles.brand, { color: colors.text3 }]}>{item.brand?.name || 'MLC COLLECTION'}</Text>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>

                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: colors.text }]}>${priceNum.toFixed(2)}</Text>
                  {item.stock > 0 ? (
                    <Text style={[styles.stockStatus, { color: colors.success }]}>In Stock</Text>
                  ) : (
                    <Text style={[styles.outOfStock, { color: colors.danger }]}>Out of Stock</Text>
                  )}
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.addToCartBtn, { backgroundColor: colors.accent }]}
                    onPress={async () => {
                      await addItem(item, 1);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="cart-outline" size={15} color="#fff" />
                    <Text style={styles.addToCartText}>Move to Cart</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => toggleFavorite(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={17} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 30,
  },
  itemRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageTile: {
    width: 80,
    height: 80,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emoji: {
    fontSize: 36,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 14,
  },
  brand: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
  },
  stockStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  outOfStock: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    gap: 5,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  removeBtn: {
    padding: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  browseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: theme.radius.pill,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
