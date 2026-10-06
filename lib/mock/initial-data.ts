import { Category, Lead, MenuItem, Order, PaymentTransaction, Restaurant, User } from '@/types';

export const MOCK_USERS: Record<string, User> = {
  superadmin: {
    id: 'user_super_1',
    name: 'Super Admin',
    email: 'superadmin@restrocounter.com',
    role: 'SUPER_ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  restroadmin: {
    id: 'user_admin_1',
    name: 'Counter Admin',
    email: 'admin@restrocounter.com',
    role: 'RESTAURANT_ADMIN',
    restaurantId: 'rest_1',
    restaurantName: 'Counter Restaurant Outlet',
  },
};

export const MOCK_RESTAURANTS: Restaurant[] = [];

export const MOCK_LEADS: Lead[] = [];

export const MOCK_CATEGORIES: Category[] = [
  {
    "id": "cat_all",
    "name": "All",
    "description": "All available items",
    "itemCount": 85,
    "isActive": true
  },
  {
    "id": "cat_1",
    "name": "Chai",
    "description": "Chai items",
    "itemCount": 6,
    "isActive": true
  },
  {
    "id": "cat_2",
    "name": "Healthy Tea",
    "description": "Healthy Tea items",
    "itemCount": 2,
    "isActive": true
  },
  {
    "id": "cat_3",
    "name": "Hot Coffee",
    "description": "Hot Coffee items",
    "itemCount": 4,
    "isActive": true
  },
  {
    "id": "cat_4",
    "name": "Cold Coffee",
    "description": "Cold Coffee items",
    "itemCount": 4,
    "isActive": true
  },
  {
    "id": "cat_5",
    "name": "Chillers & Mocktails",
    "description": "Chillers & Mocktails items",
    "itemCount": 6,
    "isActive": true
  },
  {
    "id": "cat_6",
    "name": "Shakes",
    "description": "Shakes items",
    "itemCount": 5,
    "isActive": true
  },
  {
    "id": "cat_7",
    "name": "Momo",
    "description": "Momo items",
    "itemCount": 4,
    "isActive": true
  },
  {
    "id": "cat_8",
    "name": "Wraps",
    "description": "Wraps items",
    "itemCount": 5,
    "isActive": true
  },
  {
    "id": "cat_9",
    "name": "Bun",
    "description": "Bun items",
    "itemCount": 3,
    "isActive": true
  },
  {
    "id": "cat_10",
    "name": "Burger",
    "description": "Burger items",
    "itemCount": 3,
    "isActive": true
  },
  {
    "id": "cat_11",
    "name": "Fries",
    "description": "Fries items",
    "itemCount": 2,
    "isActive": true
  },
  {
    "id": "cat_12",
    "name": "Nachos",
    "description": "Nachos items",
    "itemCount": 1,
    "isActive": true
  },
  {
    "id": "cat_13",
    "name": "Sandwich",
    "description": "Sandwich items",
    "itemCount": 6,
    "isActive": true
  },
  {
    "id": "cat_14",
    "name": "Maggi",
    "description": "Maggi items",
    "itemCount": 5,
    "isActive": true
  },
  {
    "id": "cat_15",
    "name": "Pizza",
    "description": "Pizza items",
    "itemCount": 8,
    "isActive": true
  },
  {
    "id": "cat_16",
    "name": "Cigarettes",
    "description": "Cigarettes items",
    "itemCount": 9,
    "isActive": true
  },
  {
    "id": "cat_17",
    "name": "Packaged Drinks",
    "description": "Packaged Drinks items",
    "itemCount": 7,
    "isActive": true
  },
  {
    "id": "cat_18",
    "name": "Snacks",
    "description": "Snacks items",
    "itemCount": 5,
    "isActive": true
  }
];

export const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    "id": "item_1",
    "name": "Adrak Chai (Glass)",
    "categoryId": "cat_1",
    "categoryName": "Chai",
    "description": "Delicious Adrak Chai (Glass)",
    "price": 25,
    "image": "https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_2",
    "name": "Adrak Chai (Kulhad)",
    "categoryId": "cat_1",
    "categoryName": "Chai",
    "description": "Delicious Adrak Chai (Kulhad)",
    "price": 35,
    "image": "https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_3",
    "name": "Adrak Elaichi Mix (Glass)",
    "categoryId": "cat_1",
    "categoryName": "Chai",
    "description": "Delicious Adrak Elaichi Mix (Glass)",
    "price": 35,
    "image": "https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_4",
    "name": "Adrak Elaichi Mix (Kulhad)",
    "categoryId": "cat_1",
    "categoryName": "Chai",
    "description": "Delicious Adrak Elaichi Mix (Kulhad)",
    "price": 45,
    "image": "https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_5",
    "name": "Elaichi Chai (Glass)",
    "categoryId": "cat_1",
    "categoryName": "Chai",
    "description": "Delicious Elaichi Chai (Glass)",
    "price": 40,
    "image": "https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_6",
    "name": "Elaichi Chai (Kulhad)",
    "categoryId": "cat_1",
    "categoryName": "Chai",
    "description": "Delicious Elaichi Chai (Kulhad)",
    "price": 50,
    "image": "https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_7",
    "name": "Masala Lemon Tea",
    "categoryId": "cat_2",
    "categoryName": "Healthy Tea",
    "description": "Delicious Masala Lemon Tea",
    "price": 40,
    "image": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_8",
    "name": "Honey Ginger Lemon Tea",
    "categoryId": "cat_2",
    "categoryName": "Healthy Tea",
    "description": "Delicious Honey Ginger Lemon Tea",
    "price": 60,
    "image": "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_9",
    "name": "Black Coffee",
    "categoryId": "cat_3",
    "categoryName": "Hot Coffee",
    "description": "Delicious Black Coffee",
    "price": 50,
    "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_10",
    "name": "Regular Hot Coffee",
    "categoryId": "cat_3",
    "categoryName": "Hot Coffee",
    "description": "Delicious Regular Hot Coffee",
    "price": 70,
    "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_11",
    "name": "Chocolate Hot Coffee",
    "categoryId": "cat_3",
    "categoryName": "Hot Coffee",
    "description": "Delicious Chocolate Hot Coffee",
    "price": 90,
    "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_12",
    "name": "Hazelnut Hot Coffee",
    "categoryId": "cat_3",
    "categoryName": "Hot Coffee",
    "description": "Delicious Hazelnut Hot Coffee",
    "price": 100,
    "image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_13",
    "name": "Classic Cold Coffee",
    "categoryId": "cat_4",
    "categoryName": "Cold Coffee",
    "description": "Delicious Classic Cold Coffee",
    "price": 100,
    "image": "https://images.unsplash.com/photo-1461023058943-0708e52235eb?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_14",
    "name": "Choco Cold Coffee",
    "categoryId": "cat_4",
    "categoryName": "Cold Coffee",
    "description": "Delicious Choco Cold Coffee",
    "price": 130,
    "image": "https://images.unsplash.com/photo-1461023058943-0708e52235eb?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_15",
    "name": "Hazelnut Cold Coffee",
    "categoryId": "cat_4",
    "categoryName": "Cold Coffee",
    "description": "Delicious Hazelnut Cold Coffee",
    "price": 140,
    "image": "https://images.unsplash.com/photo-1461023058943-0708e52235eb?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_16",
    "name": "Caramel Cold Coffee",
    "categoryId": "cat_4",
    "categoryName": "Cold Coffee",
    "description": "Delicious Caramel Cold Coffee",
    "price": 140,
    "image": "https://images.unsplash.com/photo-1461023058943-0708e52235eb?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_17",
    "name": "Nimbu Paani",
    "categoryId": "cat_5",
    "categoryName": "Chillers & Mocktails",
    "description": "Delicious Nimbu Paani",
    "price": 90,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_18",
    "name": "Masala Nimbu Paani",
    "categoryId": "cat_5",
    "categoryName": "Chillers & Mocktails",
    "description": "Delicious Masala Nimbu Paani",
    "price": 110,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_19",
    "name": "Blue Lagoon",
    "categoryId": "cat_5",
    "categoryName": "Chillers & Mocktails",
    "description": "Delicious Blue Lagoon",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_20",
    "name": "Watermelon Mint",
    "categoryId": "cat_5",
    "categoryName": "Chillers & Mocktails",
    "description": "Delicious Watermelon Mint",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_21",
    "name": "Lemon Ice Tea",
    "categoryId": "cat_5",
    "categoryName": "Chillers & Mocktails",
    "description": "Delicious Lemon Ice Tea",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_22",
    "name": "Green Apple / Peach Ice Tea",
    "categoryId": "cat_5",
    "categoryName": "Chillers & Mocktails",
    "description": "Delicious Green Apple / Peach Ice Tea",
    "price": 150,
    "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_23",
    "name": "Vanilla Choco Chip",
    "categoryId": "cat_6",
    "categoryName": "Shakes",
    "description": "Delicious Vanilla Choco Chip",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75bb827?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_24",
    "name": "Chocolate Choco Chip",
    "categoryId": "cat_6",
    "categoryName": "Shakes",
    "description": "Delicious Chocolate Choco Chip",
    "price": 140,
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75bb827?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_25",
    "name": "Strawberry / Butterscotch",
    "categoryId": "cat_6",
    "categoryName": "Shakes",
    "description": "Delicious Strawberry / Butterscotch",
    "price": 150,
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75bb827?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_26",
    "name": "Black Currant / Blueberry",
    "categoryId": "cat_6",
    "categoryName": "Shakes",
    "description": "Delicious Black Currant / Blueberry",
    "price": 150,
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75bb827?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_27",
    "name": "Nutella / Oreo",
    "categoryId": "cat_6",
    "categoryName": "Shakes",
    "description": "Delicious Nutella / Oreo",
    "price": 160,
    "image": "https://images.unsplash.com/photo-1572490122747-3968b75bb827?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_28",
    "name": "Veg Momos (Steam)",
    "categoryId": "cat_7",
    "categoryName": "Momo",
    "description": "Delicious Veg Momos (Steam)",
    "price": 100,
    "image": "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_29",
    "name": "Veg Momos (Fried)",
    "categoryId": "cat_7",
    "categoryName": "Momo",
    "description": "Delicious Veg Momos (Fried)",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_30",
    "name": "Paneer Momos (Steam)",
    "categoryId": "cat_7",
    "categoryName": "Momo",
    "description": "Delicious Paneer Momos (Steam)",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_31",
    "name": "Paneer Momos (Fried)",
    "categoryId": "cat_7",
    "categoryName": "Momo",
    "description": "Delicious Paneer Momos (Fried)",
    "price": 140,
    "image": "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_32",
    "name": "Veggie Aloo Tikki Wrap",
    "categoryId": "cat_8",
    "categoryName": "Wraps",
    "description": "Delicious Veggie Aloo Tikki Wrap",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_33",
    "name": "Masala Wrap",
    "categoryId": "cat_8",
    "categoryName": "Wraps",
    "description": "Delicious Masala Wrap",
    "price": 140,
    "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_34",
    "name": "Spicy Paneer Wrap",
    "categoryId": "cat_8",
    "categoryName": "Wraps",
    "description": "Delicious Spicy Paneer Wrap",
    "price": 170,
    "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_35",
    "name": "Tandoori Veggie Wrap",
    "categoryId": "cat_8",
    "categoryName": "Wraps",
    "description": "Delicious Tandoori Veggie Wrap",
    "price": 150,
    "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_36",
    "name": "Tandoori Paneer Wrap",
    "categoryId": "cat_8",
    "categoryName": "Wraps",
    "description": "Delicious Tandoori Paneer Wrap",
    "price": 170,
    "image": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_37",
    "name": "Butter Bun",
    "categoryId": "cat_9",
    "categoryName": "Bun",
    "description": "Delicious Butter Bun",
    "price": 60,
    "image": "https://images.unsplash.com/photo-1550508139-f9c15e839211?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_38",
    "name": "Jam Jam Bun",
    "categoryId": "cat_9",
    "categoryName": "Bun",
    "description": "Delicious Jam Jam Bun",
    "price": 70,
    "image": "https://images.unsplash.com/photo-1550508139-f9c15e839211?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_39",
    "name": "Nutella Bun",
    "categoryId": "cat_9",
    "categoryName": "Bun",
    "description": "Delicious Nutella Bun",
    "price": 80,
    "image": "https://images.unsplash.com/photo-1550508139-f9c15e839211?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_40",
    "name": "Aloo Tikki Burger",
    "categoryId": "cat_10",
    "categoryName": "Burger",
    "description": "Delicious Aloo Tikki Burger",
    "price": 70,
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_41",
    "name": "Crispy Masala Burger",
    "categoryId": "cat_10",
    "categoryName": "Burger",
    "description": "Delicious Crispy Masala Burger",
    "price": 80,
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_42",
    "name": "Paneer Delight Burger",
    "categoryId": "cat_10",
    "categoryName": "Burger",
    "description": "Delicious Paneer Delight Burger",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_43",
    "name": "Classic Fries",
    "categoryId": "cat_11",
    "categoryName": "Fries",
    "description": "Delicious Classic Fries",
    "price": 100,
    "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_44",
    "name": "Peri-Peri Fries",
    "categoryId": "cat_11",
    "categoryName": "Fries",
    "description": "Delicious Peri-Peri Fries",
    "price": 140,
    "image": "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_45",
    "name": "Nachos Cheese Burst",
    "categoryId": "cat_12",
    "categoryName": "Nachos",
    "description": "Delicious Nachos Cheese Burst",
    "price": 150,
    "image": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_46",
    "name": "Garlic Cheese Sandwich",
    "categoryId": "cat_13",
    "categoryName": "Sandwich",
    "description": "Delicious Garlic Cheese Sandwich",
    "price": 100,
    "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_47",
    "name": "Tandoori Cheese Corn",
    "categoryId": "cat_13",
    "categoryName": "Sandwich",
    "description": "Delicious Tandoori Cheese Corn",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_48",
    "name": "Garlic Corn Sandwich",
    "categoryId": "cat_13",
    "categoryName": "Sandwich",
    "description": "Delicious Garlic Corn Sandwich",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_49",
    "name": "Veggie Blast Sandwich",
    "categoryId": "cat_13",
    "categoryName": "Sandwich",
    "description": "Delicious Veggie Blast Sandwich",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_50",
    "name": "Tandoori Paneer Sandwich",
    "categoryId": "cat_13",
    "categoryName": "Sandwich",
    "description": "Delicious Tandoori Paneer Sandwich",
    "price": 130,
    "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_51",
    "name": "Paneer Punch Sandwich",
    "categoryId": "cat_13",
    "categoryName": "Sandwich",
    "description": "Delicious Paneer Punch Sandwich",
    "price": 130,
    "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_52",
    "name": "Plain Maggi",
    "categoryId": "cat_14",
    "categoryName": "Maggi",
    "description": "Delicious Plain Maggi",
    "price": 60,
    "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_53",
    "name": "Masala Plain Maggi",
    "categoryId": "cat_14",
    "categoryName": "Maggi",
    "description": "Delicious Masala Plain Maggi",
    "price": 70,
    "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_54",
    "name": "Vegetable Maggi",
    "categoryId": "cat_14",
    "categoryName": "Maggi",
    "description": "Delicious Vegetable Maggi",
    "price": 90,
    "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_55",
    "name": "Cheese Maggi",
    "categoryId": "cat_14",
    "categoryName": "Maggi",
    "description": "Delicious Cheese Maggi",
    "price": 120,
    "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_56",
    "name": "Tandoori Maggi",
    "categoryId": "cat_14",
    "categoryName": "Maggi",
    "description": "Delicious Tandoori Maggi",
    "price": 150,
    "image": "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_57",
    "name": "Margherita Pizza",
    "categoryId": "cat_15",
    "categoryName": "Pizza",
    "description": "Delicious Margherita Pizza",
    "price": 160,
    "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_58",
    "name": "Single Topping",
    "categoryId": "cat_15",
    "categoryName": "Pizza",
    "description": "Delicious Single Topping",
    "price": 170,
    "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_59",
    "name": "Veggie Affair",
    "categoryId": "cat_15",
    "categoryName": "Pizza",
    "description": "Delicious Veggie Affair",
    "price": 180,
    "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_60",
    "name": "Farmhouse Pizza",
    "categoryId": "cat_15",
    "categoryName": "Pizza",
    "description": "Delicious Farmhouse Pizza",
    "price": 200,
    "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_61",
    "name": "Tandoori Veggie Affair",
    "categoryId": "cat_15",
    "categoryName": "Pizza",
    "description": "Delicious Tandoori Veggie Affair",
    "price": 220,
    "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_62",
    "name": "Paneer Spicy Supreme",
    "categoryId": "cat_15",
    "categoryName": "Pizza",
    "description": "Delicious Paneer Spicy Supreme",
    "price": 220,
    "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_63",
    "name": "Mexican Green Wave",
    "categoryId": "cat_15",
    "categoryName": "Pizza",
    "description": "Delicious Mexican Green Wave",
    "price": 280,
    "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_64",
    "name": "Tandoori Paneer Pizza",
    "categoryId": "cat_15",
    "categoryName": "Pizza",
    "description": "Delicious Tandoori Paneer Pizza",
    "price": 250,
    "image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": true
  },
  {
    "id": "item_65",
    "name": "Classic Milds (Single)",
    "categoryId": "cat_16",
    "categoryName": "Cigarettes",
    "description": "Over-the-counter item",
    "price": 18,
    "image": "https://images.unsplash.com/photo-1528254413349-f8c5b61e0f0c?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_66",
    "name": "Classic Regular (Single)",
    "categoryId": "cat_16",
    "categoryName": "Cigarettes",
    "description": "Over-the-counter item",
    "price": 18,
    "image": "https://images.unsplash.com/photo-1528254413349-f8c5b61e0f0c?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_67",
    "name": "Gold Flake Kings (Single)",
    "categoryId": "cat_16",
    "categoryName": "Cigarettes",
    "description": "Over-the-counter item",
    "price": 18,
    "image": "https://images.unsplash.com/photo-1528254413349-f8c5b61e0f0c?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_68",
    "name": "Gold Flake Small (Single)",
    "categoryId": "cat_16",
    "categoryName": "Cigarettes",
    "description": "Over-the-counter item",
    "price": 10,
    "image": "https://images.unsplash.com/photo-1528254413349-f8c5b61e0f0c?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_69",
    "name": "Marlboro Advance (Single)",
    "categoryId": "cat_16",
    "categoryName": "Cigarettes",
    "description": "Over-the-counter item",
    "price": 20,
    "image": "https://images.unsplash.com/photo-1528254413349-f8c5b61e0f0c?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_70",
    "name": "Marlboro Red (Single)",
    "categoryId": "cat_16",
    "categoryName": "Cigarettes",
    "description": "Over-the-counter item",
    "price": 20,
    "image": "https://images.unsplash.com/photo-1528254413349-f8c5b61e0f0c?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_71",
    "name": "Marlboro Clove (Single)",
    "categoryId": "cat_16",
    "categoryName": "Cigarettes",
    "description": "Over-the-counter item",
    "price": 20,
    "image": "https://images.unsplash.com/photo-1528254413349-f8c5b61e0f0c?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_72",
    "name": "B&H (Single)",
    "categoryId": "cat_16",
    "categoryName": "Cigarettes",
    "description": "Over-the-counter item",
    "price": 20,
    "image": "https://images.unsplash.com/photo-1528254413349-f8c5b61e0f0c?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_73",
    "name": "Flake Excel (Single)",
    "categoryId": "cat_16",
    "categoryName": "Cigarettes",
    "description": "Over-the-counter item",
    "price": 15,
    "image": "https://images.unsplash.com/photo-1528254413349-f8c5b61e0f0c?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_74",
    "name": "Water Bottle (500ml)",
    "categoryId": "cat_17",
    "categoryName": "Packaged Drinks",
    "description": "Over-the-counter item",
    "price": 10,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_75",
    "name": "Water Bottle (1L)",
    "categoryId": "cat_17",
    "categoryName": "Packaged Drinks",
    "description": "Over-the-counter item",
    "price": 20,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_76",
    "name": "Red Bull (250ml)",
    "categoryId": "cat_17",
    "categoryName": "Packaged Drinks",
    "description": "Over-the-counter item",
    "price": 125,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_77",
    "name": "Coca Cola (250ml)",
    "categoryId": "cat_17",
    "categoryName": "Packaged Drinks",
    "description": "Over-the-counter item",
    "price": 20,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_78",
    "name": "Sprite (250ml)",
    "categoryId": "cat_17",
    "categoryName": "Packaged Drinks",
    "description": "Over-the-counter item",
    "price": 20,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_79",
    "name": "Thums Up (250ml)",
    "categoryId": "cat_17",
    "categoryName": "Packaged Drinks",
    "description": "Over-the-counter item",
    "price": 20,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_80",
    "name": "Sting Energy",
    "categoryId": "cat_17",
    "categoryName": "Packaged Drinks",
    "description": "Over-the-counter item",
    "price": 20,
    "image": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_81",
    "name": "Lays (Blue - Magic Masala)",
    "categoryId": "cat_18",
    "categoryName": "Snacks",
    "description": "Over-the-counter item",
    "price": 10,
    "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_82",
    "name": "Lays (Green - American Style)",
    "categoryId": "cat_18",
    "categoryName": "Snacks",
    "description": "Over-the-counter item",
    "price": 10,
    "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_83",
    "name": "Kurkure Masala Munch",
    "categoryId": "cat_18",
    "categoryName": "Snacks",
    "description": "Over-the-counter item",
    "price": 10,
    "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_84",
    "name": "Good Day Biscuits",
    "categoryId": "cat_18",
    "categoryName": "Snacks",
    "description": "Over-the-counter item",
    "price": 10,
    "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  },
  {
    "id": "item_85",
    "name": "Oreo Biscuits",
    "categoryId": "cat_18",
    "categoryName": "Snacks",
    "description": "Over-the-counter item",
    "price": 10,
    "image": "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
    "isAvailable": true,
    "requiresKitchen": false
  }
];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_PAYMENTS: PaymentTransaction[] = [];
