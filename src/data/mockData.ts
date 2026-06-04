import { Category, Product, Order, Coupon, Notification, WalletTransaction, RiderOrder } from '../types';

// ─── Categories ────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Grocery', nameHindi: 'किराना', slug: 'grocery', iconName: 'storefront', color: '#FFF3E0', productCount: 120 },
  { id: 'cat-2', name: 'Fruits', nameHindi: 'फल', slug: 'fruits', iconName: 'nutrition', color: '#FCE4EC', productCount: 45 },
  { id: 'cat-3', name: 'Vegetables', nameHindi: 'सब्जियां', slug: 'vegetables', iconName: 'eco', color: '#E8F5E9', productCount: 68 },
  { id: 'cat-4', name: 'Dairy', nameHindi: 'डेयरी', slug: 'dairy', iconName: 'water_drop', color: '#E3F2FD', productCount: 32 },
  { id: 'cat-5', name: 'Medicines', nameHindi: 'दवाइयां', slug: 'medicines', iconName: 'medication', color: '#EDE7F6', productCount: 89 },
  { id: 'cat-6', name: 'Snacks', nameHindi: 'नाश्ता', slug: 'snacks', iconName: 'cookie', color: '#FFF8E1', productCount: 56 },
  { id: 'cat-7', name: 'Beverages', nameHindi: 'पेय', slug: 'beverages', iconName: 'local_cafe', color: '#E0F7FA', productCount: 41 },
  { id: 'cat-8', name: 'Electronics', nameHindi: 'इलेक्ट्रॉनिक्स', slug: 'electronics', iconName: 'devices', color: '#F3E5F5', productCount: 28 },
  { id: 'cat-9', name: 'Stationery', nameHindi: 'स्टेशनरी', slug: 'stationery', iconName: 'edit', color: '#E8EAF6', productCount: 34 },
  { id: 'cat-10', name: 'Personal Care', nameHindi: 'व्यक्तिगत देखभाल', slug: 'personal-care', iconName: 'spa', color: '#FBE9E7', productCount: 52 },
];

// ─── Products ─────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  // Grocery
  { id: 'p1', categoryId: 'cat-1', name: 'Aashirvaad Atta', nameHindi: 'आशीर्वाद आटा', price: 285, mrp: 320, unit: '5 kg', stockQuantity: 50, isActive: true, isFeatured: true, isFresh: false, images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'], tags: ['atta', 'wheat', 'flour'], discountPercent: 11 },
  { id: 'p2', categoryId: 'cat-1', name: 'Fortune Basmati Rice', nameHindi: 'फॉर्च्यून बासमती चावल', price: 199, mrp: 230, unit: '1 kg', stockQuantity: 80, isActive: true, isFeatured: true, isFresh: false, images: ['https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400'], tags: ['rice', 'basmati'], discountPercent: 13 },
  { id: 'p3', categoryId: 'cat-1', name: 'Tata Salt', nameHindi: 'टाटा नमक', price: 28, mrp: 30, unit: '1 kg', stockQuantity: 200, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400'], tags: ['salt', 'iodized'], discountPercent: 7 },
  { id: 'p4', categoryId: 'cat-1', name: 'Saffola Gold Oil', nameHindi: 'सफोला गोल्ड तेल', price: 240, mrp: 265, unit: '1 L', stockQuantity: 40, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400'], tags: ['oil', 'cooking'], discountPercent: 9 },
  { id: 'p5', categoryId: 'cat-1', name: 'Tata Dal Masoor', nameHindi: 'मसूर दाल', price: 115, mrp: 130, unit: '500 g', stockQuantity: 60, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400'], tags: ['dal', 'lentils', 'masoor'], discountPercent: 12 },
  { id: 'p6', categoryId: 'cat-1', name: 'MDH Kitchen King Masala', nameHindi: 'एमडीएच मसाला', price: 89, mrp: 100, unit: '100 g', stockQuantity: 90, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400'], tags: ['masala', 'spice'], discountPercent: 11 },

  // Fruits
  { id: 'p7', categoryId: 'cat-2', name: 'Fresh Bananas', nameHindi: 'केला', price: 48, mrp: 60, unit: '1 dozen', stockQuantity: 30, isActive: true, isFeatured: true, isFresh: true, images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400'], tags: ['banana', 'fruit'], discountPercent: 20 },
  { id: 'p8', categoryId: 'cat-2', name: 'Red Apple (Imported)', nameHindi: 'सेब', price: 180, mrp: 220, unit: '1 kg', stockQuantity: 25, isActive: true, isFeatured: true, isFresh: true, images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'], tags: ['apple', 'fruit'], discountPercent: 18 },
  { id: 'p9', categoryId: 'cat-2', name: 'Sweet Orange', nameHindi: 'संतरा', price: 85, mrp: 100, unit: '1 kg', stockQuantity: 40, isActive: true, isFeatured: false, isFresh: true, images: ['https://images.unsplash.com/photo-1547514701-42782101795e?w=400'], tags: ['orange', 'fruit'], discountPercent: 15 },
  { id: 'p10', categoryId: 'cat-2', name: 'Papaya', nameHindi: 'पपीता', price: 65, mrp: 80, unit: '1 pc (~800g)', stockQuantity: 20, isActive: true, isFeatured: false, isFresh: true, images: ['https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400'], tags: ['papaya', 'fruit'], discountPercent: 19 },
  { id: 'p11', categoryId: 'cat-2', name: 'Mango Alphonso', nameHindi: 'अल्फांसो आम', price: 320, mrp: 380, unit: '1 kg', stockQuantity: 15, isActive: true, isFeatured: true, isFresh: true, images: ['https://images.unsplash.com/photo-1595475038784-bbe439ff41e6?w=400'], tags: ['mango', 'alphonso', 'fruit'], discountPercent: 16 },

  // Vegetables
  { id: 'p12', categoryId: 'cat-3', name: 'Fresh Tomatoes', nameHindi: 'टमाटर', price: 35, mrp: 45, unit: '1 kg', stockQuantity: 50, isActive: true, isFeatured: true, isFresh: true, images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'], tags: ['tomato', 'vegetable'], discountPercent: 22 },
  { id: 'p13', categoryId: 'cat-3', name: 'Potato', nameHindi: 'आलू', price: 28, mrp: 35, unit: '1 kg', stockQuantity: 100, isActive: true, isFeatured: false, isFresh: true, images: ['https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=400'], tags: ['potato', 'aloo', 'vegetable'], discountPercent: 20 },
  { id: 'p14', categoryId: 'cat-3', name: 'Onion', nameHindi: 'प्याज', price: 32, mrp: 40, unit: '1 kg', stockQuantity: 80, isActive: true, isFeatured: false, isFresh: true, images: ['https://images.unsplash.com/photo-1508313880080-c4bef0730395?w=400'], tags: ['onion', 'pyaaz', 'vegetable'], discountPercent: 20 },
  { id: 'p15', categoryId: 'cat-3', name: 'Spinach (Palak)', nameHindi: 'पालक', price: 25, mrp: 30, unit: '250 g', stockQuantity: 35, isActive: true, isFeatured: true, isFresh: true, images: ['https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400'], tags: ['spinach', 'palak', 'greens'], discountPercent: 17 },
  { id: 'p16', categoryId: 'cat-3', name: 'Cauliflower', nameHindi: 'फूलगोभी', price: 42, mrp: 55, unit: '1 pc (~500g)', stockQuantity: 30, isActive: true, isFeatured: false, isFresh: true, images: ['https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=400'], tags: ['cauliflower', 'gobhi', 'vegetable'], discountPercent: 24 },
  { id: 'p17', categoryId: 'cat-3', name: 'Lady Finger (Bhindi)', nameHindi: 'भिंडी', price: 38, mrp: 50, unit: '500 g', stockQuantity: 45, isActive: true, isFeatured: false, isFresh: true, images: ['https://images.unsplash.com/photo-1628773822503-930a7eaecf80?w=400'], tags: ['okra', 'bhindi', 'vegetable'], discountPercent: 24 },

  // Dairy
  { id: 'p18', categoryId: 'cat-4', name: 'Amul Gold Milk', nameHindi: 'अमूल गोल्ड दूध', price: 68, mrp: 72, unit: '1 L', stockQuantity: 60, isActive: true, isFeatured: true, isFresh: true, images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'], tags: ['milk', 'amul', 'dairy'], discountPercent: 6 },
  { id: 'p19', categoryId: 'cat-4', name: 'Amul Butter', nameHindi: 'अमूल मक्खन', price: 55, mrp: 60, unit: '100 g', stockQuantity: 40, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400'], tags: ['butter', 'amul', 'dairy'], discountPercent: 8 },
  { id: 'p20', categoryId: 'cat-4', name: 'Nestle Dahi (Curd)', nameHindi: 'दही', price: 44, mrp: 50, unit: '400 g', stockQuantity: 35, isActive: true, isFeatured: false, isFresh: true, images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'], tags: ['curd', 'dahi', 'yogurt'], discountPercent: 12 },
  { id: 'p21', categoryId: 'cat-4', name: 'Amul Paneer', nameHindi: 'पनीर', price: 115, mrp: 130, unit: '200 g', stockQuantity: 25, isActive: true, isFeatured: true, isFresh: true, images: ['https://images.unsplash.com/photo-1631452180775-8e8c7e7d9a1d?w=400'], tags: ['paneer', 'cottage cheese', 'dairy'], discountPercent: 12 },

  // Medicines
  { id: 'p22', categoryId: 'cat-5', name: 'Dettol Antiseptic', nameHindi: 'डेटॉल एंटीसेप्टिक', price: 95, mrp: 115, unit: '250 ml', stockQuantity: 30, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'], tags: ['dettol', 'antiseptic', 'medicine'], discountPercent: 17 },
  { id: 'p23', categoryId: 'cat-5', name: 'Vicks VapoRub', nameHindi: 'विक्स वेपोरब', price: 72, mrp: 80, unit: '25 g', stockQuantity: 45, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'], tags: ['vicks', 'cold', 'medicine'], discountPercent: 10 },
  { id: 'p24', categoryId: 'cat-5', name: 'Band-Aid Strips', nameHindi: 'बैंड-एड', price: 42, mrp: 50, unit: '20 strips', stockQuantity: 60, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'], tags: ['bandaid', 'first aid'], discountPercent: 16 },

  // Snacks
  { id: 'p25', categoryId: 'cat-6', name: 'Lay\'s Magic Masala', nameHindi: 'लेज़ चिप्स', price: 20, mrp: 20, unit: '26 g', stockQuantity: 100, isActive: true, isFeatured: true, isFresh: false, images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'], tags: ['chips', 'lays', 'snack'], discountPercent: 0 },
  { id: 'p26', categoryId: 'cat-6', name: 'Britannia Bourbon', nameHindi: 'बॉर्बन बिस्कुट', price: 35, mrp: 40, unit: '150 g', stockQuantity: 80, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'], tags: ['biscuit', 'bourbon', 'snack'], discountPercent: 13 },
  { id: 'p27', categoryId: 'cat-6', name: 'Haldiram Bhujia', nameHindi: 'हल्दीराम भुजिया', price: 65, mrp: 75, unit: '200 g', stockQuantity: 60, isActive: true, isFeatured: true, isFresh: false, images: ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400'], tags: ['bhujia', 'haldiram', 'namkeen'], discountPercent: 13 },
  { id: 'p28', categoryId: 'cat-6', name: 'Kurkure Masala Munch', nameHindi: 'कुरकुरे', price: 20, mrp: 20, unit: '90 g', stockQuantity: 90, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'], tags: ['kurkure', 'snack', 'masala'], discountPercent: 0 },

  // Beverages
  { id: 'p29', categoryId: 'cat-7', name: 'Coca-Cola Can', nameHindi: 'कोका-कोला', price: 50, mrp: 55, unit: '330 ml', stockQuantity: 70, isActive: true, isFeatured: true, isFresh: false, images: ['https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'], tags: ['cola', 'soda', 'cold drink'], discountPercent: 9 },
  { id: 'p30', categoryId: 'cat-7', name: 'Red Bull Energy Drink', nameHindi: 'रेड बुल', price: 125, mrp: 135, unit: '250 ml', stockQuantity: 40, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400'], tags: ['energy drink', 'red bull'], discountPercent: 7 },
  { id: 'p31', categoryId: 'cat-7', name: 'Tata Tea Premium', nameHindi: 'टाटा चाय', price: 190, mrp: 215, unit: '500 g', stockQuantity: 55, isActive: true, isFeatured: true, isFresh: false, images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'], tags: ['tea', 'chai', 'tata'], discountPercent: 12 },
  { id: 'p32', categoryId: 'cat-7', name: 'Tropicana Orange Juice', nameHindi: 'ट्रॉपिकाना', price: 95, mrp: 110, unit: '1 L', stockQuantity: 30, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'], tags: ['juice', 'orange', 'tropicana'], discountPercent: 14 },

  // Electronics
  { id: 'p33', categoryId: 'cat-8', name: 'Syska LED Bulb 9W', nameHindi: 'एलईडी बल्ब', price: 89, mrp: 120, unit: '1 pc', stockQuantity: 50, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], tags: ['bulb', 'led', 'syska'], discountPercent: 26 },
  { id: 'p34', categoryId: 'cat-8', name: 'AAA Batteries (Duracell)', nameHindi: 'बैटरी', price: 85, mrp: 100, unit: '4 pcs', stockQuantity: 80, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400'], tags: ['battery', 'aaa', 'duracell'], discountPercent: 15 },

  // Personal Care
  { id: 'p35', categoryId: 'cat-10', name: 'Dove Body Wash', nameHindi: 'डव बॉडी वॉश', price: 210, mrp: 250, unit: '250 ml', stockQuantity: 35, isActive: true, isFeatured: true, isFresh: false, images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400'], tags: ['body wash', 'dove', 'shower'], discountPercent: 16 },
  { id: 'p36', categoryId: 'cat-10', name: 'Colgate MaxFresh Toothpaste', nameHindi: 'कोलगेट', price: 72, mrp: 80, unit: '150 g', stockQuantity: 65, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400'], tags: ['toothpaste', 'colgate'], discountPercent: 10 },
  { id: 'p37', categoryId: 'cat-10', name: 'Head & Shoulders Shampoo', nameHindi: 'हेड एंड शोल्डर', price: 165, mrp: 190, unit: '180 ml', stockQuantity: 40, isActive: true, isFeatured: false, isFresh: false, images: ['https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400'], tags: ['shampoo', 'head and shoulders', 'hair'], discountPercent: 13 },
];

// ─── Featured / Flash Sale Products ───────────────────────────
export const FLASH_SALE_PRODUCTS = PRODUCTS.filter(p => (p.discountPercent ?? 0) >= 15).slice(0, 8);
export const FEATURED_PRODUCTS = PRODUCTS.filter(p => p.isFeatured);
export const FRESH_PRODUCTS = PRODUCTS.filter(p => p.isFresh);

// ─── Mock Coupons ─────────────────────────────────────────────
export const COUPONS: Coupon[] = [
  { id: 'c1', code: 'WELCOME30', description: 'Get ₹30 off on your first order', discountType: 'flat', discountValue: 30, minOrderValue: 100, isApplied: false },
  { id: 'c2', code: 'FRESH20', description: 'Get 20% off on fresh vegetables & fruits', discountType: 'percent', discountValue: 20, maxDiscount: 60, minOrderValue: 150, isApplied: false },
  { id: 'c3', code: 'CHAPRA50', description: 'Special Chapra offer — ₹50 off above ₹300', discountType: 'flat', discountValue: 50, minOrderValue: 300, isApplied: false },
  { id: 'c4', code: 'FREEDEL', description: 'Free delivery on your next order', discountType: 'flat', discountValue: 25, minOrderValue: 199, isApplied: false },
];

// ─── Mock Orders ──────────────────────────────────────────────
export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1', orderNumber: 'CB-2024-00156',
    customerId: 'user-1', riderId: 'rider-1',
    riderName: 'Rajan Kumar', riderPhone: '+917654321098', riderRating: 4.8,
    address: { id: 'addr-1', label: 'Home', fullAddress: 'Plot 12, Sadar Bazaar, near SBI Bank', landmark: 'Near SBI Bank', lat: 25.7740, lng: 84.7374, city: 'Chapra', state: 'Bihar', pincode: '841301', isDefault: true },
    items: [
      { id: 'oi-1', productId: 'p18', name: 'Amul Gold Milk', price: 68, quantity: 2, unit: '1 L', imageUrl: PRODUCTS[17].images[0] },
      { id: 'oi-2', productId: 'p7', name: 'Fresh Bananas', price: 48, quantity: 1, unit: '1 dozen', imageUrl: PRODUCTS[6].images[0] },
    ],
    status: 'out_for_delivery', subtotal: 184, deliveryFee: 20, platformFee: 5, discount: 0, couponDiscount: 0, total: 209,
    paymentMethod: 'cod', paymentStatus: 'pending', estimatedMinutes: 12, deliveryOtp: '4829',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'ord-2', orderNumber: 'CB-2024-00154',
    customerId: 'user-1',
    address: { id: 'addr-1', label: 'Home', fullAddress: 'Plot 12, Sadar Bazaar, near SBI Bank', landmark: 'Near SBI Bank', lat: 25.7740, lng: 84.7374, city: 'Chapra', state: 'Bihar', pincode: '841301', isDefault: true },
    items: [
      { id: 'oi-3', productId: 'p1', name: 'Aashirvaad Atta', price: 285, quantity: 1, unit: '5 kg', imageUrl: PRODUCTS[0].images[0] },
      { id: 'oi-4', productId: 'p18', name: 'Amul Gold Milk', price: 68, quantity: 3, unit: '1 L', imageUrl: PRODUCTS[17].images[0] },
    ],
    status: 'delivered', subtotal: 489, deliveryFee: 0, platformFee: 5, discount: 50, couponDiscount: 50, total: 444,
    paymentMethod: 'upi', paymentStatus: 'success',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60000 + 28 * 60000).toISOString(),
  },
  {
    id: 'ord-3', orderNumber: 'CB-2024-00149',
    customerId: 'user-1',
    address: { id: 'addr-1', label: 'Home', fullAddress: 'Plot 12, Sadar Bazaar, near SBI Bank', landmark: 'Near SBI Bank', lat: 25.7740, lng: 84.7374, city: 'Chapra', state: 'Bihar', pincode: '841301', isDefault: true },
    items: [
      { id: 'oi-5', productId: 'p29', name: 'Coca-Cola Can', price: 50, quantity: 4, unit: '330 ml', imageUrl: PRODUCTS[28].images[0] },
      { id: 'oi-6', productId: 'p25', name: "Lay's Magic Masala", price: 20, quantity: 3, unit: '26 g', imageUrl: PRODUCTS[24].images[0] },
    ],
    status: 'delivered', subtotal: 260, deliveryFee: 20, platformFee: 5, discount: 0, couponDiscount: 0, total: 285,
    paymentMethod: 'wallet', paymentStatus: 'success',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
    deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60000 + 22 * 60000).toISOString(),
  },
];

// ─── Mock Rider Orders ─────────────────────────────────────────
export const RIDER_AVAILABLE_ORDERS: RiderOrder[] = [
  { id: 'ro-1', orderNumber: '9928', storeName: 'Chapra Kitchen', storeIcon: 'restaurant', storeType: 'restaurant', distanceKm: 1.2, payout: 125, bonus: 20, hasBonus: true, itemImages: [PRODUCTS[28].images[0], PRODUCTS[24].images[0]], customerName: 'Priya Singh', customerAddress: 'Sadar Bazaar, Chapra' },
  { id: 'ro-2', orderNumber: '9931', storeName: 'Fresh Bazaar', storeIcon: 'shopping_basket', storeType: 'grocery', distanceKm: 2.8, payout: 85, hasBonus: false, expiresInSeconds: 240, itemImages: [PRODUCTS[6].images[0]], customerName: 'Ramesh Yadav', customerAddress: 'Station Road, Chapra' },
  { id: 'ro-3', orderNumber: '9933', storeName: 'MedPlus Pharmacy', storeIcon: 'medication', storeType: 'pharmacy', distanceKm: 0.9, payout: 65, hasBonus: false, itemImages: [PRODUCTS[21].images[0]], customerName: 'Anita Kumari', customerAddress: 'Kotwali Chowk, Chapra' },
];

// ─── Mock Notifications ───────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Order Out for Delivery! 🛵', body: 'Rajan Kumar is on the way. Estimated: 12 minutes.', type: 'order_update', isRead: false, createdAt: new Date(Date.now() - 10 * 60000).toISOString() },
  { id: 'n2', title: '🎉 Flash Sale Alert!', body: '20% off on all fresh vegetables. Only for next 2 hours!', type: 'offer', isRead: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'n3', title: 'Order Delivered ✅', body: 'Your order CB-2024-00154 has been delivered. Rate your experience!', type: 'order_update', isRead: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString() },
  { id: 'n4', title: '₹50 added to Wallet', body: 'Your referral reward has been credited. Invite more friends!', type: 'wallet', isRead: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString() },
];

// ─── Mock Wallet Transactions ─────────────────────────────────
export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: 'wt-1', type: 'credit', amount: 50, description: 'Referral reward — Priya joined', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString() },
  { id: 'wt-2', type: 'debit', amount: 50, description: 'Used in order #CB-2024-00154', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString() },
  { id: 'wt-3', type: 'credit', amount: 100, description: 'Added via UPI', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString() },
  { id: 'wt-4', type: 'debit', amount: 80, description: 'Used in order #CB-2024-00149', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000 + 30 * 60000).toISOString() },
];

// ─── Promotional Banners ──────────────────────────────────────
export const BANNERS = [
  { id: 'b1', title: 'Fresh Vegetables', subtitle: 'Up to 25% off today!', ctaLabel: 'Shop Now', gradient: ['#00B050', '#006E2F'], imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800', categorySlug: 'vegetables' },
  { id: 'b2', title: 'Dairy Essentials', subtitle: 'Delivered in 30 minutes', ctaLabel: 'Order Now', gradient: ['#3B82F6', '#1D4ED8'], imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800', categorySlug: 'dairy' },
  { id: 'b3', title: 'Chhath Puja Special 🪔', subtitle: 'Complete Puja Samagri Kit', ctaLabel: 'Explore', gradient: ['#FF6B00', '#A04100'], imageUrl: 'https://images.unsplash.com/photo-1610389801517-3e01c32a5d41?w=800', categorySlug: 'grocery' },
];
