import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { useAuth } from './AuthContext';
import type { Product } from './types';

const FAVORITES_STORAGE_KEY = 'mlc_favorites_mobile';

interface FavoritesContextValue {
  favoriteIds: number[];
  favorites: Product[];
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  reload: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);

  // Load from AsyncStorage for guest
  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const list: Product[] = JSON.parse(raw);
            setFavorites(list);
            setFavoriteIds(list.map((p) => p.id));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  // Save guest favorites to AsyncStorage
  useEffect(() => {
    if (!user) {
      AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
    }
  }, [favorites, user]);

  const reload = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api<{ data: Product[] }>('/favorites');
      if (res.data) {
        setFavorites(res.data);
        setFavoriteIds(res.data.map((p) => p.id));
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) {
      void reload();
    }
  }, [user, reload]);

  const isFavorite = useCallback(
    (productId: number) => favoriteIds.includes(productId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback(
    async (product: Product) => {
      const exists = favoriteIds.includes(product.id);
      if (exists) {
        setFavoriteIds((prev) => prev.filter((id) => id !== product.id));
        setFavorites((prev) => prev.filter((p) => p.id !== product.id));
        if (user) {
          try {
            await api(`/favorites/${product.id}`, { method: 'DELETE' });
          } catch {}
        }
      } else {
        setFavoriteIds((prev) => [...prev, product.id]);
        setFavorites((prev) => [product, ...prev]);
        if (user) {
          try {
            await api(`/favorites/${product.id}`, { method: 'POST' });
          } catch {}
        }
      }
    },
    [favoriteIds, user],
  );

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, favorites, isFavorite, toggleFavorite, reload }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
