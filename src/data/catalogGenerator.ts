import { Product } from '../types';

// Curated high-quality e-commerce style Unsplash photo IDs by category
const IMAGE_POOLS: Record<string, string[]> = {
  'cat-1': [ // Grocery
    'photo-1574323347407-f5e1ad6d020b', // Flour
    'photo-1586201375761-83865001e31c', // Rice
    'photo-1518110925495-5fe2fda0442c', // Salt
    'photo-1474979266404-7eaacbcd87c5', // Oil
    'photo-1596040033229-a9821ebd058d', // Spices
    'photo-1596547609652-9cf5d8d76921', // Dry Fruits
    'photo-1514432324607-a09d9b4aefdd', // Coffee/Tea
    'photo-1587049352846-4a222e784d38', // Honey
    'photo-1608686207856-001b95cf60ca', // Pulses
    'photo-1600271886742-f049cd451bba', // Oils/bottles
  ],
  'cat-2': [ // Fruits
    'photo-1571771894821-ce9b6c11b08e', // Bananas
    'photo-1560806887-1e4cd0b6cbd6', // Apples
    'photo-1547514701-42782101795e', // Oranges
    'photo-1553279768-865429fa0078', // Mango
    'photo-1537640538966-79f369143f8f', // Grapes
    'photo-1587049352851-8d4e89134292', // Watermelon
    'photo-1528825871115-3581a5387919', // Pineapple
    'photo-1585110396000-c9ffd4e4b308', // Kiwi
    'photo-1557800636-894a64c1696f', // Papaya
    'photo-1589883661923-6476cb0ae9f2', // Lemon
  ],
  'cat-3': [ // Vegetables
    'photo-1595855759920-86582396756a', // Tomatoes
    'photo-1518977676601-b53f82aba655', // Potatoes
    'photo-1608797178974-15b35a61d121', // Onions
    'photo-1444731963756-b28605484454', // Carrots
    'photo-1584270354949-c26b0d5b4a0c', // Broccoli
    'photo-1576045057995-568f588f82fb', // Spinach
    'photo-1449300079324-964320297aa3', // Cucumbers
    'photo-1563565312-82c56b4430f8', // Bell peppers
    'photo-1615485290382-441e4d049cb5', // Garlic
    'photo-1592417817098-8f3d6eb19675', // Chillies
  ],
  'cat-4': [ // Dairy
    'photo-1550583724-b2692b85b150', // Milk
    'photo-1486299267070-8382e21b457e', // Cheese
    'photo-1589985270826-4b7bb135bc9d', // Butter
    'photo-1488477181946-6428a0291777', // Yogurt
    'photo-1506976785307-8732e854ad03', // Eggs
    'photo-1631452180775-8e8c7e7d9a1d', // Paneer
  ],
  'cat-5': [ // OTC Medicines
    'photo-1584308666744-24d5c474f2ae', // Pills
    'photo-1603398938378-e54eab446ddd', // Bandage
    'photo-1550572017-edd951b55104', // Vitamins
    'photo-1584622650111-993a426fbf0a', // Sanitizer
    'photo-1607613009820-a29f7bb81c04', // Medical First Aid
  ],
  'cat-6': [ // Snacks
    'photo-1566478989037-eec170784d0b', // Chips
    'photo-1499636136210-6f4ee912724e', // Cookies
    'photo-1578849278619-e73505e9610f', // Popcorn
    'photo-1549007994-cb92cf8a7a2d', // Chocolate
    'photo-1599490659213-e2b9527bd087', // Namkeen
    'photo-1558961363-fa8fdf82db35', // Biscuits
  ],
  'cat-7': [ // Beverages
    'photo-1622483767028-3f66f32aef97', // Soda
    'photo-1621506289937-a8e4df240d0b', // Juice
    'photo-1509042239860-f550ce710b93', // Coffee
    'photo-1608897013039-887f21d8c804', // Water
    'photo-1513558161293-cdaf765ed2fd', // Energy Drink
  ],
  'cat-8': [ // Electronics Accessories
    'photo-1505740420928-5e560c06d30e', // Earphones
    'photo-1583863788434-e58a36330cf0', // Charger Cable
    'photo-1605138173431-7e10583b4e4b', // Stand
    'photo-1609592424365-1d041a8e104e', // Power Bank
    'photo-1558618666-fcd25c85cd64', // LED Bulb
  ],
  'cat-9': [ // Stationery
    'photo-1531346878377-a5be20888e57', // Notebook
    'photo-1583485088034-697b5bc54ccd', // Pens
    'photo-1503792503809-2234562523de', // Scissors
    'photo-1513364776144-60967b0f800f', // Markers
  ],
  'cat-10': [ // Personal Care
    'photo-1535585209827-a15fcdbc4c2d', // Shampoo
    'photo-1607006342431-bb236ffcfd81', // Soap
    'photo-1556228453-efd6c1ff04f6', // Face wash
    'photo-1594035910387-fea47794261f', // Lotion
    'photo-1522335789203-aabd1fc54bc9', // Makeup
  ],
};

function getUnsplashUrl(photoId: string): string {
  // Format for a square, high-res white background cropped e-commerce image
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1500&h=1500&q=80`;
}

interface SeedTemplate {
  name: string;
  brand: string;
  subcategory: string;
  basePrice: number;
  unit: string;
  tags: string[];
  description: string;
  shelfLife: string;
  storage: string;
  mfgOrigin: string;
  mfgName: string;
  gstPercent: number;
}

const CATEGORY_TEMPLATES: Record<string, { target: number; items: SeedTemplate[] }> = {
  'cat-1': { // Grocery - 100 Products
    target: 100,
    items: [
      { name: 'Basmati Rice Premium', brand: 'Fortune', subcategory: 'Rice & Grains', basePrice: 135, unit: '1 kg', tags: ['rice', 'basmati', 'grocery'], description: 'Premium extra long grain basmati rice, aged for fragrance and fluffy texture.', shelfLife: '24 Months', storage: 'Store in a cool dry place', mfgOrigin: 'India', mfgName: 'Adani Wilmar Ltd', gstPercent: 5 },
      { name: 'Chakki Fresh Atta', brand: 'Aashirvaad', subcategory: 'Atta & Flours', basePrice: 260, unit: '5 kg', tags: ['atta', 'flour', 'wheat', 'grocery'], description: '100% stone-ground whole wheat flour for soft and healthy rotis.', shelfLife: '3 Months', storage: 'Store in airtight container', mfgOrigin: 'India', mfgName: 'ITC Limited', gstPercent: 5 },
      { name: 'Refined Sugar', brand: 'Madhur', subcategory: 'Salt & Sugar', basePrice: 52, unit: '1 kg', tags: ['sugar', 'sweetener', 'grocery'], description: 'Sulfur-free double refined sugar crystals, pure and hygienic.', shelfLife: '36 Months', storage: 'Keep in dry container', mfgOrigin: 'India', mfgName: 'Renuka Sugars Ltd', gstPercent: 5 },
      { name: 'Iodized Salt', brand: 'Tata Salt', subcategory: 'Salt & Sugar', basePrice: 28, unit: '1 kg', tags: ['salt', 'iodized', 'grocery'], description: 'Vacuum evaporated iodized salt. Desh Ka Namak.', shelfLife: '60 Months', storage: 'Keep dry', mfgOrigin: 'India', mfgName: 'Tata Consumer Products', gstPercent: 5 },
      { name: 'Mustard Oil Pure', brand: 'Fortune', subcategory: 'Edible Oils', basePrice: 175, unit: '1 L', tags: ['oil', 'mustard', 'cooking'], description: 'Kachi Ghani pure mustard oil, cold-pressed to retain pungency.', shelfLife: '12 Months', storage: 'Store away from direct light', mfgOrigin: 'India', mfgName: 'Adani Wilmar Ltd', gstPercent: 5 },
      { name: 'Refined Sunflower Oil', brand: 'Saffola Gold', subcategory: 'Edible Oils', basePrice: 230, unit: '1 L', tags: ['oil', 'cooking', 'sunflower'], description: 'Pro-healthy lifestyle cooking oil with low absorb technology.', shelfLife: '12 Months', storage: 'Store in cool place', mfgOrigin: 'India', mfgName: 'Marico Limited', gstPercent: 5 },
      { name: 'Moong Dal Skinless', brand: 'Tata Sampann', subcategory: 'Dals & Pulses', basePrice: 95, unit: '500 g', tags: ['dal', 'pulses', 'moong', 'lentils'], description: 'Unpolished premium moong dal, rich in protein and fiber.', shelfLife: '12 Months', storage: 'Keep in dry airtight jar', mfgOrigin: 'India', mfgName: 'Tata Consumer Products', gstPercent: 5 },
      { name: 'Turmeric Powder Organic', brand: 'Everest', subcategory: 'Spices & Masalas', basePrice: 38, unit: '100 g', tags: ['turmeric', 'haldi', 'spice', 'masala'], description: 'Pure ground turmeric with high curcumin content for rich color.', shelfLife: '12 Months', storage: 'Keep dry and sealed', mfgOrigin: 'India', mfgName: 'S.N. Narendra & Co', gstPercent: 5 },
      { name: 'Premium Almonds', brand: 'Happilo', subcategory: 'Dry Fruits', basePrice: 220, unit: '200 g', tags: ['almonds', 'badam', 'dry fruits', 'nuts'], description: 'California almonds, crunchy, nutritious, and high in vitamin E.', shelfLife: '9 Months', storage: 'Refrigerate after opening', mfgOrigin: 'USA', mfgName: 'Happilo International', gstPercent: 12 },
      { name: 'Golden Raisins Kishmish', brand: 'Organic Tattva', subcategory: 'Dry Fruits', basePrice: 110, unit: '200 g', tags: ['raisins', 'kishmish', 'dry fruits'], description: 'Sweet seedless golden raisins, naturally dried and chemical-free.', shelfLife: '12 Months', storage: 'Store in dry place', mfgOrigin: 'India', mfgName: 'Mehrotra Consumer Products', gstPercent: 12 },
      { name: 'Premium Cashews Kaju', brand: 'Happilo', subcategory: 'Dry Fruits', basePrice: 275, unit: '200 g', tags: ['cashews', 'kaju', 'dry fruits'], description: 'Whole premium cashew nuts, rich in taste and essential minerals.', shelfLife: '9 Months', storage: 'Store in cool container', mfgOrigin: 'India', mfgName: 'Happilo International', gstPercent: 12 },
      { name: 'Pure Cow Ghee', brand: 'Amul', subcategory: 'Edible Oils', basePrice: 650, unit: '1 L', tags: ['ghee', 'dairy', 'cow ghee', 'grocery'], description: 'Traditional aromatic cow ghee made from fresh milk fat.', shelfLife: '12 Months', storage: 'Store in dry jar', mfgOrigin: 'India', mfgName: 'GCMMF (Amul)', gstPercent: 12 },
      { name: 'Black Pepper Ground', brand: 'Catch', subcategory: 'Spices & Masalas', basePrice: 65, unit: '100 g', tags: ['pepper', 'black pepper', 'spice'], description: 'Finely ground black pepper pods, hot and aromatic.', shelfLife: '12 Months', storage: 'Keep dry and sealed', mfgOrigin: 'India', mfgName: 'DS Group', gstPercent: 5 },
      { name: 'Red Chilli Powder Kutti', brand: 'Everest', subcategory: 'Spices & Masalas', basePrice: 42, unit: '100 g', tags: ['chilli', 'mirch', 'spice', 'red chilli'], description: 'Spicy ground red chilli flakes for vibrant color and heat.', shelfLife: '12 Months', storage: 'Store in dark air-tight jar', mfgOrigin: 'India', mfgName: 'S.N. Narendra & Co', gstPercent: 5 },
      { name: 'Whole Cumin Seeds Jeera', brand: 'Catch', subcategory: 'Spices & Masalas', basePrice: 85, unit: '100 g', tags: ['cumin', 'jeera', 'spice'], description: 'Handpicked whole cumin seeds, highly aromatic.', shelfLife: '12 Months', storage: 'Store dry', mfgOrigin: 'India', mfgName: 'DS Group', gstPercent: 5 },
    ]
  },
  'cat-2': { // Fruits - 60 Products
    target: 60,
    items: [
      { name: 'Banana Robusta', brand: 'Fresh Farms', subcategory: 'Fresh Fruits', basePrice: 50, unit: '1 dozen', tags: ['banana', 'fruit', 'fresh'], description: 'Sweet, fully ripe Robusta bananas, rich in potassium.', shelfLife: '4 Days', storage: 'Store at room temperature', mfgOrigin: 'India', mfgName: 'Local Farms chapra', gstPercent: 0 },
      { name: 'Royal Delicious Apple', brand: 'Shimla Fresh', subcategory: 'Fresh Fruits', basePrice: 190, unit: '1 kg', tags: ['apple', 'fruit', 'shimla'], description: 'Crisp and juicy red apples sourced fresh from Shimla orchards.', shelfLife: '10 Days', storage: 'Keep refrigerated', mfgOrigin: 'India', mfgName: 'Shimla Apple Growers', gstPercent: 0 },
      { name: 'Sweet Nagpur Orange', brand: 'Nagpur Orchards', subcategory: 'Fresh Fruits', basePrice: 110, unit: '1 kg', tags: ['orange', 'citrus', 'fruit'], description: 'Juicy, sweet Nagpur oranges, high in vitamin C.', shelfLife: '7 Days', storage: 'Keep cool', mfgOrigin: 'India', mfgName: 'Nagpur Citrogrowers', gstPercent: 0 },
      { name: 'Green Seedless Grapes', brand: 'Nashik Fresh', subcategory: 'Fresh Fruits', basePrice: 140, unit: '500 g', tags: ['grapes', 'angoor', 'fruit'], description: 'Sweet and crunchy Nashik seedless green grapes.', shelfLife: '5 Days', storage: 'Refrigerate in perforated bag', mfgOrigin: 'India', mfgName: 'Nashik Vineyards Co', gstPercent: 0 },
      { name: 'Alphonso Mango Premium', brand: 'Ratnagiri Direct', subcategory: 'Fresh Fruits', basePrice: 450, unit: '1 kg', tags: ['mango', 'alphonso', 'fruit', 'sweet'], description: 'Premium Ratnagiri Alphonso mangoes, rich, sweet, and aromatic.', shelfLife: '6 Days', storage: 'Store room temp till ripe', mfgOrigin: 'India', mfgName: 'Ratnagiri Farms', gstPercent: 0 },
      { name: 'Imported Kiwi Fruit', brand: 'Zespri', subcategory: 'Fresh Fruits', basePrice: 120, unit: '3 pcs', tags: ['kiwi', 'fruit', 'imported'], description: 'Tangy and sweet green kiwis imported from New Zealand.', shelfLife: '8 Days', storage: 'Refrigerate', mfgOrigin: 'New Zealand', mfgName: 'Zespri International', gstPercent: 0 },
      { name: 'Fresh Papaya', brand: 'Fresh Farms', subcategory: 'Fresh Fruits', basePrice: 70, unit: '1 pc (~1kg)', tags: ['papaya', 'fruit'], description: 'Semi-ripe fresh papaya, sweet and healthy for digestion.', shelfLife: '5 Days', storage: 'Keep cool', mfgOrigin: 'India', mfgName: 'Local Farms chapra', gstPercent: 0 },
      { name: 'Hybrid Watermelon', brand: 'Fresh Farms', subcategory: 'Fresh Fruits', basePrice: 80, unit: '1 pc (~3kg)', tags: ['watermelon', 'fruit', 'fresh'], description: 'Sweet, thirst-quenching watermelon with deep red pulp.', shelfLife: '7 Days', storage: 'Refrigerate after cutting', mfgOrigin: 'India', mfgName: 'Bihar Growers Coop', gstPercent: 0 },
    ]
  },
  'cat-3': { // Vegetables - 60 Products
    target: 60,
    items: [
      { name: 'Desi Tomato', brand: 'Farm Fresh', subcategory: 'Fresh Vegetables', basePrice: 38, unit: '1 kg', tags: ['tomato', 'tamatar', 'vegetable'], description: 'Juicy desi tomatoes, perfect for curries and salads.', shelfLife: '6 Days', storage: 'Store in cool place', mfgOrigin: 'India', mfgName: 'Local Growers Chapra', gstPercent: 0 },
      { name: 'New Potato (Aloo)', brand: 'Farm Fresh', subcategory: 'Fresh Vegetables', basePrice: 26, unit: '1 kg', tags: ['potato', 'aloo', 'vegetable'], description: 'Freshly harvested soil-free new potatoes.', shelfLife: '20 Days', storage: 'Store in dry dark place', mfgOrigin: 'India', mfgName: 'Bihar Potato Farms', gstPercent: 0 },
      { name: 'Spring Onion (Pyaaz)', brand: 'Farm Fresh', subcategory: 'Fresh Vegetables', basePrice: 34, unit: '1 kg', tags: ['onion', 'pyaaz', 'vegetable'], description: 'Medium-sized pungent red onions, high quality.', shelfLife: '15 Days', storage: 'Keep in ventilated bin', mfgOrigin: 'India', mfgName: 'Bihar Agri Corp', gstPercent: 0 },
      { name: 'Fresh Spinach Palak', brand: 'Green Garden', subcategory: 'Leafy Greens', basePrice: 20, unit: '250 g', tags: ['spinach', 'palak', 'greens', 'vegetable'], description: 'Iron-rich organic fresh spinach leaves, washed twice.', shelfLife: '3 Days', storage: 'Refrigerate wrapped in paper', mfgOrigin: 'India', mfgName: 'Green Garden Farms', gstPercent: 0 },
      { name: 'Fresh Cauliflower Gobhi', brand: 'Farm Fresh', subcategory: 'Fresh Vegetables', basePrice: 40, unit: '1 pc (~600g)', tags: ['cauliflower', 'gobhi', 'vegetable'], description: 'Crisp white cauliflower heads, insect-free checked.', shelfLife: '5 Days', storage: 'Refrigerate', mfgOrigin: 'India', mfgName: 'Local Growers Chapra', gstPercent: 0 },
      { name: 'Fresh Cucumber Kheera', brand: 'Farm Fresh', subcategory: 'Fresh Vegetables', basePrice: 30, unit: '500 g', tags: ['cucumber', 'kheera', 'vegetable'], description: 'Crisp green slicing cucumbers, cool and hydrating.', shelfLife: '6 Days', storage: 'Keep refrigerated', mfgOrigin: 'India', mfgName: 'Local Hydro Farms', gstPercent: 0 },
      { name: 'Green Capsicum Shimla Mirch', brand: 'Farm Fresh', subcategory: 'Fresh Vegetables', basePrice: 45, unit: '250 g', tags: ['capsicum', 'shimla mirch', 'vegetable'], description: 'Crunchy hybrid green bell peppers, fresh harvest.', shelfLife: '7 Days', storage: 'Keep cool', mfgOrigin: 'India', mfgName: 'Bihar Greenhouse Coop', gstPercent: 0 },
      { name: 'Organic Garlic Lahsun', brand: 'Green Garden', subcategory: 'Fresh Vegetables', basePrice: 60, unit: '100 g', tags: ['garlic', 'lahsun', 'spice'], description: 'Highly aromatic local garlic bulbs, dried and cleaned.', shelfLife: '30 Days', storage: 'Store in dry cool space', mfgOrigin: 'India', mfgName: 'Green Garden Farms', gstPercent: 0 },
    ]
  },
  'cat-4': { // Dairy - 50 Products
    target: 50,
    items: [
      { name: 'Gold Pasteurized Milk', brand: 'Amul', subcategory: 'Milk & Cream', basePrice: 68, unit: '1 L', tags: ['milk', 'amul', 'dairy'], description: 'Full cream pasteurized milk, pasteurized and homogenized.', shelfLife: '2 Days', storage: 'Keep refrigerated under 4C', mfgOrigin: 'India', mfgName: 'GCMMF Ltd (Amul)', gstPercent: 0 },
      { name: 'Salted Butter Cup', brand: 'Amul', subcategory: 'Butter & Spreads', basePrice: 56, unit: '100 g', tags: ['butter', 'amul', 'dairy'], description: 'Delicious, rich and creamy salted butter spread.', shelfLife: '120 Days', storage: 'Keep refrigerated under 4C', mfgOrigin: 'India', mfgName: 'GCMMF Ltd (Amul)', gstPercent: 12 },
      { name: 'Classic Fresh Curd Dahi', brand: 'Mother Dairy', subcategory: 'Curd & Yogurt', basePrice: 35, unit: '400 g', tags: ['curd', 'dahi', 'yogurt'], description: 'Thick and creamy classic pasteurized curd, probiotic.', shelfLife: '7 Days', storage: 'Keep refrigerated under 4C', mfgOrigin: 'India', mfgName: 'Mother Dairy Fruit & Veg', gstPercent: 5 },
      { name: 'Malai Paneer Fresh', brand: 'Amul', subcategory: 'Paneer & Tofu', basePrice: 120, unit: '200 g', tags: ['paneer', 'cottage cheese', 'dairy'], description: 'Soft malai cottage cheese cubes, rich in protein.', shelfLife: '15 Days', storage: 'Keep refrigerated under 4C', mfgOrigin: 'India', mfgName: 'GCMMF Ltd (Amul)', gstPercent: 5 },
      { name: 'Fresh Cream 25% Fat', brand: 'Amul', subcategory: 'Milk & Cream', basePrice: 65, unit: '250 ml', tags: ['cream', 'amul', 'dairy'], description: 'Low fat fresh cream, perfect for gravies and desserts.', shelfLife: '30 Days', storage: 'Keep refrigerated under 4C', mfgOrigin: 'India', mfgName: 'GCMMF Ltd (Amul)', gstPercent: 5 },
      { name: 'Processed Cheese Slices', brand: 'Amul', subcategory: 'Cheese & Cream', basePrice: 140, unit: '10 slices', tags: ['cheese', 'slice', 'dairy'], description: 'Creamy cheese slices, perfect for burgers and sandwiches.', shelfLife: '180 Days', storage: 'Keep refrigerated under 4C', mfgOrigin: 'India', mfgName: 'GCMMF Ltd (Amul)', gstPercent: 12 },
    ]
  },
  'cat-5': { // OTC Medicines - 50 Products
    target: 50,
    items: [
      { name: 'Antiseptic Liquid', brand: 'Dettol', subcategory: 'First Aid', basePrice: 110, unit: '250 ml', tags: ['dettol', 'antiseptic', 'medicine'], description: 'First aid antiseptic liquid for wound cleaning and disinfection.', shelfLife: '36 Months', storage: 'Store at room temperature', mfgOrigin: 'India', mfgName: 'Reckitt Benckiser India', gstPercent: 12 },
      { name: 'VapoRub Cough Cold Relief', brand: 'Vicks', subcategory: 'Cold & Cough', basePrice: 75, unit: '25 g', tags: ['vicks', 'vaporub', 'cold', 'ointment'], description: 'Relieves cough, cold, nasal congestion, and muscle aches.', shelfLife: '36 Months', storage: 'Keep lid tightly closed', mfgOrigin: 'India', mfgName: 'Procter & Gamble Hygiene', gstPercent: 12 },
      { name: 'Antiseptic Band-Aid Strips', brand: 'Johnson & Johnson', subcategory: 'First Aid', basePrice: 45, unit: '20 strips', tags: ['bandaid', 'plaster', 'first aid'], description: 'Breathable wash-proof medicated adhesive strips for cuts.', shelfLife: '60 Months', storage: 'Store in cool dry space', mfgOrigin: 'India', mfgName: 'Johnson & Johnson India Ltd', gstPercent: 12 },
      { name: 'Multivitamin Supplements', brand: 'Revital H', subcategory: 'Vitamins & Minerals', basePrice: 320, unit: '30 caps', tags: ['revital', 'multivitamin', 'capsules'], description: 'Daily health supplement with ginseng, vitamins, and minerals.', shelfLife: '24 Months', storage: 'Store in dry dark place', mfgOrigin: 'India', mfgName: 'Sun Pharmaceutical Ind Ltd', gstPercent: 18 },
      { name: 'Pain Relief Gel Fast Acting', brand: 'Volini', subcategory: 'Pain Relief', basePrice: 135, unit: '30 g', tags: ['volini', 'pain relief', 'gel', 'ointment'], description: 'Deep penetrating quick-absorbing gel for back and muscle pain.', shelfLife: '24 Months', storage: 'Do not freeze', mfgOrigin: 'India', mfgName: 'Sun Pharmaceutical Ind Ltd', gstPercent: 12 },
    ]
  },
  'cat-6': { // Snacks - 80 Products
    target: 80,
    items: [
      { name: 'Potato Chips Magic Masala', brand: 'Lays', subcategory: 'Chips & Crisps', basePrice: 20, unit: '50 g', tags: ['chips', 'lays', 'snack', 'masala'], description: 'Crisp potato chips flavored with a magic blend of spices.', shelfLife: '4 Months', storage: 'Consume immediately after opening', mfgOrigin: 'India', mfgName: 'PepsiCo India Holdings Pvt', gstPercent: 18 },
      { name: 'Aloo Bhujia Crispy', brand: 'Haldirams', subcategory: 'Namkeen & Savory', basePrice: 68, unit: '200 g', tags: ['bhujia', 'haldiram', 'namkeen', 'snack'], description: 'Classic spiced gram flour and moth bean noodle savory snack.', shelfLife: '6 Months', storage: 'Store in air-tight container', mfgOrigin: 'India', mfgName: 'Haldiram Foods Intl Ltd', gstPercent: 12 },
      { name: 'Bourbon Chocolate Biscuits', brand: 'Britannia', subcategory: 'Biscuits & Cookies', basePrice: 38, unit: '150 g', tags: ['biscuit', 'bourbon', 'chocolate', 'cookie'], description: 'Crunchy chocolate biscuits filled with sweet chocolate cream.', shelfLife: '6 Months', storage: 'Keep in dry container', mfgOrigin: 'India', mfgName: 'Britannia Industries Ltd', gstPercent: 18 },
      { name: 'Classic Salted Popcorn', brand: 'Act II', subcategory: 'Instant Snacks', basePrice: 15, unit: '30 g', tags: ['popcorn', 'act2', 'snack'], description: 'Delicious instant butter salted popcorn ready in 3 minutes.', shelfLife: '12 Months', storage: 'Store in dry cabinet', mfgOrigin: 'India', mfgName: 'ConAgra Foods India Pvt Ltd', gstPercent: 18 },
      { name: 'Digestive High Fiber Biscuits', brand: 'NutriChoice', subcategory: 'Biscuits & Cookies', basePrice: 42, unit: '150 g', tags: ['biscuit', 'digestive', 'healthy'], description: 'High fiber whole wheat digestive biscuits for gut health.', shelfLife: '6 Months', storage: 'Keep dry', mfgOrigin: 'India', mfgName: 'Britannia Industries Ltd', gstPercent: 18 },
      { name: 'Chocolate Chip Cookies', brand: 'Good Day', subcategory: 'Biscuits & Cookies', basePrice: 45, unit: '120 g', tags: ['cookies', 'chocolate', 'good day'], description: 'Rich cookies loaded with real chocolate chips.', shelfLife: '6 Months', storage: 'Store cool and dry', mfgOrigin: 'India', mfgName: 'Britannia Industries Ltd', gstPercent: 18 },
    ]
  },
  'cat-7': { // Beverages - 60 Products
    target: 60,
    items: [
      { name: 'Original Coca-Cola Can', brand: 'Coca-Cola', subcategory: 'Soft Drinks', basePrice: 40, unit: '330 ml', tags: ['coke', 'cola', 'soda', 'beverage'], description: 'Refreshing original taste sweet carbonated soft drink.', shelfLife: '9 Months', storage: 'Serve chilled', mfgOrigin: 'India', mfgName: 'Hindustan Coca-Cola Bev', gstPercent: 40 },
      { name: 'Energy Drink Original', brand: 'Red Bull', subcategory: 'Energy Drinks', basePrice: 125, unit: '250 ml', tags: ['redbull', 'energy', 'caffeine', 'beverage'], description: 'Vitalizes body and mind with caffeine and B vitamins.', shelfLife: '12 Months', storage: 'Best served ice-cold', mfgOrigin: 'Austria', mfgName: 'Red Bull GmbH', gstPercent: 40 },
      { name: 'Premium Assam Chai Tea', brand: 'Tata Tea', subcategory: 'Tea & Coffee', basePrice: 180, unit: '500 g', tags: ['tea', 'chai', 'beverage', 'tata'], description: 'Strong, rich CTC tea blend sourced from Assam gardens.', shelfLife: '12 Months', storage: 'Store in airtight jar', mfgOrigin: 'India', mfgName: 'Tata Consumer Products', gstPercent: 5 },
      { name: 'Natural Orange Fruit Juice', brand: 'Real', subcategory: 'Fruit Juices', basePrice: 110, unit: '1 L', tags: ['juice', 'orange', 'beverage'], description: '100% pasteurized natural sweet orange juice, no added colors.', shelfLife: '7 Months', storage: 'Refrigerate after opening', mfgOrigin: 'India', mfgName: 'Dabur India Limited', gstPercent: 12 },
      { name: 'Mineral Drinking Water', brand: 'Bisleri', subcategory: 'Water & Soda', basePrice: 20, unit: '1 L', tags: ['water', 'mineral water', 'beverage'], description: 'Ozonated purified mineral drinking water, double sealed.', shelfLife: '24 Months', storage: 'Keep away from sunlight', mfgOrigin: 'India', mfgName: 'Bisleri International Pvt', gstPercent: 18 },
      { name: 'Classic Instant Coffee Powder', brand: 'Nescafe', subcategory: 'Tea & Coffee', basePrice: 165, unit: '50 g', tags: ['coffee', 'nescafe', 'instant coffee'], description: 'Rich and aromatic instant coffee granules, medium-dark roast.', shelfLife: '18 Months', storage: 'Keep jar tightly shut', mfgOrigin: 'India', mfgName: 'Nestle India Limited', gstPercent: 18 },
    ]
  },
  'cat-8': { // Electronics Accessories - 50 Products
    target: 50,
    items: [
      { name: 'SuperFast Type-C USB Cable', brand: 'Boat', subcategory: 'Cables & Chargers', basePrice: 199, unit: '1 pc', tags: ['cable', 'usb', 'type c', 'charger'], description: 'Braided tough USB-C to USB-A cable, 3A fast charging.', shelfLife: 'No expiry', storage: 'Store dry away from water', mfgOrigin: 'India', mfgName: 'Imagine Marketing Pvt Ltd', gstPercent: 18 },
      { name: 'In-Ear Wired Earphones BassHeads', brand: 'Boat', subcategory: 'Audio Accessories', basePrice: 399, unit: '1 pc', tags: ['earphones', 'boat', 'wired', 'headphones'], description: 'High bass wired earphones with passive noise cancellation and mic.', shelfLife: 'No expiry', storage: 'Keep in pouch', mfgOrigin: 'China', mfgName: 'Imagine Marketing Pvt Ltd', gstPercent: 18 },
      { name: 'LED Smart Bulb 9W', brand: 'Syska', subcategory: 'Smart Home', basePrice: 99, unit: '1 pc', tags: ['bulb', 'led', 'syska', 'electronics'], description: 'Energy saving smart LED bulb, 900 lumens, white cool daylight.', shelfLife: '2 Years Warranty', storage: 'Handle with care', mfgOrigin: 'India', mfgName: 'Syska LED Lights Pvt Ltd', gstPercent: 18 },
      { name: 'Fast Charge Power Bank 10000mAh', brand: 'Mi', subcategory: 'Power Banks', basePrice: 999, unit: '1 pc', tags: ['power bank', 'mi', 'charger', 'battery'], description: '10000mAh lithium polymer battery power bank, 18W fast charge.', shelfLife: '6 Months Warranty', storage: 'Do not expose to high heat', mfgOrigin: 'India', mfgName: 'Xiaomi India Pvt Ltd', gstPercent: 18 },
      { name: 'Adjustable Metal Mobile Stand', brand: 'Portronics', subcategory: 'Phone Accessories', basePrice: 249, unit: '1 pc', tags: ['mobile stand', 'holder', 'accessories'], description: 'Sturdy metallic table stand for smartphones and mini tablets.', shelfLife: 'No expiry', storage: 'Avoid moisture', mfgOrigin: 'India', mfgName: 'Portronics Digital Pvt Ltd', gstPercent: 18 },
    ]
  },
  'cat-9': { // Stationery - 40 Products
    target: 40,
    items: [
      { name: 'Long Book Spiral Notebook', brand: 'Classmate', subcategory: 'Notebooks & Pads', basePrice: 85, unit: '1 pc', tags: ['notebook', 'spiral book', 'stationery', 'classmate'], description: 'Spiral bound ruled long book, 180 pages, high-quality white paper.', shelfLife: 'No expiry', storage: 'Store in dry bookshelf', mfgOrigin: 'India', mfgName: 'ITC Limited', gstPercent: 12 },
      { name: 'SuperSmooth Blue Gel Pens', brand: 'Cello', subcategory: 'Pens & Pencils', basePrice: 50, unit: '5 pcs', tags: ['pen', 'gel pen', 'cello', 'stationery'], description: 'Waterproof ink gel pens, 0.5mm tip for smooth handwriting.', shelfLife: '24 Months', storage: 'Recap after use', mfgOrigin: 'India', mfgName: 'BIC Cello Writing Inst', gstPercent: 12 },
      { name: 'Whiteboard Permanent Markers', brand: 'Camel', subcategory: 'Office Supply', basePrice: 60, unit: '2 pcs', tags: ['marker', 'whiteboard', 'stationery'], description: 'Non-toxic, easy erase dry-wipe whiteboard markers in black/blue.', shelfLife: '12 Months', storage: 'Store horizontally capped', mfgOrigin: 'India', mfgName: 'Kokuyo Camlin Ltd', gstPercent: 12 },
      { name: 'Heavy Duty Document File Folder', brand: 'Solo', subcategory: 'Filing Supplies', basePrice: 120, unit: '1 pc', tags: ['file', 'folder', 'solo', 'office'], description: 'Plastic clip document file holder, keeps up to 100 sheets tidy.', shelfLife: 'No expiry', storage: 'Keep flat', mfgOrigin: 'India', mfgName: 'Solo Stationery Mfg', gstPercent: 12 },
    ]
  },
  'cat-10': { // Personal Care - 60 Products
    target: 60,
    items: [
      { name: 'Intense Damage Repair Shampoo', brand: 'Dove', subcategory: 'Hair Care', basePrice: 185, unit: '180 ml', tags: ['shampoo', 'dove', 'hair care', 'cosmetics'], description: 'Formulated with keratin actives to repair and nourish damaged hair.', shelfLife: '24 Months', storage: 'Keep in cool dry place', mfgOrigin: 'India', mfgName: 'Hindustan Unilever Limited', gstPercent: 18 },
      { name: 'Original White Soap Bar', brand: 'Dove', subcategory: 'Bath & Body', basePrice: 72, unit: '125 g', tags: ['soap', 'dove', 'bath', 'bar'], description: 'Gentle cleansing beauty bathing bar with 1/4 moisturizing cream.', shelfLife: '30 Months', storage: 'Store dry in soap dish', mfgOrigin: 'India', mfgName: 'Hindustan Unilever Limited', gstPercent: 18 },
      { name: 'MaxFresh Gel Toothpaste', brand: 'Colgate', subcategory: 'Oral Care', basePrice: 90, unit: '150 g', tags: ['toothpaste', 'colgate', 'oral care'], description: 'Spicy fresh blue gel toothpaste with cooling crystals for fresh breath.', shelfLife: '24 Months', storage: 'Store at room temperature', mfgOrigin: 'India', mfgName: 'Colgate-Palmolive India Ltd', gstPercent: 18 },
      { name: 'Deep Moisture Body Lotion', brand: 'Nivea', subcategory: 'Skin Care', basePrice: 249, unit: '200 ml', tags: ['lotion', 'nivea', 'moisturizer', 'skin'], description: 'Quick-absorbing moisturizing lotion, hydrates skin for up to 48 hours.', shelfLife: '30 Months', storage: 'Avoid direct heat', mfgOrigin: 'India', mfgName: 'Nivea India Pvt Ltd', gstPercent: 18 },
      { name: 'Oil Control Face Wash', brand: 'Himalaya', subcategory: 'Skin Care', basePrice: 135, unit: '100 ml', tags: ['facewash', 'himalaya', 'face care'], description: 'Purifying neem face wash, clears pimples and removes excess oils.', shelfLife: '36 Months', storage: 'Keep away from sunlight', mfgOrigin: 'India', mfgName: 'Himalaya Wellness Company', gstPercent: 18 },
    ]
  },
};

export function generateProducts(): Product[] {
  const resultProducts: Product[] = [];

  Object.entries(CATEGORY_TEMPLATES).forEach(([catId, cfg]) => {
    const { target, items } = cfg;
    const pool = IMAGE_POOLS[catId] || IMAGE_POOLS['cat-1'];

    // We will generate the target amount of products for this category by wrapping/modifying the base templates
    for (let i = 0; i < target; i++) {
      const templateIdx = i % items.length;
      const baseItem = items[templateIdx];

      // Create unique variant differences based on index
      const variantNum = Math.floor(i / items.length) + 1;
      let suffix = '';
      let unit = baseItem.unit;
      let multiplier = 1;

      // Pack size modifiers
      if (variantNum === 2) {
        suffix = ' (Pack of 2)';
        multiplier = 1.85; // discount for bulk pack
        unit = `2 x ${baseItem.unit}`;
      } else if (variantNum === 3) {
        suffix = ' Value Pack';
        multiplier = 2.7;
        unit = `3 x ${baseItem.unit}`;
      } else if (variantNum > 3) {
        suffix = ` Pro-Grade v${variantNum}`;
        multiplier = 1.2 + (variantNum * 0.1);
      }

      const rawPrice = baseItem.basePrice * multiplier;
      const price = Math.round(rawPrice);
      // Ensure mrp is always greater than or equal to price (mrp is inflated by 10-25%)
      const mrpInflation = 1.1 + (0.05 * (i % 4));
      const mrp = Math.round(price * mrpInflation);
      const discountPercent = mrp && price ? Math.round(((mrp - price) / mrp) * 100) : 0;

      // Unsplash Image logic: Pick a primary image index, and select next 3 as gallery images
      const primaryImageId = pool[i % pool.length];
      const galleryIds = pool.filter(id => id !== primaryImageId).slice(0, 3);
      
      const images = [
        getUnsplashUrl(primaryImageId),
        ...galleryIds.map(getUnsplashUrl),
      ];

      // Manufacturing and Expiry Dates
      const mfgDate = new Date();
      mfgDate.setDate(mfgDate.getDate() - (i % 25 + 5)); // 5 to 30 days ago
      
      const shelfLifeDays = baseItem.shelfLife.toLowerCase().includes('month') 
        ? parseInt(baseItem.shelfLife) * 30 
        : baseItem.shelfLife.toLowerCase().includes('day') 
        ? parseInt(baseItem.shelfLife) 
        : 365;

      const expDate = new Date(mfgDate.getTime());
      expDate.setDate(expDate.getDate() + shelfLifeDays);

      const product: Product = {
        id: `p-${catId}-${i + 1}`,
        categoryId: catId,
        storeId: 'store-1', // Default mock store
        name: `${baseItem.name}${suffix}`,
        price: price,
        mrp: mrp,
        unit: unit,
        stockQuantity: i % 7 === 0 ? 5 : 30 + (i % 95), // realistic stock limits
        isActive: true,
        isFeatured: i % 8 === 0,
        isFresh: catId === 'cat-2' || catId === 'cat-3' || (catId === 'cat-4' && i % 3 === 0), // Fruits, Veggies, some Dairy
        images: images,
        tags: [...baseItem.tags, baseItem.subcategory.toLowerCase()],
        discountPercent: discountPercent,

        // Premium metadata
        sku: `BB-${catId.toUpperCase()}-${String(i+1).padStart(3, '0')}-${baseItem.brand.substring(0, 3).toUpperCase()}`,
        barcode: `890100${String(1000000 + i + parseInt(catId.replace('cat-', '')) * 100000)}`,
        brand: baseItem.brand,
        subcategory: baseItem.subcategory,
        shortDescription: `Premium ${baseItem.subcategory} item brought to you by ${baseItem.brand}.`,
        description: baseItem.description,
        weightOrVolume: unit,
        gstPercent: baseItem.gstPercent,
        shelfLife: baseItem.shelfLife,
        manufacturingDate: mfgDate.toISOString().split('T')[0],
        expiryDate: expDate.toISOString().split('T')[0],
        countryOfOrigin: baseItem.mfgOrigin,
        manufacturer: baseItem.mfgName,
        storageInstructions: baseItem.storage,
        averageRating: parseFloat((4.0 + (i % 10) * 0.1).toFixed(1)),
        reviewCount: 15 + (i * 7) % 350,
        deliveryEtaMinutes: 10 + (i % 6) * 3, // 10 to 25 mins
        isTrending: i % 6 === 0,
      };

      resultProducts.push(product);
    }
  });

  return resultProducts;
}
