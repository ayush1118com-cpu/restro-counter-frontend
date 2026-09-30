export type UserRole = 'SUPER_ADMIN' | 'RESTAURANT_ADMIN' | 'KITCHEN_STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  restaurantId?: string;
  restaurantName?: string;
  phone?: string;
  avatar?: string;
}

export type RestaurantStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';

export interface Restaurant {
  id: string;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  status: RestaurantStatus;
  ordersCount: number;
  salesTotal: number;
  activeMenuCount: number;
  createdAt: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'CONVERTED' | 'CLOSED';

export interface Lead {
  id: string;
  restaurantName: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  approxOrdersPerDay: string;
  currentPos?: string;
  message?: string;
  status: LeadStatus;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  itemCount: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  discountPrice?: number;
  image?: string;
  requiresKitchen?: boolean;
  isAvailable: boolean;
}

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export type OrderStatus = 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  requiresKitchen?: boolean;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  method: PaymentMethod;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  createdAt: string;
}

export interface SuperAdminDashboardStats {
  totalRestaurants: number;
  activeRestaurants: number;
  suspendedRestaurants: number;
  todaysOrders: number;
  todaysRevenue: number;
  newLeads: number;
}

export interface RestaurantDashboardStats {
  todaysOrders: number;
  todaysSales: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
}
