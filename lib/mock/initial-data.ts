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
  { id: 'cat_all', name: 'All', description: 'All available items', itemCount: 0, isActive: true },
];

export const MOCK_MENU_ITEMS: MenuItem[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_PAYMENTS: PaymentTransaction[] = [];
