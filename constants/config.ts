// DAVA App Configuration
export const APP_CONFIG = {
  name: 'DAVA',
  nameAr: 'دافا',
  tagline: 'Fashion & Style',
  taglineAr: 'أزياء وأناقة',
  adminPhone: '+967782282586',
  adminWhatsApp: '967782282586',
  countryCode: '+967',
  currency: 'ريال',
  currencyEn: 'YER',
};

export const ADMIN_CREDENTIALS = {
  username: 'Abod#DAVA',
  password: 'Abod#7822',
};

export const DELIVERY_CITIES = [
  { id: 'aden', nameAr: 'عدن', nameEn: 'Aden', fee: 500 },
  { id: 'marib', nameAr: 'مأرب', nameEn: 'Marib', fee: 700 },
  { id: 'taiz', nameAr: 'تعز', nameEn: 'Taiz', fee: 600 },
];

export const PAYMENT_METHODS = [
  { id: 'kuraimi', nameAr: 'بنك كريمي', nameEn: 'Kuraimi Bank', icon: 'account-balance' },
  { id: 'floosak', nameAr: 'فلوسك / واي كاش', nameEn: 'Floosak / Way Cash', icon: 'account-balance-wallet' },
  { id: 'cac', nameAr: 'كاك بنك', nameEn: 'CAC Bank', icon: 'account-balance' },
];

export const CATEGORIES = [
  { id: 'women', nameAr: 'ملابس نسائية', nameEn: 'Women', icon: 'person', color: '#E8A0B4' },
  { id: 'girls', nameAr: 'ملابس بناتي', nameEn: 'Girls', icon: 'child-care', color: '#B4A0E8' },
  { id: 'boys', nameAr: 'ملابس ولادي', nameEn: 'Boys', icon: 'child-friendly', color: '#A0C4E8' },
  { id: 'accessories', nameAr: 'إكسسوارات', nameEn: 'Accessories', icon: 'watch', color: '#E8C9A0' },
  { id: 'local', nameAr: 'صناعة محلية', nameEn: 'Local Made', icon: 'handshake', color: '#A0E8B4' },
];

export const ORDER_STATUSES = [
  { id: 'pending', nameAr: 'قيد الانتظار', nameEn: 'Pending', color: '#E0A050' },
  { id: 'confirmed', nameAr: 'تم التأكيد', nameEn: 'Confirmed', color: '#5090E0' },
  { id: 'processing', nameAr: 'قيد التجهيز', nameEn: 'Processing', color: '#A050E0' },
  { id: 'shipped', nameAr: 'تم الشحن', nameEn: 'Shipped', color: '#50A0E0' },
  { id: 'delivered', nameAr: 'تم التسليم', nameEn: 'Delivered', color: '#4CAF82' },
  { id: 'cancelled', nameAr: 'ملغي', nameEn: 'Cancelled', color: '#E05252' },
];

export const ADMIN_PERMISSIONS = [
  { id: 'manage_products', nameAr: 'إدارة المنتجات', nameEn: 'Manage Products' },
  { id: 'manage_orders', nameAr: 'إدارة الطلبات', nameEn: 'Manage Orders' },
  { id: 'manage_users', nameAr: 'إدارة المستخدمين', nameEn: 'Manage Users' },
  { id: 'manage_offers', nameAr: 'إدارة العروض', nameEn: 'Manage Offers' },
  { id: 'manage_coupons', nameAr: 'إدارة الكوبونات', nameEn: 'Manage Coupons' },
  { id: 'view_statistics', nameAr: 'عرض الإحصائيات', nameEn: 'View Statistics' },
  { id: 'manage_delivery', nameAr: 'إدارة التوصيل', nameEn: 'Manage Delivery' },
  { id: 'manage_banks', nameAr: 'إدارة البنوك', nameEn: 'Manage Banks' },
  { id: 'manage_admins', nameAr: 'إدارة الإداريين', nameEn: 'Manage Admins' },
  { id: 'manage_settings', nameAr: 'إدارة الإعدادات', nameEn: 'Manage Settings' },
];

export const SIZES = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  kids: ['2Y', '4Y', '6Y', '8Y', '10Y', '12Y', '14Y'],
  accessories: ['Free Size', 'S/M', 'L/XL'],
};
