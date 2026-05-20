import { getSupabaseClient } from '@/template';

const db = () => getSupabaseClient();

// ─── Products ────────────────────────────────────────────
export const productsService = {
  async getAll() {
    const { data, error } = await db().from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapProduct);
  },
  async create(p: any) {
    const { data, error } = await db().from('products').insert([mapProductToDb(p)]).select().single();
    if (error) throw error;
    return mapProduct(data);
  },
  async update(id: string, p: any) {
    const { error } = await db().from('products').update(mapProductToDb(p)).eq('id', id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await db().from('products').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Orders ──────────────────────────────────────────────
export const ordersService = {
  async getAll() {
    const { data, error } = await db().from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const orders = data || [];
    const ids = orders.map((o: any) => o.id);
    if (!ids.length) return [];
    const { data: items } = await db().from('order_items').select('*').in('order_id', ids);
    return orders.map((o: any) => mapOrder(o, (items || []).filter((i: any) => i.order_id === o.id)));
  },
  async create(order: any) {
    const { items, ...orderData } = order;
    const { data, error } = await db().from('orders').insert([mapOrderToDb(orderData)]).select().single();
    if (error) throw error;
    const orderItems = items.map((i: any) => ({ ...mapOrderItemToDb(i), order_id: data.id }));
    const { error: itemsError } = await db().from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;
    return data.id;
  },
  async update(id: string, partial: any) {
    const mapped: any = {};
    if (partial.status !== undefined) mapped.status = partial.status;
    if (partial.paymentStatus !== undefined) mapped.payment_status = partial.paymentStatus;
    if (partial.paymentScreenshot !== undefined) mapped.payment_screenshot = partial.paymentScreenshot;
    if (partial.notes !== undefined) mapped.notes = partial.notes;
    mapped.updated_at = new Date().toISOString();
    const { error } = await db().from('orders').update(mapped).eq('id', id);
    if (error) throw error;
  },
};

// ─── Coupons ─────────────────────────────────────────────
export const couponsService = {
  async getAll() {
    const { data, error } = await db().from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapCoupon);
  },
  async create(c: any) {
    const { data, error } = await db().from('coupons').insert([mapCouponToDb(c)]).select().single();
    if (error) throw error;
    return mapCoupon(data);
  },
  async update(id: string, c: any) {
    const { error } = await db().from('coupons').update(mapCouponToDb(c)).eq('id', id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await db().from('coupons').delete().eq('id', id);
    if (error) throw error;
  },
  async validate(code: string, orderTotal: number) {
    const { data } = await db().from('coupons').select('*').ilike('code', code).eq('is_active', true).single();
    if (!data) return null;
    const c = mapCoupon(data);
    if (c.usedCount >= c.maxUses) return null;
    if (orderTotal < c.minOrder) return null;
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return null;
    return c;
  },
};

// ─── Reviews ─────────────────────────────────────────────
export const reviewsService = {
  async getAll() {
    const { data, error } = await db().from('reviews').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapReview);
  },
  async create(r: any) {
    const { error } = await db().from('reviews').insert([{
      product_id: r.productId,
      user_id: r.userId,
      user_name: r.userName,
      rating: r.rating,
      comment: r.comment,
    }]);
    if (error) throw error;
  },
};

// ─── Offers ──────────────────────────────────────────────
export const offersService = {
  async getAll() {
    const { data, error } = await db().from('offers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapOffer);
  },
  async create(o: any) {
    const { error } = await db().from('offers').insert([mapOfferToDb(o)]);
    if (error) throw error;
  },
  async update(id: string, o: any) {
    const { error } = await db().from('offers').update(mapOfferToDb(o)).eq('id', id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await db().from('offers').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Admin Users ─────────────────────────────────────────
export const adminService = {
  async getAll() {
    const { data, error } = await db().from('admin_users').select('*');
    if (error) throw error;
    return (data || []).map(mapAdmin);
  },
  async login(username: string, password: string) {
    const { data } = await db().from('admin_users').select('*').eq('username', username).eq('password', password).eq('is_active', true).single();
    return data ? mapAdmin(data) : null;
  },
  async create(a: any) {
    const { error } = await db().from('admin_users').insert([mapAdminToDb(a)]);
    if (error) throw error;
  },
  async update(id: string, a: any) {
    const { error } = await db().from('admin_users').update(mapAdminToDb(a)).eq('id', id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await db().from('admin_users').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Customers ───────────────────────────────────────────
export const customersService = {
  async getAll() {
    const { data, error } = await db().from('customer_profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  async getByPhone(phone: string) {
    const { data } = await db().from('customer_profiles').select('*').eq('phone', phone).single();
    return data || null;
  },
  async create(c: any) {
    const { data, error } = await db().from('customer_profiles').insert([{
      name: c.name,
      phone: c.phone,
    }]).select().single();
    if (error) throw error;
    return data;
  },
  async update(id: string, partial: any) {
    const mapped: any = {};
    if (partial.name !== undefined) mapped.name = partial.name;
    if (partial.isActive !== undefined) mapped.is_active = partial.isActive;
    if (partial.totalOrders !== undefined) mapped.total_orders = partial.totalOrders;
    if (partial.totalSpent !== undefined) mapped.total_spent = partial.totalSpent;
    if (partial.favorites !== undefined) mapped.favorites = partial.favorites;
    const { error } = await db().from('customer_profiles').update(mapped).eq('id', id);
    if (error) throw error;
  },
};

// ─── OTP ─────────────────────────────────────────────────
export const otpService = {
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },
  async store(phone: string, otp: string) {
    // Invalidate previous OTPs for this phone
    await db().from('otp_verifications').update({ used: true }).eq('phone', phone).eq('used', false);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
    const { error } = await db().from('otp_verifications').insert([{ phone, otp, expires_at: expiresAt }]);
    if (error) throw error;
  },
  async verify(phone: string, otp: string): Promise<boolean> {
    const { data } = await db()
      .from('otp_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('otp', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();
    if (!data) return false;
    await db().from('otp_verifications').update({ used: true }).eq('id', data.id);
    return true;
  },
};

// ─── Settings ────────────────────────────────────────────
export const settingsService = {
  async get() {
    const [settingsRes, citiesRes, banksRes] = await Promise.all([
      db().from('app_settings').select('*').eq('id', 'main').single(),
      db().from('delivery_cities').select('*'),
      db().from('payment_banks').select('*'),
    ]);
    const s = settingsRes.data;
    return {
      appLogoUrl: s?.app_logo_url || '',
      heroBanners: s?.hero_banners || [],
      adminWhatsApp: s?.admin_whatsapp || '967782282586',
      welcomeMessage: s?.welcome_message || '',
      deliveryCities: (citiesRes.data || []).map((c: any) => ({
        id: c.id, nameAr: c.name_ar, nameEn: c.name_en, fee: c.fee, isActive: c.is_active,
      })),
      paymentBanks: (banksRes.data || []).map((b: any) => ({
        id: b.id, nameAr: b.name_ar, nameEn: b.name_en,
        accountNumber: b.account_number, accountName: b.account_name, isActive: b.is_active,
      })),
    };
  },
  async update(partial: any) {
    const mapped: any = { updated_at: new Date().toISOString() };
    if (partial.appLogoUrl !== undefined) mapped.app_logo_url = partial.appLogoUrl;
    if (partial.heroBanners !== undefined) mapped.hero_banners = partial.heroBanners;
    if (partial.adminWhatsApp !== undefined) mapped.admin_whatsapp = partial.adminWhatsApp;
    if (partial.welcomeMessage !== undefined) mapped.welcome_message = partial.welcomeMessage;
    await db().from('app_settings').upsert([{ id: 'main', ...mapped }]);
    if (partial.deliveryCities) {
      for (const c of partial.deliveryCities) {
        await db().from('delivery_cities').upsert([{
          id: c.id, name_ar: c.nameAr, name_en: c.nameEn, fee: c.fee, is_active: c.isActive,
        }]);
      }
    }
    if (partial.paymentBanks) {
      for (const b of partial.paymentBanks) {
        await db().from('payment_banks').upsert([{
          id: b.id, name_ar: b.nameAr, name_en: b.nameEn,
          account_number: b.accountNumber, account_name: b.accountName, is_active: b.isActive,
        }]);
      }
    }
  },
};

// ─── Search Analytics ─────────────────────────────────────
export const searchService = {
  async record(query: string) {
    if (!query.trim()) return;
    const q = query.toLowerCase().trim();
    const { data } = await db().from('search_analytics').select('id, count').eq('query', q).single();
    if (data) {
      await db().from('search_analytics').update({ count: data.count + 1, updated_at: new Date().toISOString() }).eq('id', data.id);
    } else {
      await db().from('search_analytics').insert([{ query: q, count: 1 }]);
    }
  },
  async getAnalytics() {
    const { data } = await db().from('search_analytics').select('query, count').order('count', { ascending: false }).limit(50);
    return (data || []) as { query: string; count: number }[];
  },
};

// ─── Mappers ─────────────────────────────────────────────
function mapProduct(d: any) {
  return {
    id: d.id,
    nameAr: d.name_ar,
    nameEn: d.name_en,
    descriptionAr: d.description_ar || '',
    descriptionEn: d.description_en || '',
    price: d.price,
    originalPrice: d.original_price,
    images: d.images || [],
    category: d.category,
    sizes: d.sizes || [],
    colors: d.colors || [],
    stock: d.stock,
    sold: d.sold,
    rating: parseFloat(d.rating) || 0,
    reviewCount: d.review_count,
    isOffer: d.is_offer,
    offerPercent: d.offer_percent,
    isNew: d.is_new,
    isFeatured: d.is_featured,
    isVisible: d.is_visible,
    createdAt: d.created_at,
  };
}
function mapProductToDb(p: any) {
  return {
    name_ar: p.nameAr,
    name_en: p.nameEn,
    description_ar: p.descriptionAr || '',
    description_en: p.descriptionEn || '',
    price: p.price,
    original_price: p.originalPrice || null,
    images: p.images || [],
    category: p.category,
    sizes: p.sizes || [],
    colors: p.colors || [],
    stock: p.stock,
    sold: p.sold || 0,
    rating: p.rating || 0,
    review_count: p.reviewCount || 0,
    is_offer: p.isOffer || false,
    offer_percent: p.offerPercent || null,
    is_new: p.isNew || false,
    is_featured: p.isFeatured || false,
    is_visible: p.isVisible !== false,
  };
}
function mapOrder(o: any, items: any[]) {
  return {
    id: o.id,
    orderNumber: o.order_number,
    userId: o.user_id,
    userName: o.user_name,
    userPhone: o.user_phone,
    items: items.map(i => ({
      productId: i.product_id,
      productName: i.product_name,
      price: i.price,
      quantity: i.quantity,
      size: i.size,
      color: i.color,
      image: i.image || '',
    })),
    subtotal: o.subtotal,
    deliveryFee: o.delivery_fee,
    discount: o.discount,
    total: o.total,
    city: o.city,
    address: o.address,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
    paymentScreenshot: o.payment_screenshot,
    status: o.status,
    couponCode: o.coupon_code,
    notes: o.notes,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}
function mapOrderToDb(o: any) {
  return {
    order_number: o.orderNumber,
    user_id: o.userId,
    user_name: o.userName,
    user_phone: o.userPhone,
    subtotal: o.subtotal,
    delivery_fee: o.deliveryFee,
    discount: o.discount,
    total: o.total,
    city: o.city,
    address: o.address,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    payment_screenshot: o.paymentScreenshot || null,
    status: o.status,
    coupon_code: o.couponCode || null,
    notes: o.notes || null,
  };
}
function mapOrderItemToDb(i: any) {
  return {
    product_id: i.productId,
    product_name: i.productName,
    price: i.price,
    quantity: i.quantity,
    size: i.size,
    color: i.color,
    image: i.image || '',
  };
}
function mapCoupon(c: any) {
  return {
    id: c.id,
    code: c.code,
    discount: c.discount,
    type: c.type as 'percent' | 'fixed',
    minOrder: c.min_order,
    maxUses: c.max_uses,
    usedCount: c.used_count,
    isActive: c.is_active,
    expiresAt: c.expires_at,
  };
}
function mapCouponToDb(c: any) {
  return {
    code: c.code,
    discount: c.discount,
    type: c.type,
    min_order: c.minOrder || 0,
    max_uses: c.maxUses || 100,
    used_count: c.usedCount || 0,
    is_active: c.isActive !== false,
    expires_at: c.expiresAt || null,
  };
}
function mapReview(r: any) {
  return {
    id: r.id,
    productId: r.product_id,
    userId: r.user_id,
    userName: r.user_name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  };
}
function mapOffer(o: any) {
  return {
    id: o.id,
    titleAr: o.title_ar,
    titleEn: o.title_en,
    descriptionAr: o.description_ar || '',
    descriptionEn: o.description_en || '',
    image: o.image || '',
    discount: o.discount,
    category: o.category,
    isActive: o.is_active,
    expiresAt: o.expires_at,
  };
}
function mapOfferToDb(o: any) {
  return {
    title_ar: o.titleAr,
    title_en: o.titleEn,
    description_ar: o.descriptionAr || '',
    description_en: o.descriptionEn || '',
    image: o.image || '',
    discount: o.discount,
    category: o.category || null,
    is_active: o.isActive !== false,
    expires_at: o.expiresAt || null,
  };
}
function mapAdmin(a: any) {
  return {
    id: a.id,
    name: a.name,
    phone: a.phone,
    username: a.username,
    password: a.password,
    isSuperAdmin: a.is_super_admin,
    permissions: a.permissions || [],
    isActive: a.is_active,
    createdAt: a.created_at,
  };
}
function mapAdminToDb(a: any) {
  return {
    name: a.name,
    phone: a.phone,
    username: a.username,
    password: a.password,
    is_super_admin: a.isSuperAdmin || false,
    permissions: a.permissions || [],
    is_active: a.isActive !== false,
  };
}
