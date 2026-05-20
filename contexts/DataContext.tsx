import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  productsService, ordersService, couponsService, reviewsService,
  offersService, adminService, customersService, settingsService, searchService,
} from '@/services/database';

export interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  isOffer: boolean;
  offerPercent?: number;
  isNew: boolean;
  isFeatured: boolean;
  isVisible: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  city: string;
  address: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'rejected';
  paymentScreenshot?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  couponCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percent' | 'fixed';
  minOrder: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  image: string;
  discount: number;
  category?: string;
  isActive: boolean;
  expiresAt?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  username: string;
  password: string;
  isSuperAdmin: boolean;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AppSettings {
  appLogoUrl: string;
  heroBanners: string[];
  deliveryCities: { id: string; nameAr: string; nameEn: string; fee: number; isActive: boolean }[];
  paymentBanks: { id: string; nameAr: string; nameEn: string; accountNumber: string; accountName: string; isActive: boolean }[];
  adminWhatsApp: string;
  welcomeMessage: string;
}

export interface UserRecord {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  favorites: string[];
}

interface DataContextType {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  offers: Offer[];
  adminUsers: AdminUser[];
  settings: AppSettings;
  users: UserRecord[];
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addOrder: (order: Order) => Promise<void>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<void>;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  validateCoupon: (code: string, orderTotal: number) => Promise<Coupon | null>;
  addReview: (review: Review) => Promise<void>;
  addOffer: (offer: Offer) => Promise<void>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  addAdminUser: (admin: AdminUser) => Promise<void>;
  updateAdminUser: (id: string, admin: Partial<AdminUser>) => Promise<void>;
  deleteAdminUser: (id: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  getSearchAnalytics: () => Promise<{ query: string; count: number }[]>;
  recordSearch: (query: string) => Promise<void>;
  updateUser: (id: string, user: Partial<UserRecord>) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const DEFAULT_SETTINGS: AppSettings = {
  appLogoUrl: '',
  heroBanners: [],
  deliveryCities: [
    { id: 'aden', nameAr: 'عدن', nameEn: 'Aden', fee: 500, isActive: true },
    { id: 'marib', nameAr: 'مأرب', nameEn: 'Marib', fee: 700, isActive: true },
    { id: 'taiz', nameAr: 'تعز', nameEn: 'Taiz', fee: 600, isActive: true },
  ],
  paymentBanks: [
    { id: 'kuraimi', nameAr: 'بنك كريمي', nameEn: 'Kuraimi Bank', accountNumber: '0000-0000', accountName: 'DAVA Store', isActive: true },
    { id: 'floosak', nameAr: 'فلوسك / واي كاش', nameEn: 'Floosak / Way Cash', accountNumber: '0000-0000', accountName: 'DAVA Store', isActive: true },
    { id: 'cac', nameAr: 'كاك بنك', nameEn: 'CAC Bank', accountNumber: '0000-0000', accountName: 'DAVA Store', isActive: true },
  ],
  adminWhatsApp: '967782282586',
  welcomeMessage: 'مرحباً بك في متجر DAVA للأزياء الفاخرة',
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [prods, ords, coups, revs, offs, admins, customers, setts] = await Promise.all([
        productsService.getAll(),
        ordersService.getAll(),
        couponsService.getAll(),
        reviewsService.getAll(),
        offersService.getAll(),
        adminService.getAll(),
        customersService.getAll(),
        settingsService.get(),
      ]);
      setProducts(prods);
      setOrders(ords);
      setCoupons(coups);
      setReviews(revs);
      setOffers(offs);
      setAdminUsers(admins);
      setUsers(customers.map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        isActive: c.is_active,
        totalOrders: c.total_orders || 0,
        totalSpent: c.total_spent || 0,
        createdAt: c.created_at,
        favorites: c.favorites || [],
      })));
      setSettings(setts);
    } catch (e) {
      console.error('loadAll error:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = async () => {
    const ords = await ordersService.getAll();
    setOrders(ords);
  };

  const addProduct = async (product: Product) => {
    const created = await productsService.create(product);
    setProducts(prev => [created, ...prev]);
  };

  const updateProduct = async (id: string, partial: Partial<Product>) => {
    const current = products.find(p => p.id === id);
    if (!current) return;
    const updated = { ...current, ...partial };
    await productsService.update(id, updated);
    setProducts(prev => prev.map(p => p.id === id ? updated : p));
  };

  const deleteProduct = async (id: string) => {
    await productsService.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addOrder = async (order: Order) => {
    await ordersService.create({ ...order, items: order.items });
    setOrders(prev => [order, ...prev]);
    // update customer stats
    setUsers(prev => {
      const existing = prev.find(u => u.id === order.userId);
      if (existing) {
        return prev.map(u => u.id === order.userId
          ? { ...u, totalOrders: u.totalOrders + 1, totalSpent: u.totalSpent + order.total }
          : u
        );
      }
      return [...prev, {
        id: order.userId,
        name: order.userName,
        phone: order.userPhone,
        isActive: true,
        totalOrders: 1,
        totalSpent: order.total,
        createdAt: new Date().toISOString(),
        favorites: [],
      }];
    });
  };

  const updateOrder = async (id: string, partial: Partial<Order>) => {
    await ordersService.update(id, partial);
    setOrders(prev => prev.map(o => o.id === id
      ? { ...o, ...partial, updatedAt: new Date().toISOString() }
      : o
    ));
  };

  const addCoupon = async (coupon: Coupon) => {
    const created = await couponsService.create(coupon);
    setCoupons(prev => [created, ...prev]);
  };

  const updateCoupon = async (id: string, partial: Partial<Coupon>) => {
    await couponsService.update(id, { ...coupons.find(c => c.id === id), ...partial });
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...partial } : c));
  };

  const deleteCoupon = async (id: string) => {
    await couponsService.delete(id);
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  const validateCoupon = async (code: string, orderTotal: number) => {
    return couponsService.validate(code, orderTotal);
  };

  const addReview = async (review: Review) => {
    await reviewsService.create(review);
    const updated = [...reviews, review];
    setReviews(updated);
    const productReviews = updated.filter(r => r.productId === review.productId);
    const avgRating = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
    await updateProduct(review.productId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: productReviews.length,
    });
  };

  const addOffer = async (offer: Offer) => {
    await offersService.create(offer);
    setOffers(prev => [offer, ...prev]);
  };

  const updateOffer = async (id: string, partial: Partial<Offer>) => {
    await offersService.update(id, { ...offers.find(o => o.id === id), ...partial });
    setOffers(prev => prev.map(o => o.id === id ? { ...o, ...partial } : o));
  };

  const deleteOffer = async (id: string) => {
    await offersService.delete(id);
    setOffers(prev => prev.filter(o => o.id !== id));
  };

  const addAdminUser = async (admin: AdminUser) => {
    await adminService.create(admin);
    setAdminUsers(prev => [...prev, admin]);
  };

  const updateAdminUser = async (id: string, partial: Partial<AdminUser>) => {
    await adminService.update(id, { ...adminUsers.find(a => a.id === id), ...partial });
    setAdminUsers(prev => prev.map(a => a.id === id ? { ...a, ...partial } : a));
  };

  const deleteAdminUser = async (id: string) => {
    await adminService.delete(id);
    setAdminUsers(prev => prev.filter(a => a.id !== id));
  };

  const updateSettings = async (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    await settingsService.update(partial);
    setSettings(updated);
  };

  const getSearchAnalytics = async () => searchService.getAnalytics();

  const recordSearch = async (query: string) => {
    await searchService.record(query);
  };

  const updateUser = async (id: string, partial: Partial<UserRecord>) => {
    await customersService.update(id, partial);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...partial } : u));
  };

  return (
    <DataContext.Provider value={{
      products, orders, coupons, reviews, offers, adminUsers, settings, users, loading,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrder,
      addCoupon, updateCoupon, deleteCoupon, validateCoupon,
      addReview, addOffer, updateOffer, deleteOffer,
      addAdminUser, updateAdminUser, deleteAdminUser,
      updateSettings, getSearchAnalytics, recordSearch, updateUser,
      refreshOrders,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
