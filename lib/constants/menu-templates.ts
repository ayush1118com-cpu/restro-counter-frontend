export interface MenuTemplateItem {
  name: string;
  category: string;
  price: number;
  description: string;
  requiresKitchen: boolean;
  image?: string;
}

export const DEFAULT_PRESET_CATEGORIES = [
  { name: 'Starters', description: 'Appetizers, tikka & finger food' },
  { name: 'Beverages', description: 'Coffee, tea, shakes & cold drinks' },
  { name: 'Main Course', description: 'Paneer, curries, dal & seasonal sabzi' },
  { name: 'Fast Food', description: 'Burgers, pizza, sandwiches & pasta' },
  { name: 'Snacks', description: 'Quick bites, samosa, pakora & chaat' },
  { name: 'Chinese', description: 'Noodles, manchurian, chilli paneer & momos' },
  { name: 'Breads / Roti', description: 'Tandoori roti, butter naan & parathas' },
  { name: 'Rice & Biryani', description: 'Jeera rice, pulao & dum biryani' },
  { name: 'Desserts', description: 'Gulab jamun, ice cream & brownies' },
];

export const POPULAR_MENU_SUGGESTIONS: MenuTemplateItem[] = [
  // Beverages / Coffee & Tea
  {
    name: 'Cold Coffee',
    category: 'Beverages',
    price: 80,
    description: 'Chilled creamy blended coffee topped with chocolate drizzle',
    requiresKitchen: false,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cold Coffee with Ice Cream',
    category: 'Beverages',
    price: 110,
    description: 'Thick rich cold coffee crowned with a scoop of vanilla ice cream',
    requiresKitchen: false,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Hot Coffee',
    category: 'Beverages',
    price: 50,
    description: 'Freshly frothed hot aromatic milk coffee',
    requiresKitchen: false,
  },
  {
    name: 'Masala Chai',
    category: 'Beverages',
    price: 25,
    description: 'Authentic Indian spiced tea brewed with ginger and cardamom',
    requiresKitchen: false,
  },
  {
    name: 'Lemon Iced Tea',
    category: 'Beverages',
    price: 70,
    description: 'Refreshing cold iced tea infused with natural lemon juice & mint',
    requiresKitchen: false,
  },
  {
    name: 'Chocolate Milkshake',
    category: 'Beverages',
    price: 100,
    description: 'Thick chocolate milkshake prepared with premium cocoa & cream',
    requiresKitchen: false,
  },
  {
    name: 'Fresh Lime Soda',
    category: 'Beverages',
    price: 50,
    description: 'Chilled soda with freshly squeezed lime, served sweet or salted',
    requiresKitchen: false,
  },

  // Starters
  {
    name: 'Paneer Tikka',
    category: 'Starters',
    price: 190,
    description: 'Char-grilled cottage cheese cubes marinated in tandoori spices with capsicum',
    requiresKitchen: true,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Veg Spring Roll',
    category: 'Starters',
    price: 120,
    description: 'Crispy fried rolls filled with fresh julienned vegetables & spices',
    requiresKitchen: true,
  },
  {
    name: 'French Fries',
    category: 'Starters',
    price: 80,
    description: 'Crispy golden salted potato fries served with dip',
    requiresKitchen: true,
  },
  {
    name: 'Peri Peri Fries',
    category: 'Starters',
    price: 95,
    description: 'Crisp potato fries dusted with tangy and fiery peri-peri seasoning',
    requiresKitchen: true,
  },
  {
    name: 'Crispy Corn',
    category: 'Starters',
    price: 130,
    description: 'Golden fried sweet corn kernels tossed with peppers & black pepper',
    requiresKitchen: true,
  },
  {
    name: 'Hara Bhara Kabab',
    category: 'Starters',
    price: 140,
    description: 'Pan-fried patties made of spinach, green peas, potatoes and mild spices',
    requiresKitchen: true,
  },

  // Fast Food
  {
    name: 'Veg Burger',
    category: 'Fast Food',
    price: 70,
    description: 'Crispy spiced potato patty topped with sliced tomato, onion & creamy mayo',
    requiresKitchen: true,
  },
  {
    name: 'Cheese Burger',
    category: 'Fast Food',
    price: 95,
    description: 'Vegetable patty loaded with cheddar cheese slice, fresh greens & herb dressing',
    requiresKitchen: true,
  },
  {
    name: 'Margherita Pizza',
    category: 'Fast Food',
    price: 160,
    description: 'Classic stone baked crust with rich herb tomato sauce & melting mozzarella',
    requiresKitchen: true,
  },
  {
    name: 'Veg Farmhouse Pizza',
    category: 'Fast Food',
    price: 210,
    description: 'Loaded with capsicum, crunchy onion, mushrooms, sweet corn & mozzarella',
    requiresKitchen: true,
  },
  {
    name: 'Grilled Cheese Sandwich',
    category: 'Fast Food',
    price: 90,
    description: 'Golden grilled sandwich bursting with molten cheese & herbs',
    requiresKitchen: true,
  },
  {
    name: 'Veg Club Sandwich',
    category: 'Fast Food',
    price: 110,
    description: 'Double-decker toasted sandwich packed with fresh veggies, cheese and spiced mint chutney',
    requiresKitchen: true,
  },
  {
    name: 'Red Sauce Pasta',
    category: 'Fast Food',
    price: 140,
    description: 'Penne pasta tossed in zesty garlic tomato sauce with Italian herbs',
    requiresKitchen: true,
  },
  {
    name: 'White Sauce Pasta',
    category: 'Fast Food',
    price: 160,
    description: 'Creamy Alfredo penne pasta with garlic butter, sweet corn & cheese',
    requiresKitchen: true,
  },

  // Chinese
  {
    name: 'Veg Manchurian',
    category: 'Chinese',
    price: 130,
    description: 'Vegetable dumplings tossed in dark soya, garlic & coriander gravy',
    requiresKitchen: true,
  },
  {
    name: 'Chilli Paneer',
    category: 'Chinese',
    price: 180,
    description: 'Batter fried paneer cubes wok-tossed with onions, peppers & hot chilli sauce',
    requiresKitchen: true,
  },
  {
    name: 'Veg Hakka Noodles',
    category: 'Chinese',
    price: 120,
    description: 'Wok tossed noodles with shredded crunchy vegetables and aromatic spices',
    requiresKitchen: true,
  },
  {
    name: 'Veg Fried Rice',
    category: 'Chinese',
    price: 120,
    description: 'Fluffy fragrant rice stir fried with finely chopped garden vegetables',
    requiresKitchen: true,
  },
  {
    name: 'Veg Steamed Momos',
    category: 'Chinese',
    price: 90,
    description: 'Thin flour dumplings filled with seasoned cabbage & carrot, served with fiery spicy chutney',
    requiresKitchen: true,
  },

  // Main Course
  {
    name: 'Paneer Butter Masala',
    category: 'Main Course',
    price: 220,
    description: 'Soft paneer chunks simmered in rich creamy tomato and butter gravy',
    requiresKitchen: true,
  },
  {
    name: 'Kadhai Paneer',
    category: 'Main Course',
    price: 210,
    description: 'Cottage cheese & capsicum cooked with freshly pounded kadhai spices',
    requiresKitchen: true,
  },
  {
    name: 'Dal Makhani',
    category: 'Main Course',
    price: 180,
    description: 'Slow-cooked whole black lentils enriched with butter, cream & mild spices',
    requiresKitchen: true,
  },
  {
    name: 'Dal Tadka',
    category: 'Main Course',
    price: 140,
    description: 'Yellow arhar lentils tempered with desi ghee, cumin, garlic & red chillies',
    requiresKitchen: true,
  },
  {
    name: 'Shahi Paneer',
    category: 'Main Course',
    price: 230,
    description: 'Royal aromatic cottage cheese in sweet and savoury cashew nut gravy',
    requiresKitchen: true,
  },
  {
    name: 'Mix Vegetable',
    category: 'Main Course',
    price: 160,
    description: 'Assorted seasonal vegetables sautéed with traditional Indian dry spices',
    requiresKitchen: true,
  },

  // Breads / Roti
  {
    name: 'Tandoori Roti',
    category: 'Breads / Roti',
    price: 15,
    description: 'Clay-oven baked whole wheat flatbread',
    requiresKitchen: true,
  },
  {
    name: 'Butter Roti',
    category: 'Breads / Roti',
    price: 20,
    description: 'Crisp whole wheat tandoori roti generously brushed with melted butter',
    requiresKitchen: true,
  },
  {
    name: 'Butter Naan',
    category: 'Breads / Roti',
    price: 45,
    description: 'Classic leavened flatbread baked in tandoor and butter glazed',
    requiresKitchen: true,
  },
  {
    name: 'Garlic Naan',
    category: 'Breads / Roti',
    price: 55,
    description: 'Tandoori naan topped with chopped roasted garlic and fresh coriander',
    requiresKitchen: true,
  },
  {
    name: 'Lachha Paratha',
    category: 'Breads / Roti',
    price: 40,
    description: 'Multi-layered flaky whole wheat paratha baked crisp in tandoor',
    requiresKitchen: true,
  },

  // Rice
  {
    name: 'Jeera Rice',
    category: 'Rice & Biryani',
    price: 110,
    description: 'Steamed basmati rice tempered with roasted cumin seeds and fresh ghee',
    requiresKitchen: true,
  },
  {
    name: 'Veg Dum Biryani',
    category: 'Rice & Biryani',
    price: 180,
    description: 'Slow-cooked aromatic basmati rice layered with spiced vegetables & saffron',
    requiresKitchen: true,
  },

  // Desserts
  {
    name: 'Gulab Jamun (2 Pcs)',
    category: 'Desserts',
    price: 50,
    description: 'Warm golden fried khoya dumplings soaked in fragrant cardamom sugar syrup',
    requiresKitchen: false,
  },
  {
    name: 'Vanilla Ice Cream',
    category: 'Desserts',
    price: 45,
    description: 'Classic smooth and creamy vanilla bean ice cream scoop',
    requiresKitchen: false,
  },
  {
    name: 'Chocolate Brownie with Ice Cream',
    category: 'Desserts',
    price: 120,
    description: 'Warm fudgy chocolate brownie served with a scoop of vanilla ice cream & hot fudge',
    requiresKitchen: false,
  },
];
