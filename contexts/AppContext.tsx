import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '@/constants/i18n';

interface User {
  id: string;
  phone: string;
  name: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  createdAt: string;
}

interface CartItem {
  productId: string;
  productName: string;
  productNameEn: string;
  price: number;
  originalPrice?: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  searchHistory: string[];
  addSearchHistory: (query: string) => void;
  logout: () => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [user, setUserState] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedLang, storedUser, storedCart, storedSearch] = await Promise.all([
        AsyncStorage.getItem('dava_language'),
        AsyncStorage.getItem('dava_user'),
        AsyncStorage.getItem('dava_cart'),
        AsyncStorage.getItem('dava_search_history'),
      ]);
      const storedFavs = await AsyncStorage.getItem('dava_favorites');
      if (storedLang) setLanguageState(storedLang as Language);
      if (storedUser) setUserState(JSON.parse(storedUser));
      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedSearch) setSearchHistory(JSON.parse(storedSearch));
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
    } catch {}
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('dava_language', lang);
  };

  const setUser = async (u: User | null) => {
    setUserState(u);
    if (u) await AsyncStorage.setItem('dava_user', JSON.stringify(u));
    else await AsyncStorage.removeItem('dava_user');
  };

  const addToCart = async (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => 
        i.productId === item.productId && i.size === item.size && i.color === item.color
      );
      let updated: CartItem[];
      if (existing) {
        updated = prev.map(i =>
          i.productId === item.productId && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        updated = [...prev, item];
      }
      AsyncStorage.setItem('dava_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromCart = async (productId: string, size: string, color: string) => {
    setCart(prev => {
      const updated = prev.filter(i => 
        !(i.productId === productId && i.size === size && i.color === color)
      );
      AsyncStorage.setItem('dava_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const updateCartQuantity = async (productId: string, size: string, color: string, quantity: number) => {
    setCart(prev => {
      const updated = quantity <= 0
        ? prev.filter(i => !(i.productId === productId && i.size === size && i.color === color))
        : prev.map(i =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          );
      AsyncStorage.setItem('dava_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem('dava_cart');
  };

  const addSearchHistory = async (query: string) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q !== query);
      const updated = [query, ...filtered].slice(0, 50);
      AsyncStorage.setItem('dava_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleFavorite = async (productId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      AsyncStorage.setItem('dava_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    setUserState(null);
    await AsyncStorage.removeItem('dava_user');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      user, setUser,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      cartTotal, cartCount,
      searchHistory, addSearchHistory,
      logout,
      favorites, toggleFavorite,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
