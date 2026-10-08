import AsyncStorage from '@react-native-async-storage/async-storage';

let currentToken: string | null = null;

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
    } catch {
      // Fallback
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    if (key === 'mlc_token') return currentToken;
    return null;
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Fallback
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
    if (key === 'mlc_token') currentToken = value;
  },
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Fallback
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
    if (key === 'mlc_token') currentToken = null;
  },
};

export function setMemoryToken(token: string | null) {
  currentToken = token;
}

export function getMemoryToken(): string | null {
  return currentToken;
}
