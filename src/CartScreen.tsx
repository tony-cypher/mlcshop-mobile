import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { getProductImageSource } from './productImages';
import { useAppTheme } from './ThemeContext';
import { theme } from './theme';
import type { CartItem } from './types';

interface CartScreenProps {
  onCheckout: () => void;
  onBrowse: () => void;
  onSignIn?: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({ onCheckout, onBrowse, onSignIn }) => {
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();
  const { items, count, subtotal, setQuantity, removeItem, clear } = useCart();

  const FREE_SHIPPING_THRESHOLD = 100;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 9.99;
  const total = subtotal + shipping;
  const progressToFreeShipping = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  const syncBanner = (
    <View
      style={[
        styles.syncBannerBase,
        {
          backgroundColor: user
            ? isDark ? '#10231a' : '#ecfdf5'
            : isDark ? '#33260c' : '#fffbeb',
          borderBottomColor: user
            ? isDark ? '#1e3a2b' : '#a7f3d0'
            : isDark ? '#4d3810' : '#fde68a',
        },
      ]}
    >
      <Ionicons
        name={user ? 'checkmark-circle' : 'information-circle'}
        size={16}
        color={user ? colors.success : isDark ? '#fbbf24' : '#92400e'}
      />
      <Text
        style={[
          styles.syncTextBase,
          { color: user ? colors.success : isDark ? '#fbbf24' : '#92400e' },
        ]}
        numberOfLines={1}
      >
        {user
          ? `Connected: ${user.email} (Live cloud sync)`
          : 'Guest Mode: Sign in to sync across web & mobile'}
      </Text>
      {!user && onSignIn && (
        <TouchableOpacity
          onPress={onSignIn}
          style={[styles.syncSignInBtn, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.syncSignInText}>Sign In</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.bg }]}>
        {syncBanner}
        <View style={styles.emptyInner}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.surface }]}>
            <Ionicons name="cart-outline" size={50} color={colors.text3} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Cart is Empty</Text>
          <Text style={[styles.emptySubtitle, { color: colors.text2 }]}>
            {user
              ? 'Items you add on either the mobile app or website will instantly appear here!'
              : 'Sign in with the same account as your website to synchronize cart items in real time.'}
          </Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: colors.accent }]}
            onPress={onBrowse}
            activeOpacity={0.85}
          >
            <Text style={styles.browseButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {syncBanner}

      {/* Free Shipping Progress Header */}
      <View style={[styles.shippingBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.shippingTextRow}>
          <Ionicons
            name="car-outline"
            size={16}
            color={shipping === 0 ? colors.success : colors.text}
          />
          <Text style={[styles.shippingBarText, { color: colors.text }]}>
            {shipping === 0 ? (
              <Text style={{ color: colors.success, fontWeight: '700' }}>
                🎉 You unlocked FREE Standard Shipping!
              </Text>
            ) : (
              <Text>
                Add{' '}
                <Text style={{ fontWeight: '700', color: colors.accent }}>
                  ${remainingForFreeShipping.toFixed(2)}
                </Text>{' '}
                more for FREE shipping
              </Text>
            )}
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: isDark ? '#1a1d27' : '#f1f5f9' }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressToFreeShipping * 100}%`, backgroundColor: colors.accent },
              shipping === 0 && { backgroundColor: colors.success },
            ]}
          />
        </View>
      </View>

      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Bag ({count})</Text>
        <TouchableOpacity onPress={clear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.clearText, { color: colors.danger }]}>Clear all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {items.map((item: CartItem) => {
          const key = `${item.id}-${item.size ?? ''}-${item.color ?? ''}`;
          const imageSource = getProductImageSource(item.image_url, item.slug);

          return (
            <View
              key={key}
              style={[
                styles.itemRow,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={[styles.itemImageTile, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc' }]}>
                {imageSource ? (
                  <Image source={imageSource} style={styles.itemImage} resizeMode="contain" />
                ) : (
                  <Text style={styles.itemEmoji}>{item.emoji || '🛍️'}</Text>
                )}
              </View>

              <View style={styles.itemDetails}>
                <View style={styles.itemNameRow}>
                  <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeItem(item.id, item.size, item.color)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={17} color={colors.danger} />
                  </TouchableOpacity>
                </View>

                {(item.size || item.color) && (
                  <Text style={[styles.itemVariant, { color: colors.text3 }]}>
                    {[item.size, item.color].filter(Boolean).join(' · ')}
                  </Text>
                )}

                <Text style={[styles.itemPrice, { color: colors.text2 }]}>${item.price.toFixed(2)} each</Text>

                <View style={styles.stepperRow}>
                  <View style={[styles.stepper, { backgroundColor: isDark ? '#1a1d27' : '#f1f5f9' }]}>
                    <TouchableOpacity
                      style={[styles.stepBtn, { backgroundColor: colors.surface }]}
                      onPress={() => setQuantity(item.id, item.quantity - 1, item.size, item.color)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="remove" size={15} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[styles.stepBtn, { backgroundColor: colors.surface }]}
                      onPress={() => setQuantity(item.id, item.quantity + 1, item.size, item.color)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="add" size={15} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.lineTotal, { color: colors.text }]}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Summary Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Subtotal</Text>
          <Text style={[styles.summaryVal, { color: colors.text }]}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.text2 }]}>Estimated Shipping</Text>
          <Text style={[styles.summaryVal, { color: shipping === 0 ? colors.success : colors.text }]}>
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalVal, { color: colors.accent }]}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.checkoutBtn, { backgroundColor: colors.accent }]}
          onPress={onCheckout}
          activeOpacity={0.88}
        >
          <Ionicons name="lock-closed" size={17} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.checkoutText}>Proceed to Checkout (${total.toFixed(2)})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },
  shippingBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  shippingTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  shippingBarText: {
    fontSize: 12,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  itemRow: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  itemImageTile: {
    width: 76,
    height: 76,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  itemImage: {
    width: '90%',
    height: '90%',
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginRight: 6,
  },
  itemVariant: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 12,
    marginTop: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '700',
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: '800',
  },
  deleteBtn: {
    padding: 4,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  checkoutBtn: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
  },
  emptyInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
    marginBottom: 20,
  },
  browseButton: {
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: theme.radius.pill,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  syncBannerBase: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncTextBase: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  syncSignInBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  syncSignInText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
