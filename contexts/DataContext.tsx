import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface DataContextType {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
  offers: Offer[];
  adminUsers: AdminUser[];
  settings: AppSettings;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (id: string, coupon: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  validateCoupon: (code: string, orderTotal: number) => Coupon | null;
  addReview: (review: Review) => void;
  addOffer: (offer: Offer) => void;
  updateOffer: (id: string, offer: Partial<Offer>) => void;
  deleteOffer: (id: string) => void;
  addAdminUser: (admin: AdminUser) => void;
  updateAdminUser: (id: string, admin: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  getSearchAnalytics: () => { query: string; count: number }[];
  recordSearch: (query: string) => void;
  users: UserRecord[];
  updateUser: (id: string, user: Partial<UserRecord>) => void;
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

const DataContext = createContext<DataContextType | undefined>(undefined);

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'p1',
    nameAr: 'عباءة سوداء فاخرة',
    nameEn: 'Luxury Black Abaya',
    descriptionAr: 'عباءة سوداء أنيقة مع تطريز ذهبي فاخر، مصنوعة من أجود أنواع القماش',
    descriptionEn: 'Elegant black abaya with luxury gold embroidery, made from premium fabric',
    price: 15000,
    originalPrice: 18000,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
    ],
    category: 'women',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['أسود', 'كحلي'],
    stock: 25,
    sold: 142,
    rating: 4.8,
    reviewCount: 38,
    isOffer: true,
    offerPercent: 17,
    isNew: false,
    isFeatured: true,
    isVisible: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    nameAr: 'فستان سهرة ذهبي',
    nameEn: 'Gold Evening Dress',
    descriptionAr: 'فستان سهرة راقٍ بلون ذهبي، مثالي للمناسبات الخاصة',
    descriptionEn: 'Elegant gold evening dress, perfect for special occasions',
    price: 22000,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
    ],
    category: 'women',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['ذهبي', 'فضي'],
    stock: 15,
    sold: 89,
    rating: 4.9,
    reviewCount: 24,
    isOffer: false,
    isNew: true,
    isFeatured: true,
    isVisible: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    nameAr: 'قلادة ذهب 18 قيراط',
    nameEn: '18K Gold Necklace',
    descriptionAr: 'قلادة ذهب حقيقي 18 قيراط بتصميم عصري',
    descriptionEn: '18K real gold necklace with modern design',
    price: 35000,
    originalPrice: 40000,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400',
    ],
    category: 'accessories',
    sizes: ['Free Size'],
    colors: ['ذهبي'],
    stock: 8,
    sold: 56,
    rating: 5.0,
    reviewCount: 15,
    isOffer: true,
    offerPercent: 13,
    isNew: false,
    isFeatured: true,
    isVisible: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    nameAr: 'طقم أطفال بناتي',
    nameEn: "Girls' Set",
    descriptionAr: 'طقم أنيق للبنات من قطعتين، مناسب للمدرسة والمناسبات',
    descriptionEn: "Elegant 2-piece girls' set, suitable for school and occasions",
    price: 8500,
    images: [
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400',
    ],
    category: 'girls',
    sizes: ['4Y', '6Y', '8Y', '10Y', '12Y'],
    colors: ['وردي', 'بنفسجي', 'أبيض'],
    stock: 30,
    sold: 203,
    rating: 4.7,
    reviewCount: 61,
    isOffer: false,
    isNew: true,
    isFeatured: false,
    isVisible: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p5',
    nameAr: 'بدلة ولادي كلاسيك',
    nameEn: "Classic Boys' Suit",
    descriptionAr: 'بدلة ولادي كلاسيكية أنيقة للمناسبات',
    descriptionEn: "Classic elegant boys' suit for occasions",
    price: 12000,
    images: [
      'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400',
    ],
    category: 'boys',
    sizes: ['4Y', '6Y', '8Y', '10Y', '12Y', '14Y'],
    colors: ['أسود', 'كحلي', 'رمادي'],
    stock: 20,
    sold: 78,
    rating: 4.6,
    reviewCount: 19,
    isOffer: false,
    isNew: false,
    isFeatured: false,
    isVisible: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p6',
    nameAr: 'عسل سدر يمني طبيعي',
    nameEn: 'Natural Yemeni Sidr Honey',
    descriptionAr: 'عسل سدر يمني طبيعي 100% من مناطق حضرموت',
    descriptionEn: '100% natural Yemeni sidr honey from Hadhramout',
    price: 25000,
    images: [
      'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400',
    ],
    category: 'local',
    sizes: ['500g', '1kg'],
    colors: ['طبيعي'],
    stock: 50,
    sold: 312,
    rating: 5.0,
    reviewCount: 87,
    isOffer: false,
    isNew: false,
    isFeatured: true,
    isVisible: true,
    createdAt: new Date().toISOString(),
  },
];

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

export function DataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEMO_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 'c1',
      code: 'DAVA10',
      discount: 10,
      type: 'percent',
      minOrder: 5000,
      maxUses: 100,
      usedCount: 0,
      isActive: true,
    },
  ]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: 'o1',
      titleAr: 'خصم 20% على الملابس النسائية',
      titleEn: '20% Off Women\'s Collection',
      descriptionAr: 'عرض خاص على جميع الملابس النسائية',
      descriptionEn: 'Special offer on all women\'s clothing',
      image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
      discount: 20,
      category: 'women',
      isActive: true,
    },
  ]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    {
      id: 'admin1',
      name: 'عبود المدير',
      phone: '+967782282586',
      username: 'Abod#DAVA',
      password: 'Abod#7822',
      isSuperAdmin: true,
      permissions: ['manage_products', 'manage_orders', 'manage_users', 'manage_offers', 
                    'manage_coupons', 'view_statistics', 'manage_delivery', 'manage_banks', 
                    'manage_admins', 'manage_settings'],
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [searchQueries, setSearchQueries] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const keys = ['dava_products', 'dava_orders', 'dava_coupons', 'dava_reviews', 
                    'dava_offers', 'dava_admins', 'dava_users', 'dava_settings', 'dava_searches'];
      const results = await Promise.all(keys.map(k => AsyncStorage.getItem(k)));
      if (results[0]) setProducts(JSON.parse(results[0]));
      if (results[1]) setOrders(JSON.parse(results[1]));
      if (results[2]) setCoupons(JSON.parse(results[2]));
      if (results[3]) setReviews(JSON.parse(results[3]));
      if (results[4]) setOffers(JSON.parse(results[4]));
      if (results[5]) setAdminUsers(JSON.parse(results[5]));
      if (results[6]) setUsers(JSON.parse(results[6]));
      if (results[7]) setSettings(JSON.parse(results[7]));
      if (results[8]) setSearchQueries(JSON.parse(results[8]));
    } catch {}
  };

  const saveProducts = async (data: Product[]) => {
    await AsyncStorage.setItem('dava_products', JSON.stringify(data));
  };
  const saveOrders = async (data: Order[]) => {
    await AsyncStorage.setItem('dava_orders', JSON.stringify(data));
  };
  const saveCoupons = async (data: Coupon[]) => {
    await AsyncStorage.setItem('dava_coupons', JSON.stringify(data));
  };
  const saveAdmins = async (data: AdminUser[]) => {
    await AsyncStorage.setItem('dava_admins', JSON.stringify(data));
  };
  const saveUsers = async (data: UserRecord[]) => {
    await AsyncStorage.setItem('dava_users', JSON.stringify(data));
  };
  const saveSettings = async (data: AppSettings) => {
    await AsyncStorage.setItem('dava_settings', JSON.stringify(data));
  };

  const addProduct = (product: Product) => {
    const updated = [...products, product];
    setProducts(updated);
    saveProducts(updated);
  };

  const updateProduct = (id: string, partial: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...partial } : p);
    setProducts(updated);
    saveProducts(updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
  };

  const addOrder = (order: Order) => {
    const updated = [order, ...orders];
    setOrders(updated);
    saveOrders(updated);
    // Update user stats
    setUsers(prev => {
      const existing = prev.find(u => u.id === order.userId);
      let updated2: UserRecord[];
      if (existing) {
        updated2 = prev.map(u => u.id === order.userId
          ? { ...u, totalOrders: u.totalOrders + 1, totalSpent: u.totalSpent + order.total }
          : u
        );
      } else {
        updated2 = [...prev, {
          id: order.userId,
          name: order.userName,
          phone: order.userPhone,
          isActive: true,
          totalOrders: 1,
          totalSpent: order.total,
          createdAt: new Date().toISOString(),
          favorites: [],
        }];
      }
      saveUsers(updated2);
      return updated2;
    });
  };

  const updateOrder = (id: string, partial: Partial<Order>) => {
    const updated = orders.map(o => o.id === id ? { ...o, ...partial, updatedAt: new Date().toISOString() } : o);
    setOrders(updated);
    saveOrders(updated);
  };

  const addCoupon = (coupon: Coupon) => {
    const updated = [...coupons, coupon];
    setCoupons(updated);
    saveCoupons(updated);
  };

  const updateCoupon = (id: string, partial: Partial<Coupon>) => {
    const updated = coupons.map(c => c.id === id ? { ...c, ...partial } : c);
    setCoupons(updated);
    saveCoupons(updated);
  };

  const deleteCoupon = (id: string) => {
    const updated = coupons.filter(c => c.id !== id);
    setCoupons(updated);
    saveCoupons(updated);
  };

  const validateCoupon = (code: string, orderTotal: number): Coupon | null => {
    const coupon = coupons.find(c => 
      c.code.toLowerCase() === code.toLowerCase() && 
      c.isActive && 
      c.usedCount < c.maxUses &&
      orderTotal >= c.minOrder
    );
    return coupon || null;
  };

  const addReview = (review: Review) => {
    const updated = [...reviews, review];
    setReviews(updated);
    AsyncStorage.setItem('dava_reviews', JSON.stringify(updated));
    // Update product rating
    const productReviews = updated.filter(r => r.productId === review.productId);
    const avgRating = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
    updateProduct(review.productId, { rating: Math.round(avgRating * 10) / 10, reviewCount: productReviews.length });
  };

  const addOffer = (offer: Offer) => {
    const updated = [...offers, offer];
    setOffers(updated);
    AsyncStorage.setItem('dava_offers', JSON.stringify(updated));
  };

  const updateOffer = (id: string, partial: Partial<Offer>) => {
    const updated = offers.map(o => o.id === id ? { ...o, ...partial } : o);
    setOffers(updated);
    AsyncStorage.setItem('dava_offers', JSON.stringify(updated));
  };

  const deleteOffer = (id: string) => {
    const updated = offers.filter(o => o.id !== id);
    setOffers(updated);
    AsyncStorage.setItem('dava_offers', JSON.stringify(updated));
  };

  const addAdminUser = (admin: AdminUser) => {
    const updated = [...adminUsers, admin];
    setAdminUsers(updated);
    saveAdmins(updated);
  };

  const updateAdminUser = (id: string, partial: Partial<AdminUser>) => {
    const updated = adminUsers.map(a => a.id === id ? { ...a, ...partial } : a);
    setAdminUsers(updated);
    saveAdmins(updated);
  };

  const deleteAdminUser = (id: string) => {
    const updated = adminUsers.filter(a => a.id !== id);
    setAdminUsers(updated);
    saveAdmins(updated);
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveSettings(updated);
  };

  const recordSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQueries(prev => {
      const updated = { ...prev, [query.toLowerCase()]: (prev[query.toLowerCase()] || 0) + 1 };
      AsyncStorage.setItem('dava_searches', JSON.stringify(updated));
      return updated;
    });
  };

  const getSearchAnalytics = () => {
    return Object.entries(searchQueries)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);
  };

  const updateUser = (id: string, partial: Partial<UserRecord>) => {
    const updated = users.map(u => u.id === id ? { ...u, ...partial } : u);
    setUsers(updated);
    saveUsers(updated);
  };

  return (
    <DataContext.Provider value={{
      products, orders, coupons, reviews, offers, adminUsers, settings, users,
      addProduct, updateProduct, deleteProduct,
      addOrder, updateOrder,
      addCoupon, updateCoupon, deleteCoupon, validateCoupon,
      addReview, addOffer, updateOffer, deleteOffer,
      addAdminUser, updateAdminUser, deleteAdminUser,
      updateSettings, getSearchAnalytics, recordSearch, updateUser,
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
