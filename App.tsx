import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from './src/api';
import { AuthProvider, useAuth } from './src/AuthContext';
import { AuthScreen } from './src/AuthScreen';
import { CartProvider, useCart } from './src/CartContext';
import { CartScreen } from './src/CartScreen';
import { CheckoutScreen } from './src/CheckoutScreen';
import { FavoritesProvider, useFavorites } from './src/FavoritesContext';
import { FavoritesScreen } from './src/FavoritesScreen';
import { ProductCard } from './src/ProductCard';
import { ProductDetailModal } from './src/ProductDetailModal';
import { SidebarDrawer } from './src/SidebarDrawer';
import { ThemeProvider, useAppTheme } from './src/ThemeContext';
import { theme } from './src/theme';
import type { Category, Order, Product } from './src/types';

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'rating';

function ShopApp() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();
  const { count: cartCount, addItem } = useCart();
  const { favoriteIds } = useFavorites();

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'shop' | 'favorites' | 'cart' | 'checkout' | 'orders' | 'profile'>('shop');
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Products & Categories
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [dealsOnly, setDealsOnly] = useState(false);

  // Orders
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Safe area top padding ensuring wifi/battery/camera hole never overlaps content
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (RNStatusBar.currentHeight || 28) : 16,
  );

  // Load products & categories from API
  const loadData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory) {
        queryParams.set('category', selectedCategory);
      }
      if (search.trim()) {
        queryParams.set('search', search.trim());
      }
      if (dealsOnly) {
        queryParams.set('deals', '1');
      }

      const [prodRes, catRes] = await Promise.all([
        api<{ data: Product[] }>(`/products?${queryParams.toString()}`),
        api<{ data: Category[] }>('/categories'),
      ]);

      setProducts(prodRes.data);
      if (categories.length === 0) setCategories(catRes.data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [selectedCategory, dealsOnly]);

  const loadOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const res = await api<{ data: Order[] }>('/orders');
      setMyOrders(res.data);
    } catch {
      // Ignore
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      void loadOrders();
    }
  }, [activeTab, user]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => Number.parseFloat(a.price) - Number.parseFloat(b.price));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => Number.parseFloat(b.price) - Number.parseFloat(a.price));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => Number.parseFloat(b.rating) - Number.parseFloat(a.rating));
    }

    return result;
  }, [products, inStockOnly, sortBy]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Application Bar with Dynamic Safe Inset Spacing */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 6,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* Sidebar Drawer Toggle (3 horizontal bars) */}
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => setShowDrawer(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="menu" size={26} color={colors.text} />
        </TouchableOpacity>

        {/* Brand Title */}
        <TouchableOpacity
          style={styles.logoRow}
          onPress={() => {
            setActiveTab('shop');
            setSelectedCategory(null);
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.logoPill, { backgroundColor: colors.accent }]}>
            <Text style={styles.logoPillText}>M</Text>
          </View>
          <Text style={[styles.brandTitle, { color: colors.text }]}>MLC Shop</Text>
        </TouchableOpacity>

        {/* Header Right Actions */}
        <View style={styles.headerRightActions}>
          {/* Light / Dark Mode Toggle */}
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={toggleTheme}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon-outline'}
              size={22}
              color={isDark ? '#fbbf24' : colors.text}
            />
          </TouchableOpacity>

          {/* Wishlist Button */}
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setActiveTab('favorites')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={activeTab === 'favorites' ? 'heart' : 'heart-outline'}
              size={22}
              color={activeTab === 'favorites' ? colors.danger : colors.text}
            />
            {favoriteIds.length > 0 && (
              <View style={[styles.badgeHeart, { backgroundColor: colors.danger }]}>
                <Text style={styles.badgeText}>{favoriteIds.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Cart Button */}
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setActiveTab('cart')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={activeTab === 'cart' ? 'bag' : 'bag-outline'}
              size={22}
              color={activeTab === 'cart' ? colors.accent : colors.text}
            />
            {cartCount > 0 && (
              <View style={[styles.badgeCart, { backgroundColor: colors.accent }]}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* User Profile / Sign In */}
          {user ? (
            <TouchableOpacity
              style={[styles.userAvatarBtn, { backgroundColor: colors.accent }]}
              onPress={() => setActiveTab('profile')}
            >
              <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.signInPill, { backgroundColor: colors.accent }]}
              onPress={() => setShowAuthModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.signInPillText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Tab Content */}
      {activeTab === 'shop' && (
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.searchBar, { backgroundColor: isDark ? '#1a1d27' : '#f1f5f9' }]}>
              <Ionicons name="search" size={18} color={colors.text3} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search products, brands..."
                placeholderTextColor={colors.text3}
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={loadData}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearch('');
                    void loadData();
                  }}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="close-circle" size={18} color={colors.text3} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Chips Bar */}
          <View style={[styles.categoryBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  { backgroundColor: isDark ? '#1a1d27' : '#f1f5f9' },
                  selectedCategory === null && { backgroundColor: colors.accent },
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: colors.text2 },
                    selectedCategory === null && { color: '#fff', fontWeight: '700' },
                  ]}
                >
                  🔥 All
                </Text>
              </TouchableOpacity>

              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    { backgroundColor: isDark ? '#1a1d27' : '#f1f5f9' },
                    selectedCategory === cat.slug && { backgroundColor: colors.accent },
                  ]}
                  onPress={() => setSelectedCategory(cat.slug)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      { color: colors.text2 },
                      selectedCategory === cat.slug && { color: '#fff', fontWeight: '700' },
                    ]}
                  >
                    {cat.emoji || '📦'} {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filter & Sort Bar */}
          <View style={styles.subFilterBar}>
            <Text style={[styles.resultsCount, { color: colors.text3 }]}>
              {loading ? 'Updating...' : `${filteredProducts.length} items`}
            </Text>

            <View style={styles.sortRow}>
              <TouchableOpacity
                style={[
                  styles.sortChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  sortBy === 'featured' && {
                    backgroundColor: isDark ? '#1c1f3a' : '#eef2ff',
                    borderColor: colors.accent,
                  },
                ]}
                onPress={() => setSortBy('featured')}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    { color: colors.text2 },
                    sortBy === 'featured' && { color: colors.accent, fontWeight: '700' },
                  ]}
                >
                  Featured
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  sortBy === 'price_asc' && {
                    backgroundColor: isDark ? '#1c1f3a' : '#eef2ff',
                    borderColor: colors.accent,
                  },
                ]}
                onPress={() => setSortBy('price_asc')}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    { color: colors.text2 },
                    sortBy === 'price_asc' && { color: colors.accent, fontWeight: '700' },
                  ]}
                >
                  $ Low-High
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  sortBy === 'rating' && {
                    backgroundColor: isDark ? '#1c1f3a' : '#eef2ff',
                    borderColor: colors.accent,
                  },
                ]}
                onPress={() => setSortBy('rating')}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    { color: colors.text2 },
                    sortBy === 'rating' && { color: colors.accent, fontWeight: '700' },
                  ]}
                >
                  ★ Rating
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Products Grid (2 Columns) */}
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.text2 }]}>Loading catalogue...</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.centerBox}>
              <Ionicons name="search-outline" size={48} color={colors.text3} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No products found</Text>
              <Text style={[styles.emptySub, { color: colors.text3 }]}>Try searching for something else or reset filters.</Text>
              <TouchableOpacity
                style={[styles.resetFilterBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  setSelectedCategory(null);
                  setSearch('');
                  setDealsOnly(false);
                  setInStockOnly(false);
                }}
              >
                <Text style={styles.resetFilterText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              numColumns={2}
              keyExtractor={(item) => String(item.id)}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.gridContent}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => setSelectedProduct(item)}
                  onAddToCart={async () => {
                    await addItem(item, 1);
                    Alert.alert('Bag Updated', `“${item.name}” added to your cart.`);
                  }}
                />
              )}
            />
          )}
        </View>
      )}

      {activeTab === 'favorites' && (
        <FavoritesScreen
          onBrowse={() => setActiveTab('shop')}
          onSelectProduct={(p) => setSelectedProduct(p)}
        />
      )}

      {activeTab === 'cart' && (
        <CartScreen
          onBrowse={() => setActiveTab('shop')}
          onSignIn={() => setShowAuthModal(true)}
          onCheckout={() => {
            if (!user) {
              Alert.alert('Sign In Required', 'Please sign in to proceed with checkout and sync your order.', [
                { text: 'Cancel' },
                { text: 'Sign In', onPress: () => setShowAuthModal(true) },
              ]);
            } else {
              setActiveTab('checkout');
            }
          }}
        />
      )}

      {activeTab === 'checkout' && (
        <CheckoutScreen
          onBack={() => setActiveTab('cart')}
          onSuccess={(order) => {
            Alert.alert(
              'Order Placed Successfully!',
              `Reference: #${order.reference}\n\nA confirmation has been processed. You can track this order in your Orders tab!`,
            );
            setActiveTab('orders');
          }}
        />
      )}

      {activeTab === 'orders' && (
        <View style={[styles.ordersContainer, { backgroundColor: colors.bg }]}>
          <View style={[styles.ordersHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.ordersTitle, { color: colors.text }]}>Order History</Text>
            <Text style={[styles.ordersSub, { color: colors.text3 }]}>All purchases across web & mobile</Text>
          </View>

          {loadingOrders ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.text2 }]}>Fetching your orders...</Text>
            </View>
          ) : !user ? (
            <View style={styles.centerBox}>
              <Ionicons name="cube-outline" size={54} color={colors.text3} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Sign in to view orders</Text>
              <Text style={[styles.emptySub, { color: colors.text3 }]}>Your order history is securely saved to your account.</Text>
              <TouchableOpacity
                style={[styles.primaryPill, { backgroundColor: colors.accent }]}
                onPress={() => setShowAuthModal(true)}
              >
                <Text style={styles.primaryPillText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : myOrders.length === 0 ? (
            <View style={styles.centerBox}>
              <Ionicons name="receipt-outline" size={54} color={colors.text3} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
              <Text style={[styles.emptySub, { color: colors.text3 }]}>Orders you place on either the website or mobile will appear here.</Text>
              <TouchableOpacity
                style={[styles.primaryPill, { backgroundColor: colors.accent }]}
                onPress={() => setActiveTab('shop')}
              >
                <Text style={styles.primaryPillText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={myOrders}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.orderTopRow, { borderBottomColor: colors.border }]}>
                    <View>
                      <Text style={[styles.orderRef, { color: colors.text }]}>#{item.reference}</Text>
                      <Text style={[styles.orderDate, { color: colors.text3 }]}>
                        {item.placed_at ? new Date(item.placed_at).toLocaleDateString() : 'Recent'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isDark ? '#10231a' : '#ecfdf5' }]}>
                      <Text style={[styles.statusBadgeText, { color: colors.success }]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderItemsList}>
                    {item.items.map((it, idx) => (
                      <View key={idx} style={styles.orderItemLine}>
                        <Text style={[styles.orderItemName, { color: colors.text2 }]} numberOfLines={1}>
                          {it.name} × {it.quantity}
                        </Text>
                        <Text style={[styles.orderItemPrice, { color: colors.text }]}>${it.price}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.orderTotalRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.orderTotalLabel, { color: colors.text }]}>Total Paid:</Text>
                    <Text style={[styles.orderTotalVal, { color: colors.accent }]}>${item.total}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      )}

      {activeTab === 'profile' && (
        <View style={[styles.profileContainer, { backgroundColor: colors.bg }]}>
          <View style={[styles.profileHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.profileTitle, { color: colors.text }]}>My Account</Text>
          </View>

          {user ? (
            <ScrollView contentContainerStyle={styles.profileContent}>
              <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.profileAvatarLarge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.profileAvatarLargeText}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={[styles.profileUserName, { color: colors.text }]}>{user.name}</Text>
                <Text style={[styles.profileUserEmail, { color: colors.text3 }]}>{user.email}</Text>

                <View style={[styles.syncConnectedBadge, { backgroundColor: isDark ? '#10231a' : '#ecfdf5' }]}>
                  <View style={styles.greenPulse} />
                  <Text style={[styles.syncConnectedText, { color: colors.success }]}>Multi-Device Sync Connected</Text>
                </View>
              </View>

              <View style={[styles.profileActionList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.profileRow, { borderBottomColor: colors.border }]}
                  onPress={() => setActiveTab('orders')}
                >
                  <Ionicons name="cube-outline" size={22} color={colors.accent} />
                  <Text style={[styles.profileRowLabel, { color: colors.text }]}>My Orders</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.text3} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.profileRow, { borderBottomColor: colors.border }]}
                  onPress={() => setActiveTab('favorites')}
                >
                  <Ionicons name="heart-outline" size={22} color={colors.danger} />
                  <Text style={[styles.profileRowLabel, { color: colors.text }]}>
                    Wishlist ({favoriteIds.length})
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.text3} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.profileRow, { borderBottomColor: colors.border }]}
                  onPress={() => setActiveTab('cart')}
                >
                  <Ionicons name="cart-outline" size={22} color={colors.accent} />
                  <Text style={[styles.profileRowLabel, { color: colors.text }]}>
                    Shopping Bag ({cartCount})
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.text3} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileRow}
                  onPress={toggleTheme}
                >
                  <Ionicons
                    name={isDark ? 'moon' : 'sunny'}
                    size={22}
                    color={isDark ? '#fbbf24' : '#f59e0b'}
                  />
                  <Text style={[styles.profileRowLabel, { color: colors.text }]}>
                    Theme: {isDark ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                  <Ionicons name="swap-horizontal" size={18} color={colors.text3} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.signOutBtn, { backgroundColor: colors.surface, borderColor: isDark ? '#4d2327' : '#fecaca' }]}
                onPress={async () => {
                  await logout();
                  setActiveTab('shop');
                }}
              >
                <Ionicons name="log-out-outline" size={18} color={colors.danger} />
                <Text style={[styles.signOutBtnText, { color: colors.danger }]}>Sign Out of MLC Shop</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <View style={styles.centerBox}>
              <Ionicons name="person-circle-outline" size={64} color={colors.text3} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Sign in to your account</Text>
              <Text style={[styles.emptySub, { color: colors.text3 }]}>Sync your cart and manage your orders seamlessly.</Text>
              <TouchableOpacity
                style={[styles.primaryPill, { backgroundColor: colors.accent }]}
                onPress={() => setShowAuthModal(true)}
              >
                <Text style={styles.primaryPillText}>Sign In / Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('shop')}
        >
          <Ionicons
            name={activeTab === 'shop' ? 'storefront' : 'storefront-outline'}
            size={22}
            color={activeTab === 'shop' ? colors.accent : colors.text3}
          />
          <Text style={[styles.navTabText, { color: activeTab === 'shop' ? colors.accent : colors.text3 }]}>
            Shop
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('favorites')}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons
              name={activeTab === 'favorites' ? 'heart' : 'heart-outline'}
              size={22}
              color={activeTab === 'favorites' ? colors.danger : colors.text3}
            />
            {favoriteIds.length > 0 && (
              <View style={[styles.navDotBadge, { backgroundColor: colors.danger }]}>
                <Text style={styles.navDotBadgeText}>{favoriteIds.length}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navTabText, { color: activeTab === 'favorites' ? colors.danger : colors.text3 }]}>
            Wishlist
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => setActiveTab('cart')}
        >
          <View style={{ position: 'relative' }}>
            <Ionicons
              name={activeTab === 'cart' ? 'bag' : 'bag-outline'}
              size={22}
              color={activeTab === 'cart' ? colors.accent : colors.text3}
            />
            {cartCount > 0 && (
              <View style={[styles.navDotBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.navDotBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navTabText, { color: activeTab === 'cart' ? colors.accent : colors.text3 }]}>
            Cart
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            if (!user) setShowAuthModal(true);
            else setActiveTab('orders');
          }}
        >
          <Ionicons
            name={activeTab === 'orders' ? 'cube' : 'cube-outline'}
            size={22}
            color={activeTab === 'orders' ? colors.accent : colors.text3}
          />
          <Text style={[styles.navTabText, { color: activeTab === 'orders' ? colors.accent : colors.text3 }]}>
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navTab}
          onPress={() => {
            if (!user) setShowAuthModal(true);
            else setActiveTab('profile');
          }}
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'profile' ? colors.accent : colors.text3}
          />
          <Text style={[styles.navTabText, { color: activeTab === 'profile' ? colors.accent : colors.text3 }]}>
            Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar Drawer */}
      <SidebarDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => {
          setSelectedCategory(slug);
          setActiveTab('shop');
        }}
        inStockOnly={inStockOnly}
        onToggleInStockOnly={setInStockOnly}
        dealsOnly={dealsOnly}
        onToggleDealsOnly={setDealsOnly}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setShowDrawer(false);
        }}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        visible={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        onAddedToCart={() => {
          // Callback
        }}
      />

      {/* Authentication Modal with Eye Icon */}
      <Modal visible={showAuthModal} animationType="slide" transparent>
        <AuthScreen
          onSuccess={() => setShowAuthModal(false)}
          onClose={() => setShowAuthModal(false)}
        />
      </Modal>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <ShopApp />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerIconBtn: {
    padding: 6,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPillText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerActionBtn: {
    position: 'relative',
    padding: 4,
  },
  badgeHeart: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCart: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  userAvatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  signInPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  signInPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  categoryBar: {
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subFilterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  gridContent: {
    padding: 12,
    paddingBottom: 30,
  },
  columnWrapper: {
    gap: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingVertical: 8,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  navTabText: {
    fontSize: 10,
    fontWeight: '600',
  },
  navDotBadge: {
    position: 'absolute',
    top: -3,
    right: -8,
    paddingHorizontal: 4,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navDotBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  resetFilterBtn: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
  },
  resetFilterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  ordersContainer: {
    flex: 1,
  },
  ordersHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  ordersTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  ordersSub: {
    fontSize: 12,
    marginTop: 2,
  },
  orderCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  orderRef: {
    fontSize: 14,
    fontWeight: '800',
  },
  orderDate: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  orderItemsList: {
    paddingVertical: 10,
    gap: 6,
  },
  orderItemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderItemName: {
    flex: 1,
    fontSize: 13,
  },
  orderItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 10,
  },
  orderTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  orderTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  orderTotalVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  profileContainer: {
    flex: 1,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  profileContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  profileAvatarLarge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileAvatarLargeText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  profileUserName: {
    fontSize: 18,
    fontWeight: '800',
  },
  profileUserEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  syncConnectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    gap: 6,
    marginTop: 12,
  },
  greenPulse: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  syncConnectedText: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileActionList: {
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  profileRowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    gap: 8,
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  primaryPill: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
    marginTop: 14,
  },
  primaryPillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
