import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from './api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useAppTheme } from './ThemeContext';
import { theme } from './theme';
import type { Order } from './types';

interface CheckoutScreenProps {
  onSuccess: (order: Order) => void;
  onBack: () => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onSuccess, onBack }) => {
  const { colors, isDark } = useAppTheme();
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [delivery, setDelivery] = useState<'standard' | 'pickup'>('standard');

  const [line1, setLine1] = useState('12 Purple Avenue');
  const [city, setCity] = useState('Lagos');
  const [state, setState] = useState('LA');
  const [zip, setZip] = useState('100001');
  const [country, setCountry] = useState('Nigeria');

  const [cardholder, setCardholder] = useState(user?.name || 'Ada Lovelace');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [expiry, setExpiry] = useState('12/29');
  const [cvc, setCvc] = useState('123');

  const [submitting, setSubmitting] = useState(false);

  const shipping = delivery === 'pickup' || subtotal >= 100 || subtotal === 0 ? 0 : 9.99;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Required', 'Please enter your name and email address.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        customer: { name, email, phone: phone || undefined },
        delivery_method: delivery,
        payment: {
          cardholder,
          card_number: cardNumber.replace(/\s+/g, ''),
          expiry,
          cvc,
        },
      };

      if (delivery === 'standard') {
        payload.address = { line1, city, state, zip, country };
      }

      const res = await api<{ data: Order }>('/checkout', {
        method: 'POST',
        body: payload,
      });

      await clear();
      onSuccess(res.data);
    } catch (err: any) {
      Alert.alert('Checkout Failed', err.message || 'Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
    >
      {/* Back button */}
      <TouchableOpacity onPress={onBack} style={styles.backRow} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color={colors.accent} />
        <Text style={[styles.backText, { color: colors.accent }]}>Return to Shopping Bag</Text>
      </TouchableOpacity>

      <View style={styles.titleSection}>
        <Text style={[styles.title, { color: colors.text }]}>Secure Checkout</Text>
        <View style={[styles.testBadge, { backgroundColor: isDark ? '#10231a' : '#ecfdf5' }]}>
          <Ionicons name="shield-checkmark" size={14} color={colors.success} />
          <Text style={[styles.testBadgeText, { color: colors.success }]}>Test Sandbox Mode · 100% Free</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-circle-outline" size={20} color={colors.accent} />
          <Text style={[styles.cardHeaderText, { color: colors.text }]}>1. Contact Information</Text>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
          placeholder="Full Name"
          placeholderTextColor={colors.text3}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
          placeholder="Email address"
          placeholderTextColor={colors.text3}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
          placeholder="Phone Number (optional)"
          placeholderTextColor={colors.text3}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      </View>

      {/* Delivery */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="location-outline" size={20} color={colors.accent} />
          <Text style={[styles.cardHeaderText, { color: colors.text }]}>2. Shipping & Delivery</Text>
        </View>

        <View style={styles.deliveryTiles}>
          <TouchableOpacity
            style={[
              styles.delTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
              delivery === 'standard' && {
                borderColor: colors.accent,
                backgroundColor: isDark ? '#1c1f3a' : '#f0fdf4',
              },
            ]}
            onPress={() => setDelivery('standard')}
            activeOpacity={0.8}
          >
            <View style={[styles.delTileRadio, { borderColor: colors.border }]}>
              <View
                style={[
                  styles.radioDot,
                  delivery === 'standard' && { backgroundColor: colors.accent },
                ]}
              />
            </View>
            <View style={styles.delTileTextCol}>
              <Text style={[styles.delTileTitle, { color: colors.text }]}>Standard Delivery</Text>
              <Text style={[styles.delTileSub, { color: colors.text2 }]}>
                {subtotal >= 100 ? 'FREE (Over $100 order)' : '$9.99 flat rate'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.delTile,
              { backgroundColor: colors.surface, borderColor: colors.border },
              delivery === 'pickup' && {
                borderColor: colors.accent,
                backgroundColor: isDark ? '#1c1f3a' : '#f0fdf4',
              },
            ]}
            onPress={() => setDelivery('pickup')}
            activeOpacity={0.8}
          >
            <View style={[styles.delTileRadio, { borderColor: colors.border }]}>
              <View
                style={[
                  styles.radioDot,
                  delivery === 'pickup' && { backgroundColor: colors.accent },
                ]}
              />
            </View>
            <View style={styles.delTileTextCol}>
              <Text style={[styles.delTileTitle, { color: colors.text }]}>In-Store Pickup</Text>
              <Text style={[styles.delTileSub, { color: colors.text2 }]}>FREE · Collect at MLC Store</Text>
            </View>
          </TouchableOpacity>
        </View>

        {delivery === 'standard' && (
          <View style={[styles.addressInputs, { borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
              placeholder="Street Address"
              placeholderTextColor={colors.text3}
              value={line1}
              onChangeText={setLine1}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
                placeholder="City"
                placeholderTextColor={colors.text3}
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={[styles.input, { width: 100, backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
                placeholder="State"
                placeholderTextColor={colors.text3}
                value={state}
                onChangeText={setState}
              />
            </View>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
                placeholder="Postal / Zip"
                placeholderTextColor={colors.text3}
                value={zip}
                onChangeText={setZip}
              />
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
                placeholder="Country"
                placeholderTextColor={colors.text3}
                value={country}
                onChangeText={setCountry}
              />
            </View>
          </View>
        )}
      </View>

      {/* Payment */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="card-outline" size={20} color={colors.accent} />
          <Text style={[styles.cardHeaderText, { color: colors.text }]}>3. Payment (Demo Mode)</Text>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
          placeholder="Name on Card"
          placeholderTextColor={colors.text3}
          value={cardholder}
          onChangeText={setCardholder}
        />
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
          placeholder="Card Number"
          placeholderTextColor={colors.text3}
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
        />
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
            placeholder="Expiry (MM/YY)"
            placeholderTextColor={colors.text3}
            value={expiry}
            onChangeText={setExpiry}
          />
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: isDark ? '#1a1d27' : '#f8fafc', borderColor: colors.border, color: colors.text }]}
            placeholder="CVC"
            placeholderTextColor={colors.text3}
            value={cvc}
            onChangeText={setCvc}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Order Total & Submit */}
      <View style={[styles.orderSummaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sumRow}>
          <Text style={[styles.sumLabel, { color: colors.text2 }]}>Items ({items.length})</Text>
          <Text style={[styles.sumVal, { color: colors.text }]}>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.sumRow}>
          <Text style={[styles.sumLabel, { color: colors.text2 }]}>Shipping Fee</Text>
          <Text style={[styles.sumVal, { color: shipping === 0 ? colors.success : colors.text }]}>
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </Text>
        </View>
        <View style={[styles.sumRow, styles.sumTotalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.sumTotalLabel, { color: colors.text }]}>Order Total</Text>
          <Text style={[styles.sumTotalVal, { color: colors.accent }]}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.payBtn,
          { backgroundColor: colors.accent },
          submitting && styles.payBtnDisabled,
        ]}
        onPress={handlePlaceOrder}
        disabled={submitting}
        activeOpacity={0.88}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.payBtnText}>Confirm & Place Order (${total.toFixed(2)})</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  titleSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
  },
  testBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 6,
  },
  testBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardHeaderText: {
    fontSize: 15,
    fontWeight: '800',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deliveryTiles: {
    gap: 10,
    marginBottom: 10,
  },
  delTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  delTileRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  delTileTextCol: {
    flex: 1,
  },
  delTileTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  delTileSub: {
    fontSize: 12,
    marginTop: 2,
  },
  addressInputs: {
    marginTop: 6,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  orderSummaryCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sumLabel: {
    fontSize: 13,
  },
  sumVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  sumTotalRow: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    marginBottom: 0,
  },
  sumTotalLabel: {
    fontSize: 16,
    fontWeight: '900',
  },
  sumTotalVal: {
    fontSize: 20,
    fontWeight: '900',
  },
  payBtn: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  payBtnDisabled: {
    opacity: 0.7,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
