import React from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useFavorites } from './FavoritesContext';
import { useAppTheme } from './ThemeContext';
import { theme } from './theme';
import type { Category } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.82, 320);

interface SidebarDrawerProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  inStockOnly: boolean;
  onToggleInStockOnly: (val: boolean) => void;
  dealsOnly: boolean;
  onToggleDealsOnly: (val: boolean) => void;
  onNavigateTab: (tab: 'shop' | 'cart' | 'orders' | 'favorites' | 'profile') => void;
  onOpenAuth: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  visible,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  inStockOnly,
  onToggleInStockOnly,
  dealsOnly,
  onToggleDealsOnly,
  onNavigateTab,
  onOpenAuth,
}) => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { favoriteIds } = useFavorites();
  const { isDark, toggleTheme, colors } = useAppTheme();

  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 16,
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop click to dismiss */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Drawer Content */}
        <View
          style={[
            styles.drawerContainer,
            {
              paddingTop: topPadding,
              paddingBottom: Math.max(insets.bottom, 16),
              backgroundColor: colors.surface,
            },
          ]}
        >
          {/* User Header Profile */}
          <View style={[styles.header, { backgroundColor: colors.surface2, borderBottomColor: colors.border }]}>
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                {user ? (
                  <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                ) : (
                  <Ionicons name="person" size={24} color="#fff" />
                )}
              </View>
              <View style={styles.userMeta}>
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                  {user ? user.name : 'Guest Shopper'}
                </Text>
                <Text style={[styles.userEmail, { color: colors.text3 }]} numberOfLines={1}>
                  {user ? user.email : 'Sign in for cloud sync'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={24} color={colors.text2} />
              </TouchableOpacity>
            </View>

            {!user ? (
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => {
                  onClose();
                  onOpenAuth();
                }}
              >
                <Text style={styles.signInBtnText}>Sign In / Register</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.syncStatusBadge, { backgroundColor: isDark ? '#10231a' : '#ecfdf5' }]}>
                <View style={styles.onlineDot} />
                <Text style={[styles.syncStatusText, { color: colors.success }]}>Synced with MLC Cloud</Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {/* Quick Navigation Links */}
            <Text style={[styles.sectionHeader, { color: colors.text3 }]}>Navigation</Text>

            <TouchableOpacity
              style={styles.navRow}
              onPress={() => {
                onClose();
                onNavigateTab('shop');
              }}
            >
              <Ionicons name="storefront-outline" size={20} color={colors.accent} />
              <Text style={[styles.navLabel, { color: colors.text }]}>Shop Catalogue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRow}
              onPress={() => {
                onClose();
                onNavigateTab('favorites');
              }}
            >
              <Ionicons name="heart-outline" size={20} color={colors.danger} />
              <Text style={[styles.navLabel, { color: colors.text }]}>Wishlist</Text>
              {favoriteIds.length > 0 && (
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>{favoriteIds.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRow}
              onPress={() => {
                onClose();
                onNavigateTab('cart');
              }}
            >
              <Ionicons name="cart-outline" size={20} color={colors.accent} />
              <Text style={[styles.navLabel, { color: colors.text }]}>Cart</Text>
              {cartCount > 0 && (
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRow}
              onPress={() => {
                onClose();
                if (!user) onOpenAuth();
                else onNavigateTab('orders');
              }}
            >
              <Ionicons name="cube-outline" size={20} color="#0284c7" />
              <Text style={[styles.navLabel, { color: colors.text }]}>Orders & Tracking</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navRow}
              onPress={() => {
                onClose();
                if (!user) onOpenAuth();
                else onNavigateTab('profile');
              }}
            >
              <Ionicons name="person-outline" size={20} color="#8b5cf6" />
              <Text style={[styles.navLabel, { color: colors.text }]}>My Profile</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Appearance Mode Toggle */}
            <Text style={[styles.sectionHeader, { color: colors.text3 }]}>Appearance</Text>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelCol}>
                <Text style={[styles.switchTitle, { color: colors.text }]}>Theme Mode</Text>
                <Text style={[styles.switchSubtitle, { color: colors.text3 }]}>
                  {isDark ? 'Dark theme (Active)' : 'Light theme (Active)'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.themePillBtn,
                  { backgroundColor: isDark ? '#1e222d' : '#f1f5f9', borderColor: colors.border },
                ]}
                onPress={toggleTheme}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isDark ? 'moon' : 'sunny'}
                  size={16}
                  color={isDark ? '#fbbf24' : '#f59e0b'}
                />
                <Text style={[styles.themePillText, { color: colors.text }]}>
                  {isDark ? 'Dark' : 'Light'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Filter Switches */}
            <Text style={[styles.sectionHeader, { color: colors.text3 }]}>Quick Filters</Text>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelCol}>
                <Text style={[styles.switchTitle, { color: colors.text }]}>In Stock Only</Text>
                <Text style={[styles.switchSubtitle, { color: colors.text3 }]}>Hide unavailable products</Text>
              </View>
              <Switch
                value={inStockOnly}
                onValueChange={onToggleInStockOnly}
                trackColor={{ false: colors.border, true: colors.accent }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelCol}>
                <Text style={[styles.switchTitle, { color: colors.text }]}>Special Deals Only</Text>
                <Text style={[styles.switchSubtitle, { color: colors.text3 }]}>Discounted bargains</Text>
              </View>
              <Switch
                value={dealsOnly}
                onValueChange={onToggleDealsOnly}
                trackColor={{ false: colors.border, true: colors.danger }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Categories */}
            <Text style={[styles.sectionHeader, { color: colors.text3 }]}>Categories</Text>

            <TouchableOpacity
              style={[
                styles.categoryRow,
                selectedCategory === null && { backgroundColor: isDark ? '#1c1f3a' : '#f0fdf4' },
              ]}
              onPress={() => {
                onSelectCategory(null);
                onClose();
              }}
            >
              <Text style={styles.categoryEmoji}>🔥</Text>
              <Text
                style={[
                  styles.categoryName,
                  { color: colors.text },
                  selectedCategory === null && { color: colors.accent, fontWeight: '700' },
                ]}
              >
                All Products
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryRow,
                  selectedCategory === cat.slug && { backgroundColor: isDark ? '#1c1f3a' : '#f0fdf4' },
                ]}
                onPress={() => {
                  onSelectCategory(cat.slug);
                  onClose();
                }}
              >
                <Text style={styles.categoryEmoji}>{cat.emoji || '📦'}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    { color: colors.text },
                    selectedCategory === cat.slug && { color: colors.accent, fontWeight: '700' },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Logout button */}
            {user && (
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={async () => {
                  await logout();
                  onClose();
                }}
              >
                <Ionicons name="log-out-outline" size={18} color={colors.danger} />
                <Text style={[styles.logoutBtnText, { color: colors.danger }]}>Sign Out</Text>
              </TouchableOpacity>
            )}

            <View style={styles.footerNote}>
              <Text style={[styles.footerText, { color: colors.text3 }]}>MLC Shop Mobile v1.2</Text>
              <Text style={[styles.footerSubText, { color: colors.text3 }]}>Light & Dark Theme Parity</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    height: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 15,
    shadowOffset: { width: 5, height: 0 },
    elevation: 16,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  userMeta: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  signInBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.pill,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  signInBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  syncStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  syncStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  pillBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  pillBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  switchLabelCol: {
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  themePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    gap: 6,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
    gap: 10,
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    gap: 10,
    marginTop: 10,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footerSubText: {
    fontSize: 11,
    marginTop: 2,
  },
});
