import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '@/constants/i18n';

interface User {
  id: string;
  email: string;
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
  productNameEn?: string;
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
  authLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');
  const [user, setUserState] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [l, u, c, s, f] = await Promise.all([
        AsyncStorage.getItem('dava_lang'),
        AsyncStorage.getItem('dava_user'),
        AsyncStorage.getItem('dava_cart'),
        AsyncStorage.getItem('dava_search'),
        AsyncStorage.getItem('dava_favs'),
      ]);
      if (l) setLanguageState(l as Language);
      if (u) setUserState(JSON.parse(u));
      if (c) setCart(JSON.parse(c));
      if (s) setSearchHistory(JSON.parse(s));
      if (f) setFavorites(JSON.parse(f));
    } catch {}
    finally { setAuthLoading(false); }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await AsyncStorage.setItem('dava_lang', lang);
  };

  const setUser = async (u: User | null) => {
    setUserState(u);
    if (u) await AsyncStorage.setItem('dava_user', JSON.stringify(u));
    else await AsyncStorage.removeItem('dava_user');
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const ex = prev.find(i => i.productId === item.productId && i.size === item.size && i.color === item.color);
      const upd = ex
        ? prev.map(i => i.productId === item.productId && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + item.quantity } : i)
        : [...prev, item];
      AsyncStorage.setItem('dava_cart', JSON.stringify(upd));
      return upd;
    });
  };

  const removeFromCart = (pid: string, size: string, color: string) => {
    setCart(prev => {
      const upd = prev.filter(i => !(i.productId === pid && i.size === size && i.color === color));
      AsyncStorage.setItem('dava_cart', JSON.stringify(upd));
      return upd;
    });
  };

  const updateCartQuantity = (pid: string, size: string, color: string, qty: number) => {
    setCart(prev => {
      const upd = qty <= 0
        ? prev.filter(i => !(i.productId === pid && i.size === size && i.color === color))
        : prev.map(i => i.productId === pid && i.size === size && i.color === color ? { ...i, quantity: qty } : i);
      AsyncStorage.setItem('dava_cart', JSON.stringify(upd));
      return upd;
    });
  };

  const clearCart = () => { setCart([]); AsyncStorage.removeItem('dava_cart'); };

  const addSearchHistory = (q: string) => {
    if (!q.trim()) return;
    setSearchHistory(prev => {
      const upd = [q, ...prev.filter(x => x !== q)].slice(0, 50);
      AsyncStorage.setItem('dava_search', JSON.stringify(upd));
      return upd;
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const upd = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      AsyncStorage.setItem('dava_favs', JSON.stringify(upd));
      return upd;
    });
  };

  const logout = () => { setUserState(null); AsyncStorage.removeItem('dava_user'); };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      user, setUser,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      cartTotal, cartCount,
      searchHistory, addSearchHistory,
      logout,
      favorites, toggleFavorite,
      authLoading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
