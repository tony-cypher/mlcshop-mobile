import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import type { CartItem, Product } from './types';

const CART_STORAGE_KEY = 'mlc_mobile_cart';

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  loading: boolean;
  addItem: (product: Product, quantity?: number, size?: string | null, color?: string | null) => Promise<void>;
  setQuantity: (productId: number, quantity: number, size?: string | null, color?: string | null) => Promise<void>;
  removeItem: (productId: number, size?: string | null, color?: string | null) => Promise<void>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(item: CartItem, id: number, size?: string | null, color?: string | null) {
  return item.id === id && (item.size ?? null) === (size ?? null) && (item.color ?? null) === (color ?? null);
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isSyncingRef = useRef(false);

  // Load initial local cart from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(CART_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setItems(JSON.parse(raw));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Save changes to AsyncStorage
  useEffect(() => {
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items]);

  const reload = useCallback(async () => {
    if (!user || isSyncingRef.current) return;
    try {
      const res = await api<{ data: CartItem[] }>('/cart');
      if (res.data) {
        setItems(res.data);
      }
    } catch (err) {
      // Background poll failure
    }
  }, [user]);

  // Sync with server cart when user logs in, and poll every 3 seconds for instant multi-device reflection
  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    const initialSync = async () => {
      isSyncingRef.current = true;
      try {
        const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
        const localItems: CartItem[] = raw ? JSON.parse(raw) : [];

        if (localItems.length > 0) {
          const res = await api<{ data: CartItem[] }>('/cart/sync', {
            method: 'POST',
            body: {
              items: localItems.map((i) => ({
                id: i.id,
                quantity: i.quantity,
                size: i.size,
                color: i.color,
              })),
            },
          });
          if (!cancelled && res.data) {
            setItems(res.data);
          }
        } else {
          const res = await api<{ data: CartItem[] }>('/cart');
          if (!cancelled && res.data) {
            setItems(res.data);
          }
        }
      } catch (err) {
        console.warn('[Mobile CartSync] Initial sync error:', err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    void initialSync();

    const timer = setInterval(() => {
      if (!isSyncingRef.current) {
        void reload();
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [user, reload]);

  const addItem = useCallback(
    async (product: Product, quantity = 1, size?: string | null, color?: string | null) => {
      // Optimistic update
      setItems((current) => {
        const existing = current.find((item) => sameLine(item, product.id, size, color));
        if (existing) {
          return current.map((item) =>
            sameLine(item, product.id, size, color)
              ? { ...item, quantity: Math.min(item.stock, item.quantity + quantity) }
              : item,
          );
        }
        return [
          ...current,
          {
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: Number.parseFloat(product.price),
            compare_at_price: product.compare_at_price
              ? Number.parseFloat(product.compare_at_price)
              : null,
            emoji: product.emoji,
            image_url: product.image_url,
            quantity,
            size: size ?? null,
            color: color ?? null,
            stock: product.stock,
            delivery_standard: product.delivery_standard,
            delivery_pickup: product.delivery_pickup,
          },
        ];
      });

      if (user) {
        try {
          const res = await api<{ data: CartItem[] }>('/cart', {
            method: 'POST',
            body: {
              product_id: product.id,
              quantity,
              size: size ?? null,
              color: color ?? null,
            },
          });
          if (res.data) setItems(res.data);
        } catch {
          // Revert or re-fetch on failure
          void reload();
        }
      }
    },
    [user, reload],
  );

  const setQuantity = useCallback(
    async (productId: number, quantity: number, size?: string | null, color?: string | null) => {
      setItems((current) =>
        current.map((item) =>
          sameLine(item, productId, size, color)
            ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) }
            : item,
        ),
      );

      if (user) {
        try {
          const res = await api<{ data: CartItem[] }>('/cart', {
            method: 'PUT',
            body: {
              product_id: productId,
              quantity,
              size: size ?? null,
              color: color ?? null,
            },
          });
          if (res.data) setItems(res.data);
        } catch {
          void reload();
        }
      }
    },
    [user, reload],
  );

  const removeItem = useCallback(
    async (productId: number, size?: string | null, color?: string | null) => {
      setItems((current) => current.filter((item) => !sameLine(item, productId, size, color)));

      if (user) {
        try {
          const query = new URLSearchParams({ product_id: String(productId) });
          if (size) query.set('size', size);
          if (color) query.set('color', color);
          const res = await api<{ data: CartItem[] }>(`/cart?${query.toString()}`, {
            method: 'DELETE',
          });
          if (res.data) setItems(res.data);
        } catch {
          void reload();
        }
      }
    },
    [user, reload],
  );

  const clear = useCallback(async () => {
    setItems([]);
    if (user) {
      try {
        await api('/cart/clear', { method: 'DELETE' });
      } catch {
        void reload();
      }
    }
  }, [user, reload]);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, loading, addItem, setQuantity, removeItem, clear, reload }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
