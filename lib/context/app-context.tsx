'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { API_URL, SOCKET_URL } from '../config';
import {
  Category,
  Lead,
  LeadStatus,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentTransaction,
  KhataAccount,
  KhataTransaction,
  Restaurant,
  RestaurantStatus,
  User,
} from '@/types';
import {
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  MOCK_CATEGORIES,
  MOCK_LEADS,
  MOCK_MENU_ITEMS,
  MOCK_RESTAURANTS,
  MOCK_USERS,
} from '../mock/initial-data';

export interface CartItem extends OrderItem {
  image?: string;
}

interface AppContextType {
  // Auth state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginAs: (role: 'SUPER_ADMIN' | 'RESTAURANT_ADMIN' | 'KITCHEN_STAFF', customUser?: User) => void;
  logout: () => void;

  // Restaurants
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  updateCurrentRestaurant: (data: Partial<Restaurant>) => Promise<boolean>;
  addRestaurant: (data: Omit<Restaurant, 'id' | 'ordersCount' | 'salesTotal' | 'createdAt' | 'activeMenuCount'>) => Promise<Restaurant | null>;
  updateRestaurantStatus: (id: string, status: RestaurantStatus) => void;
  updateRestaurant: (id: string, data: Partial<Restaurant>) => void;
  deleteRestaurant: (id: string) => Promise<boolean>;
  updateRestaurantPassword: (id: string, password: string) => Promise<boolean>;

  // Leads (Public & Super Admin)
  leads: Lead[];
  addLead: (data: Omit<Lead, 'id' | 'status' | 'createdAt'>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;

  // Menu & Categories (Restaurant Admin)
  categories: Category[];
  menuItems: MenuItem[];
  addCategory: (name: string, description?: string) => Promise<Category | null>;
  updateCategory: (id: string, name: string, description?: string) => void;
  deleteCategory: (id: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<void>;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
  toggleMenuItemAvailability: (id: string) => void;
  deleteMenuItem: (id: string) => void;

  // Cart (Counter POS)
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  updateCartItemNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;

  // Orders & Kitchen
  orders: Order[];
  payments: PaymentTransaction[];
  khataAccounts: KhataAccount[];
  createOrder: (
    paymentMethod: PaymentMethod,
    customerPhone?: string,
    customerName?: string,
    paidAmount?: number,
    dueAmount?: number,
    vehicleNumber?: string
  ) => Promise<Order>;
  recordKhataPayment: (accountId: string, amount: number, method: PaymentMethod, notes?: string) => void;
  getCustomerKhata: (customerNameOrPhone: string) => KhataAccount | undefined;
  addItemsToOrder: (
    orderId: string,
    items: { itemId: string; name: string; price: number; quantity: number; requiresKitchen?: boolean }[],
    paymentMethod?: PaymentMethod
  ) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Sound alert trigger
  playOrderNotificationSound: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Cloud data
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('restro_restaurants');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try { return JSON.parse(savedUser); } catch (e) {}
      }
    }
    return null;
  });

  const getInitialState = <T,>(key: string, defaultVal: T): T => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return defaultVal;
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [categories, setCategories] = useState<Category[]>(() => {
    const initial = getInitialState('restro_categories', MOCK_CATEGORIES);
    if (!initial || initial.length === 0) return MOCK_CATEGORIES;
    if (!initial.some((c: Category) => c.id === 'cat_all')) {
      return [{ id: 'cat_all', name: 'All', description: 'All items', itemCount: 0, isActive: true }, ...initial];
    }
    return initial;
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = getInitialState('restro_menu_items', []);
    return (saved && saved.length > 0) ? saved : MOCK_MENU_ITEMS;
  });
  const [orders, setOrders] = useState<Order[]>(() => getInitialState('restro_orders', []));
  const [payments, setPayments] = useState<PaymentTransaction[]>(() => getInitialState('restro_payments', []));
  const [khataAccounts, setKhataAccounts] = useState<KhataAccount[]>(() => getInitialState('restro_khata', []));
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(() => getInitialState('restro_profile', null));

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Helper to persist state to localStorage (caching for optimistic UI scoped per restaurant)
  const getRestroKey = (key: string, customRestId?: string) => {
    const rId = customRestId || currentUser?.restaurantId;
    if (rId && currentUser?.role !== 'SUPER_ADMIN') {
      return `${key}_${rId}`;
    }
    return key;
  };

  const saveStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(getRestroKey(key), JSON.stringify(data));
      } catch (e) {}
    }
  };

  // Clean legacy shared storage keys that cause cross-admin data leakage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('restro_orders');
      localStorage.removeItem('restro_payments');
      localStorage.removeItem('restro_khata');
    }
  }, []);

  // When restaurantId changes, load strictly scoped data for that restaurant
  useEffect(() => {
    if (!currentUser?.restaurantId || currentUser.role === 'SUPER_ADMIN') return;

    const restId = currentUser.restaurantId;
    const scopedOrders = getInitialState(`restro_orders_${restId}`, []);
    const scopedPayments = getInitialState(`restro_payments_${restId}`, []);
    const scopedKhata = getInitialState(`restro_khata_${restId}`, []);
    const scopedMenu = getInitialState(`restro_menu_items_${restId}`, []);
    const scopedCategories = getInitialState(`restro_categories_${restId}`, MOCK_CATEGORIES);
    const scopedProfile = getInitialState(`restro_profile_${restId}`, null);

    setOrders(scopedOrders);
    setPayments(scopedPayments);
    setKhataAccounts(scopedKhata);
    if (scopedMenu && scopedMenu.length > 0) {
      setMenuItems(scopedMenu);
    } else {
      setMenuItems(MOCK_MENU_ITEMS);
    }
    if (scopedCategories && scopedCategories.length > 0) setCategories(scopedCategories);
    if (scopedProfile) setCurrentRestaurant(scopedProfile);

    // Fetch live restaurant details and GST config from backend
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      fetch(`${API_URL}/restaurants/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-restaurant-id': restId,
        },
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data?.restaurant) {
            const r = resData.data.restaurant;
            const mapped: Restaurant = {
              id: r._id || r.id,
              name: r.name,
              ownerName: r.ownerName,
              email: r.email,
              phone: r.phone,
              address: r.address,
              city: r.city,
              status: r.status,
              gstin: r.gstin || '',
              gstRate: r.gstRate !== undefined ? Number(r.gstRate) : 5,
              receiptHeader: r.receiptHeader || 'SERV DESK - FAST POS',
              receiptFooter: r.receiptFooter || 'Thank you for dining with us! Visit again.',
              ordersCount: 0,
              salesTotal: 0,
              activeMenuCount: 0,
              createdAt: r.createdAt || new Date().toISOString(),
            };
            setCurrentRestaurant(mapped);
            saveStorage('restro_profile', mapped);
          }
        })
        .catch((err) => console.error('Failed to fetch restaurant profile:', err));
    }
  }, [currentUser?.restaurantId]);

  const logout = () => {
    setCurrentUser(null);
    setCurrentRestaurant(null);
    setOrders([]);
    setPayments([]);
    setKhataAccounts([]);
    setCart([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('restro_orders');
      localStorage.removeItem('restro_payments');
      localStorage.removeItem('restro_khata');
      localStorage.removeItem('restro_profile');
    }
    toast.info('Logged out successfully');
  };

  // Authenticated Fetch Wrapper to handle 401/403 (Suspended/Blocked)
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return { success: false };

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(currentUser?.restaurantId ? { 'x-restaurant-id': currentUser.restaurantId } : {})
    };

    try {
      const res = await fetch(url, { ...options, headers });
      const resData = await res.json();

      if (res.status === 401 || res.status === 403) {
        toast.error(`Access Denied (${res.status}) on ${url.split('/').pop()}: ${resData.message || 'Suspended'}`);
        logout();
        if (typeof window !== 'undefined') {
          setTimeout(() => { window.location.href = '/login'; }, 1500);
        }
        return { success: false, ...resData };
      }
      return resData;
    } catch (err) {
      console.error('Fetch error:', err);
      return { success: false };
    }
  };

  // AUTO-SYNC: Keep currentUser's restaurant data in sync with actual restaurant records
  // This fixes stale cached user data in localStorage
  useEffect(() => {
    if (!currentUser || currentUser.role === 'SUPER_ADMIN' || restaurants.length === 0) return;

    // Try to find matching restaurant
    const matchedRest =
      restaurants.find((r) => r.id === currentUser.restaurantId) ||
      restaurants.find((r) => r.email === currentUser.email) ||
      restaurants.find((r) => r.phone === currentUser.phone);

    if (matchedRest) {
      const needsUpdate =
        currentUser.restaurantId !== matchedRest.id ||
        currentUser.restaurantName !== matchedRest.name ||
        currentUser.phone !== matchedRest.phone;

      if (needsUpdate) {
        const updatedUser: User = {
          ...currentUser,
          restaurantId: matchedRest.id,
          restaurantName: matchedRest.name,
          phone: matchedRest.phone,
        };
        setCurrentUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    }
  }, [restaurants]); // eslint-disable-line react-hooks/exhaustive-deps

  // MONGODB SYNC: Fetch real orders from backend
  useEffect(() => {
    if (typeof window === 'undefined' || !currentUser?.restaurantId || currentUser.role === 'SUPER_ADMIN') return;
    
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    authFetch(`${API_URL}/orders`)
      .then(resData => {
        if (resData.success && Array.isArray(resData.data)) {
          // Map backend format to frontend format
          const dbOrders: Order[] = resData.data.map((dbOrder: any) => ({
            id: dbOrder._id || dbOrder.id,
            orderNumber: dbOrder.orderNumber.toString(),
            restaurantId: dbOrder.restaurantId,
            items: dbOrder.items.map((i: any) => ({
              itemId: i.menuItemId || i.itemId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              requiresKitchen: i.requiresKitchen,
              notes: i.notes
            })),
            subtotal: dbOrder.subtotal,
            tax: dbOrder.tax,
            discount: dbOrder.discount,
            total: dbOrder.grandTotal || dbOrder.total,
            paymentMethod: dbOrder.paymentMethod,
            paymentStatus: dbOrder.paymentStatus,
            status: dbOrder.orderStatus || dbOrder.status,
            createdAt: dbOrder.createdAt,
            updatedAt: dbOrder.updatedAt,
            customerName: dbOrder.customerName,
            customerPhone: dbOrder.customerPhone,
            notes: dbOrder.notes
          }));
          setOrders(dbOrders);
          saveStorage('restro_orders', dbOrders);

          // Automatically derive / sync payment transactions from orders for current restaurant
          setPayments((prev) => {
            const payMap = new Map<string, PaymentTransaction>();
            // Keep only existing recorded payments that belong to this restaurant
            prev
              .filter((p) => !p.restaurantId || p.restaurantId === currentUser.restaurantId)
              .forEach((p) => payMap.set(p.orderId || p.id, p));

            // Derive for all non-cancelled orders of this restaurant
            dbOrders.forEach((o) => {
              if (o.status !== 'CANCELLED' && (o.paymentStatus === 'PAID' || !o.paymentStatus)) {
                const key = o.id;
                const existing = payMap.get(key) || Array.from(payMap.values()).find((p) => p.orderNumber === o.orderNumber);
                if (!existing) {
                  payMap.set(key, {
                    id: `pay_${o.id}`,
                    restaurantId: currentUser.restaurantId,
                    orderId: o.id,
                    orderNumber: o.orderNumber,
                    amount: o.total,
                    method: o.paymentMethod || 'CASH',
                    status: 'SUCCESS',
                    createdAt: o.createdAt || new Date().toISOString(),
                  });
                }
              }
            });

            const merged = Array.from(payMap.values()).sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            saveStorage('restro_payments', merged);
            return merged;
          });
        }
      })
      .catch(err => console.error('Failed to fetch orders from DB:', err));

    // Fetch Payments from backend database (Only RESTAURANT_ADMIN)
    if (currentUser.role === 'RESTAURANT_ADMIN') {
      authFetch(`${API_URL}/payments?limit=100`)
        .then(resData => {
          if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
            const dbPayments: PaymentTransaction[] = resData.data.map((p: any) => ({
              id: p._id || p.id,
              restaurantId: p.restaurantId || currentUser.restaurantId,
              orderId: (typeof p.orderId === 'object' && p.orderId?._id) ? p.orderId._id : (p.orderId || ''),
              orderNumber: (typeof p.orderId === 'object' && p.orderId?.orderNumber) ? String(p.orderId.orderNumber) : (p.orderNumber ? String(p.orderNumber) : '1001'),
              amount: p.amount,
              method: p.method,
              status: p.status === 'PAID' ? 'SUCCESS' : (p.status || 'SUCCESS'),
              createdAt: p.paidAt || p.createdAt || new Date().toISOString(),
            }));

            setPayments((prev) => {
              const payMap = new Map<string, PaymentTransaction>();
              // Keep only existing recorded payments that belong to this restaurant
              prev
                .filter((p) => !p.restaurantId || p.restaurantId === currentUser.restaurantId)
                .forEach((p) => payMap.set(p.orderId || p.id, p));
              dbPayments.forEach((p) => payMap.set(p.orderId || p.id, p));
              const merged = Array.from(payMap.values()).sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              saveStorage('restro_payments', merged);
              return merged;
            });
          }
        })
        .catch(err => console.error('Failed to fetch payments from DB:', err));
    }

    // Fetch Categories and Menu (For RESTAURANT_ADMIN & KITCHEN_STAFF)
    if (currentUser.role === 'RESTAURANT_ADMIN' || currentUser.role === 'KITCHEN_STAFF') {
      authFetch(`${API_URL}/categories`)
        .then(resData => {
          if (resData.success && Array.isArray(resData.data)) {
            const fetchedCategories = resData.data.map((c: any) => ({
              id: c._id,
              name: c.name,
              description: c.description || '',
              itemCount: c.itemCount || 0,
              isActive: c.isActive
            }));

            setCategories((prev) => {
              const catMap = new Map<string, Category>();
              catMap.set('cat_all', {
                id: 'cat_all',
                name: 'All',
                description: 'All items',
                itemCount: 0,
                isActive: true,
              });

              // Add from backend categories
              fetchedCategories.forEach((c: Category) => catMap.set(c.id, c));

              // Preserve any existing menu-derived categories
              prev.forEach((c) => {
                if (!catMap.has(c.id)) {
                  catMap.set(c.id, c);
                }
              });

              const result = Array.from(catMap.values());
              saveStorage('restro_categories', result);
              return result;
            });
          }
        })
        .catch(err => console.error('Failed to fetch categories:', err));

      authFetch(`${API_URL}/menu`)
        .then(resData => {
          if (resData.success && Array.isArray(resData.data)) {
            const itemsToUse = resData.data.length > 0 ? resData.data : MOCK_MENU_ITEMS;
            const dbMenuItems = itemsToUse.map((m: any) => ({
              id: m._id || m.id,
              categoryId: m.categoryId?._id || m.categoryId || 'cat_general',
              categoryName: m.categoryId?.name || m.categoryName || 'General',
              name: m.name,
              description: m.description || '',
              price: m.price,
              discountPrice: m.discountPrice,
              image: (typeof m.image === 'object' && m.image?.secure_url) ? m.image.secure_url : (m.imageUrl || m.image || ''),
              isAvailable: m.isAvailable !== false,
              requiresKitchen: m.requiresKitchen !== false
            }));
            setMenuItems(dbMenuItems);
            saveStorage('restro_menu_items', dbMenuItems);

            // Auto-derive categories from the single /menu JSON response!
            setCategories((prev) => {
              const catMap = new Map<string, Category>();
              catMap.set('cat_all', {
                id: 'cat_all',
                name: 'All',
                description: 'All menu items',
                itemCount: dbMenuItems.length,
                isActive: true,
              });

              // Keep existing categories
              prev.forEach((c) => {
                if (c.id !== 'cat_all') catMap.set(c.id, { ...c, itemCount: 0 });
              });

              // Add / update categories from menu items
              dbMenuItems.forEach((item: any) => {
                const cId = item.categoryId;
                const cName = item.categoryName || 'General';
                if (cId && cId !== 'cat_all') {
                  if (!catMap.has(cId)) {
                    catMap.set(cId, {
                      id: cId,
                      name: cName,
                      description: '',
                      itemCount: 1,
                      isActive: true,
                    });
                  } else {
                    const existing = catMap.get(cId)!;
                    existing.itemCount = (existing.itemCount || 0) + 1;
                    if (!existing.name || existing.name === 'General') {
                      existing.name = cName;
                    }
                  }
                }
              });

              const result = Array.from(catMap.values());
              saveStorage('restro_categories', result);
              return result;
            });
          }
        })
        .catch(err => console.error('Failed to fetch menu items:', err));
    }

  }, [currentUser?.restaurantId]);

  // MONGODB SYNC: Fetch real restaurants (For Super Admin & login matches)
  useEffect(() => {
    if (typeof window === 'undefined' || currentUser?.role !== 'SUPER_ADMIN') return;
    
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    authFetch(`${API_URL}/restaurants`)
      .then(resData => {
        if (resData.success && Array.isArray(resData.data)) {
          const dbRestaurants: Restaurant[] = resData.data.map((dbRest: any) => ({
            id: dbRest._id,
            name: dbRest.name,
            ownerName: dbRest.ownerName || 'Owner',
            email: dbRest.email,
            phone: dbRest.phone,
            address: dbRest.address,
            city: dbRest.city,
            status: dbRest.status,
            ordersCount: dbRest.metrics?.totalOrders || 0,
            salesTotal: dbRest.metrics?.totalRevenue || 0,
            activeMenuCount: 0,
            createdAt: dbRest.createdAt
          }));
          
          setRestaurants(dbRestaurants);
          saveStorage('restro_restaurants', dbRestaurants);
        }
      })
      .catch(err => console.error('Failed to fetch restaurants from DB:', err));
  }, [currentUser]); // fetch when user logs in

  // Sound notification (Loud dual-tone kitchen order chime)
  const playOrderNotificationSound = () => {
    if (typeof window !== 'undefined') {
      try {
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        
        // First Bell Tone (880Hz)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(880, audioCtx.currentTime);
        gain1.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.start(audioCtx.currentTime);
        osc1.stop(audioCtx.currentTime + 0.3);

        // Second Higher Bell Tone (1320Hz)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, audioCtx.currentTime + 0.15);
        gain2.gain.setValueAtTime(0.6, audioCtx.currentTime + 0.15);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start(audioCtx.currentTime + 0.15);
        osc2.stop(audioCtx.currentTime + 0.6);
      } catch (e) {
        console.log('Audio playback prevented or unsupported', e);
      }
    }
  };

  // Listen for real-time order broadcasts across browser tabs and computers
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let socket: any = null;

    try {
      // 1. Local Cross-tab sync
      const channelName = currentUser?.restaurantId ? `restro_orders_sync_${currentUser.restaurantId}` : 'restro_orders_sync';
      const channel = new BroadcastChannel(channelName);
      channel.onmessage = (event) => {
        const { type, order, orderId, status, payment } = event.data || {};
        if (order?.restaurantId && currentUser?.restaurantId && String(order.restaurantId) !== String(currentUser.restaurantId)) return;
        if (type === 'NEW_ORDER' && order) {
          setOrders((prev) => {
            if (prev.some((o) => (o.id || o.orderNumber) === (order.id || order.orderNumber))) return prev;
            return [order, ...prev];
          });

          // Sync payment transaction in real-time
          const payItem: PaymentTransaction = payment || {
            id: `pay_${order.id}`,
            restaurantId: order.restaurantId || currentUser?.restaurantId,
            orderId: order.id,
            orderNumber: order.orderNumber,
            amount: order.total,
            method: order.paymentMethod || 'CASH',
            status: 'SUCCESS',
            createdAt: order.createdAt || new Date().toISOString(),
          };

          setPayments((prev) => {
            if (prev.some((p) => p.orderId === payItem.orderId || p.orderNumber === payItem.orderNumber)) return prev;
            const updated = [payItem, ...prev];
            saveStorage('restro_payments', updated);
            return updated;
          });

          playOrderNotificationSound();
          toast.success("NEW KITCHEN TICKET! Order #" + order.orderNumber);
        } else if (type === 'UPDATE_STATUS' && orderId && status) {
          setOrders((prev) => prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status } : o)));
        } else if (type === 'ORDER_UPDATED' && order) {
          setOrders((prev) => prev.map((o) => (o.id === order.id || o.orderNumber === order.orderNumber ? order : o)));
          playOrderNotificationSound();
        }
      };

      // 2. Global Cross-computer sync (Socket.IO)
      const token = localStorage.getItem('accessToken');
      if (token && currentUser && currentUser.role !== 'SUPER_ADMIN') {
        import('socket.io-client').then(({ io }) => {
          socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket', 'polling'] });

          socket.on('new-order', (payload: any) => {
            if (payload?.order) {
              const newOrder = payload.order;
              if (newOrder.restaurantId && currentUser?.restaurantId && String(newOrder.restaurantId) !== String(currentUser.restaurantId)) return;
              setOrders((prev) => {
                if (prev.some((o) => (o.id || o.orderNumber) === (newOrder._id || newOrder.id || newOrder.orderNumber))) return prev;
                const normalized = {
                  id: newOrder._id || newOrder.id,
                  orderNumber: newOrder.orderNumber?.toString(),
                  restaurantId: newOrder.restaurantId,
                  items: newOrder.items.map((i: any) => ({
                    itemId: i.menuItemId || i.itemId, name: i.name, price: i.price, quantity: i.quantity, requiresKitchen: i.requiresKitchen, notes: i.notes
                  })),
                  subtotal: newOrder.subtotal, tax: newOrder.tax, discount: newOrder.discount, total: newOrder.grandTotal || newOrder.total,
                  paymentMethod: newOrder.paymentMethod, paymentStatus: newOrder.paymentStatus, status: newOrder.orderStatus || newOrder.status,
                  createdAt: newOrder.createdAt, updatedAt: newOrder.updatedAt, customerName: newOrder.customerName, customerPhone: newOrder.customerPhone,
                };
                return [normalized as Order, ...prev];
              });

              // Add to real-time live payments
              const payItem: PaymentTransaction = {
                id: `pay_${newOrder._id || newOrder.id}`,
                restaurantId: newOrder.restaurantId || currentUser?.restaurantId,
                orderId: newOrder._id || newOrder.id,
                orderNumber: newOrder.orderNumber?.toString() || '1001',
                amount: newOrder.grandTotal || newOrder.total,
                method: newOrder.paymentMethod || 'CASH',
                status: 'SUCCESS',
                createdAt: newOrder.createdAt || new Date().toISOString(),
              };

              setPayments((prev) => {
                if (prev.some((p) => p.orderId === payItem.orderId || p.orderNumber === payItem.orderNumber)) return prev;
                const updated = [payItem, ...prev];
                saveStorage('restro_payments', updated);
                return updated;
              });
            }
          });

          socket.on('payment-updated', (payload: any) => {
            if (payload?.payment) {
              const p = payload.payment;
              if (p.restaurantId && currentUser?.restaurantId && String(p.restaurantId) !== String(currentUser.restaurantId)) return;
              const payItem: PaymentTransaction = {
                id: p._id || p.id,
                restaurantId: p.restaurantId || currentUser?.restaurantId,
                orderId: (typeof p.orderId === 'object' && p.orderId?._id) ? p.orderId._id : (p.orderId || ''),
                orderNumber: (typeof p.orderId === 'object' && p.orderId?.orderNumber) ? String(p.orderId.orderNumber) : (p.orderNumber ? String(p.orderNumber) : '1001'),
                amount: p.amount,
                method: p.method,
                status: p.status === 'PAID' ? 'SUCCESS' : (p.status || 'SUCCESS'),
                createdAt: p.paidAt || p.createdAt || new Date().toISOString(),
              };

              setPayments((prev) => {
                const filtered = prev.filter((item) => item.id !== payItem.id && item.orderId !== payItem.orderId);
                const updated = [payItem, ...filtered];
                saveStorage('restro_payments', updated);
                return updated;
              });
            }
          });

          const statusEvents = ['order-accepted', 'order-preparing', 'order-ready', 'order-completed', 'order-cancelled'];
          statusEvents.forEach((evt) => {
            socket.on(evt, (payload: any) => {
              if (payload?.order) {
                const targetId = payload.order._id || payload.order.id;
                const nextStatus = payload.order.orderStatus || payload.order.status;
                const updatedItems = payload.order.items?.map((i: any) => ({
                  itemId: i.menuItemId || i.itemId, name: i.name, price: i.price, quantity: i.quantity, requiresKitchen: i.requiresKitchen, notes: i.notes
                }));
                setOrders((prev) => prev.map((o) => {
                  if (o.id === targetId || o.orderNumber === (payload.order.orderNumber?.toString() || targetId)) {
                    return {
                      ...o,
                      status: nextStatus,
                      ...(updatedItems ? { items: updatedItems } : {}),
                      ...(payload.order.grandTotal !== undefined ? { total: payload.order.grandTotal } : {}),
                      ...(payload.order.subtotal !== undefined ? { subtotal: payload.order.subtotal } : {}),
                      ...(payload.order.tax !== undefined ? { tax: payload.order.tax } : {}),
                    };
                  }
                  return o;
                }));
              }
            });
          });
        });
      }

      return () => {
        channel.close();
        if (socket) socket.disconnect();
      };
    } catch (e) {
      console.log('Sync init error:', e);
    }
  }, [currentUser]); // Re-run if user changes

  // Auth actions
  const loginAs = (role: 'SUPER_ADMIN' | 'RESTAURANT_ADMIN' | 'KITCHEN_STAFF', customUser?: User) => {
    let userToSet: User;
    if (customUser) {
      userToSet = customUser;
    } else if (role === 'SUPER_ADMIN') {
      userToSet = MOCK_USERS.superadmin;
    } else {
      const activeRest = restaurants[0];
      userToSet = {
        id: activeRest ? `user_${activeRest.id}` : 'usr_restroadmin_1',
        name: activeRest ? `${activeRest.ownerName} (Admin)` : 'Restaurant Admin',
        email: activeRest ? activeRest.email : 'admin@restrocounter.com',
        role: role === 'KITCHEN_STAFF' ? 'KITCHEN_STAFF' : 'RESTAURANT_ADMIN',
        restaurantId: activeRest ? activeRest.id : 'rest_default',
        restaurantName: activeRest ? activeRest.name : 'Counter Restaurant Outlet',
      };
    }
    setCurrentUser(userToSet);
    saveStorage('user', userToSet);
    toast.dismiss();
    toast.success(`Logged in as ${userToSet.name}`);
  };



  // Restaurant actions (Super Admin)
  const addRestaurant = async (data: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    let finalId = `rest_${Date.now()}`;
    let savedRest: any = null;

    if (token) {
      try {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('ownerName', data.ownerName);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('address', data.address);
        formData.append('city', data.city);
        formData.append('adminEmail', data.email);
        formData.append('adminPassword', data.password || 'RestroAdmin123!');

        const res = await fetch(`${API_URL}/restaurants`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const resData = await res.json();
        if (resData.success) {
          savedRest = resData.data;
          finalId = savedRest._id;
        } else {
          toast.error(resData.message || 'Failed to create restaurant');
          return null;
        }
      } catch (e) {
        console.error('Backend sync offline:', e);
        toast.error('Failed to connect to server');
        return null;
      }
    }

    const newRest: Restaurant = {
      ...data,
      id: finalId,
      ordersCount: 0,
      salesTotal: 0,
      activeMenuCount: 0,
      createdAt: savedRest ? savedRest.createdAt : new Date().toISOString(),
    };

    setRestaurants((prev) => {
      const updated = [newRest, ...prev];
      saveStorage('restro_restaurants', updated);
      return updated;
    });

    toast.success(`Restaurant "${newRest.name}" added successfully`);
    return newRest;
  };

  const updateRestaurantStatus = async (id: string, status: RestaurantStatus) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const res = await fetch(`${API_URL}/restaurants/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status })
        });
        const resData = await res.json();
        if (!resData.success) {
          toast.error(resData.message || 'Failed to update status');
          return;
        }
      } catch (err) {
        console.error('Update status error:', err);
        return;
      }
    }
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast.success(`Restaurant status updated to ${status}`);
  };

  const updateRestaurant = async (id: string, data: Partial<Restaurant>) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const res = await fetch(`${API_URL}/restaurants/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(data)
        });
        const resData = await res.json();
        if (!resData.success) {
          toast.error(resData.message || 'Failed to update restaurant');
          return;
        }
      } catch (err) {
        console.error('Update restaurant error:', err);
        return;
      }
    }
    setRestaurants((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    toast.success('Restaurant details updated');
  };

  const deleteRestaurant = async (id: string): Promise<boolean> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const res = await fetch(`${API_URL}/restaurants/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const resData = await res.json();
        if (!resData.success) {
          toast.error(resData.message || 'Failed to delete restaurant');
          return false;
        }
      } catch (err) {
        console.error('Delete restaurant error:', err);
        toast.error('Failed to delete restaurant from server');
        return false;
      }
    }

    setRestaurants((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveStorage('restro_restaurants', updated);
      return updated;
    });

    toast.success('Restaurant outlet deleted successfully');
    return true;
  };

  const updateRestaurantPassword = async (id: string, password: string): Promise<boolean> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const res = await fetch(`${API_URL}/restaurants/${id}/password`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password }),
        });
        const resData = await res.json();
        if (!resData.success) {
          toast.error(resData.message || 'Failed to update restaurant password');
          return false;
        }
        toast.success('Restaurant login password updated successfully');
        return true;
      } catch (err) {
        console.error('Update restaurant password error:', err);
        toast.error('Failed to update password on server');
        return false;
      }
    }
    toast.success('Restaurant password updated locally');
    return true;
  };

  const updateCurrentRestaurant = async (data: Partial<Restaurant>): Promise<boolean> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return false;

    try {
      const res = await fetch(`${API_URL}/restaurants/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!resData.success) {
        toast.error(resData.message || 'Failed to update restaurant settings');
        return false;
      }

      const r = resData.data;
      const updated: Restaurant = {
        ...(currentRestaurant || ({} as Restaurant)),
        ...data,
        ...(r
          ? {
              id: r._id || r.id || currentRestaurant?.id,
              name: r.name || data.name || currentRestaurant?.name,
              ownerName: r.ownerName || data.ownerName || currentRestaurant?.ownerName,
              email: r.email || data.email || currentRestaurant?.email,
              phone: r.phone || data.phone || currentRestaurant?.phone,
              address: r.address || data.address || currentRestaurant?.address,
              city: r.city || data.city || currentRestaurant?.city,
              gstin: r.gstin !== undefined ? r.gstin : data.gstin,
              gstRate: r.gstRate !== undefined ? Number(r.gstRate) : data.gstRate,
              receiptHeader: r.receiptHeader !== undefined ? r.receiptHeader : data.receiptHeader,
              receiptFooter: r.receiptFooter !== undefined ? r.receiptFooter : data.receiptFooter,
            }
          : {}),
      };

      setCurrentRestaurant(updated);
      saveStorage('restro_profile', updated);

      if (data.name && currentUser) {
        const updatedUser: User = {
          ...currentUser,
          restaurantName: data.name,
          ...(data.ownerName ? { name: `${data.ownerName} (Counter Admin)` } : {}),
          ...(data.phone ? { phone: data.phone } : {}),
        };
        setCurrentUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }

      toast.success('Restaurant profile and GST billing settings saved successfully!');
      return true;
    } catch (err) {
      console.error('Update restaurant settings error:', err);
      toast.error('Network error saving settings');
      return false;
    }
  };

  // Leads actions
  const addLead = async (data: Omit<Lead, 'id' | 'status' | 'createdAt'>) => {
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!resData.success) {
        toast.error(resData.message || 'Failed to submit request');
        return;
      }
      
      const l = resData.data;
      const newLead: Lead = {
        id: l._id,
        restaurantName: l.restaurantName,
        ownerName: l.ownerName || l.name || '',
        phone: l.phone,
        email: l.email,
        city: l.city,
        approxOrdersPerDay: l.approxOrdersPerDay || '0',
        currentPos: l.currentPos,
        message: l.message || l.notes,
        status: l.status,
        createdAt: l.createdAt
      };
      setLeads((prev) => [newLead, ...prev]);
      toast.success('Thank you! Your demo request has been received.');
    } catch (err) {
      console.error('Lead submission error:', err);
      toast.error('Failed to submit request');
    }
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const res = await fetch(`${API_URL}/leads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status })
        });
        const resData = await res.json();
        if (!resData.success) {
          toast.error(resData.message || 'Failed to update lead status');
          return;
        }
      } catch (err) {
        console.error('Update lead error:', err);
        return;
      }
    }
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    toast.success(`Lead status updated to ${status}`);
  };

  // Category actions
  const addCategory = async (name: string, description?: string): Promise<Category | null> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const res = await fetch(`${API_URL}/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(currentUser?.restaurantId ? { 'x-restaurant-id': currentUser.restaurantId } : {})
          },
          body: JSON.stringify({
            name,
            description,
            restaurantId: currentUser?.restaurantId
          })
        });
        const resData = await res.json();
        if (resData.success && resData.data) {
          const c = resData.data;
          const newCat: Category = {
            id: c._id || c.id,
            name: c.name,
            description: c.description || '',
            itemCount: c.itemCount || 0,
            isActive: c.isActive !== false,
          };
          setCategories((prev) => {
            if (prev.some((x) => x.id === newCat.id || x.name.toLowerCase() === newCat.name.toLowerCase())) {
              return prev;
            }
            return [...prev, newCat];
          });
          toast.success(`Category "${name}" added`);
          return newCat;
        }
      } catch (err) {
        console.error('Failed to create category:', err);
      }
    }
    return null;
  };

  const updateCategory = (id: string, name: string, description?: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      fetch(`${API_URL}/categories/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(currentUser?.restaurantId ? { 'x-restaurant-id': currentUser.restaurantId } : {})
        },
        body: JSON.stringify({ name, description })
      }).catch(err => console.error('Update category error:', err));
    }
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name, description } : c)));
    toast.success('Category updated');
  };

  const deleteCategory = (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          ...(currentUser?.restaurantId ? { 'x-restaurant-id': currentUser.restaurantId } : {})
        }
      }).catch(err => console.error('Delete category error:', err));
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.success('Category deleted');
  };

  // Menu Item actions
  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const res = await fetch(`${API_URL}/menu`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(currentUser?.restaurantId ? { 'x-restaurant-id': currentUser.restaurantId } : {})
          },
          body: JSON.stringify({
            restaurantId: currentUser?.restaurantId,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            discountPrice: item.discountPrice ? Number(item.discountPrice) : undefined,
            isAvailable: item.isAvailable !== false,
            requiresKitchen: item.requiresKitchen !== false,
            image: item.image
          })
        });
        const resData = await res.json();
        if (resData.success) {
          const m = resData.data;
          const imgUrl = (typeof m.image === 'object' && m.image?.secure_url)
            ? m.image.secure_url
            : (typeof m.image === 'string' ? m.image : (m.imageUrl || item.image || ''));
          const newItem: MenuItem = {
            id: m._id,
            categoryId: m.categoryId?._id || m.categoryId || item.categoryId,
            categoryName: m.categoryId?.name || item.categoryName,
            name: m.name,
            description: m.description || '',
            price: m.price,
            discountPrice: m.discountPrice,
            image: imgUrl,
            isAvailable: m.isAvailable !== false,
            requiresKitchen: m.requiresKitchen !== false,
          };
          setMenuItems((prev) => {
            const next = [newItem, ...prev];
            saveStorage('restro_menu_items', next);
            return next;
          });
          setCategories((prev) => prev.map((c) => c.id === item.categoryId ? { ...c, itemCount: c.itemCount + 1 } : c));
          toast.success(`Item "${item.name}" added to menu`);
        } else {
          toast.error(resData.message || 'Failed to add menu item');
        }
      } catch (err) {
        console.error('Add menu item error:', err);
        toast.error('Failed to add menu item');
      }
    }
  };

  const updateMenuItem = async (id: string, item: Partial<MenuItem>) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const res = await fetch(`${API_URL}/menu/${id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(currentUser?.restaurantId ? { 'x-restaurant-id': currentUser.restaurantId } : {})
          },
          body: JSON.stringify({
            restaurantId: currentUser?.restaurantId,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            name: item.name,
            description: item.description,
            price: item.price !== undefined ? Number(item.price) : undefined,
            discountPrice: item.discountPrice !== undefined ? Number(item.discountPrice) : undefined,
            isAvailable: item.isAvailable,
            requiresKitchen: item.requiresKitchen,
            image: item.image
          })
        });
        const resData = await res.json();
        if (resData.success) {
          const m = resData.data;
          const imgUrl = (typeof m.image === 'object' && m.image?.secure_url)
            ? m.image.secure_url
            : (typeof m.image === 'string' ? m.image : (m.imageUrl || item.image || ''));
          const updatedItem = {
            ...item,
            image: imgUrl,
          };
          setMenuItems((prev) => {
            const next = prev.map((mi) => (mi.id === id ? { ...mi, ...updatedItem } : mi));
            saveStorage('restro_menu_items', next);
            return next;
          });
          toast.success('Menu item updated');
        } else {
          toast.error(resData.message || 'Failed to update menu item');
        }
      } catch (err) {
        console.error('Update menu item error:', err);
        toast.error('Failed to update menu item');
      }
    }
  };

  const toggleMenuItemAvailability = (id: string) => {
    setMenuItems((prev) => {
      const item = prev.find(mi => mi.id === id);
      if (item) {
        const nextStatus = !item.isAvailable;
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token) {
          fetch(`${API_URL}/menu/${id}/availability`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ isAvailable: nextStatus })
          }).catch(err => console.error('Toggle error:', err));
        }
      }
      return prev.map((mi) => (mi.id === id ? { ...mi, isAvailable: !mi.isAvailable } : mi));
    });
  };

  const deleteMenuItem = (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      fetch(`${API_URL}/menu/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => console.error('Delete error:', err));
    }
    setMenuItems((prev) => prev.filter((mi) => mi.id !== id));
    toast.success('Menu item removed');
  };

  // Cart actions
  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      toast.error(`${item.name} is currently out of stock`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((ci) => ci.itemId === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.itemId === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          price: item.discountPrice || item.price,
          quantity: 1,
          requiresKitchen: item.requiresKitchen !== false,
          image: item.image,
        },
      ];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.itemId !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((ci) => (ci.itemId === itemId ? { ...ci, quantity } : ci))
    );
  };

  const updateCartItemNotes = (itemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((ci) => (ci.itemId === itemId ? { ...ci, notes } : ci))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const activeGstRate = currentRestaurant?.gstRate !== undefined ? currentRestaurant.gstRate : 5;
  const cartTax = Math.round(cartSubtotal * (activeGstRate / 100));
  const cartTotal = cartSubtotal + cartTax;

  // Helper to find customer khata account
  const getCustomerKhata = (customerNameOrPhone: string): KhataAccount | undefined => {
    if (!customerNameOrPhone) return undefined;
    const term = customerNameOrPhone.trim().toLowerCase();
    return khataAccounts.find(
      (a) =>
        a.customerName.toLowerCase() === term ||
        (a.customerPhone && a.customerPhone.includes(term))
    );
  };

  // Record Khata Payment (Customer paying back pending due)
  const recordKhataPayment = (
    accountId: string,
    amount: number,
    method: PaymentMethod,
    notes?: string
  ) => {
    if (amount <= 0) return;

    setKhataAccounts((prev) => {
      const updated = prev.map((acc) => {
        if (acc.id === accountId) {
          const newDue = Math.max(0, acc.totalDue - amount);
          const newTx: KhataTransaction = {
            id: `ktx_${Date.now()}`,
            type: 'PAYMENT_RECEIVED',
            amount,
            paymentMethod: method,
            notes: notes || 'Pending due cleared',
            createdAt: new Date().toISOString(),
          };
          return {
            ...acc,
            totalDue: newDue,
            totalPaid: acc.totalPaid + amount,
            lastUpdated: new Date().toISOString(),
            transactions: [newTx, ...acc.transactions],
          };
        }
        return acc;
      });
      saveStorage('restro_khata', updated);
      return updated;
    });

    // Also record in payment ledger
    const newPayment: PaymentTransaction = {
      id: `pay_khata_${Date.now()}`,
      restaurantId: currentUser?.restaurantId,
      orderId: `khata_${accountId}`,
      orderNumber: `KHATA-${accountId.slice(-4)}`,
      amount,
      method,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };

    setPayments((prev) => {
      const updated = [newPayment, ...prev];
      saveStorage('restro_payments', updated);
      return updated;
    });

    toast.success(`Received ${amount} payment for Khata. Updated due balance.`);
  };

  // Order & POS actions
  const createOrder = async (
    paymentMethod: PaymentMethod,
    customerPhone?: string,
    customerName?: string,
    paidAmount?: number,
    dueAmount?: number,
    vehicleNumber?: string
  ): Promise<Order> => {
    const orderNum = (1025 + orders.length + 1).toString();
    const hasKitchenItems = cart.some((ci) => ci.requiresKitchen !== false);

    const actualPaid = paidAmount !== undefined ? paidAmount : cartTotal;
    const actualDue = dueAmount !== undefined ? dueAmount : Math.max(0, cartTotal - actualPaid);
    const isFullPaid = actualDue <= 0;

    let newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: orderNum,
      restaurantId: currentUser?.restaurantId || 'rest_1',
      items: cart.map(({ itemId, name, price, quantity, requiresKitchen, notes }) => ({
        itemId,
        name,
        price,
        quantity,
        requiresKitchen: requiresKitchen !== false,
        notes,
      })),
      subtotal: cartSubtotal,
      tax: cartTax,
      discount: 0,
      total: cartTotal,
      paidAmount: actualPaid,
      dueAmount: actualDue,
      paymentMethod,
      paymentStatus: isFullPaid ? 'PAID' : actualPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING',
      status: hasKitchenItems ? 'NEW' : 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName,
      customerPhone,
      vehicleNumber,
    };

    // Auto-update Khata if there is dueAmount or customer exists
    if (customerName || customerPhone) {
      const custKey = (customerName || customerPhone || '').trim();
      setKhataAccounts((prev) => {
        let existing = prev.find(
          (a) =>
            (customerName && a.customerName.toLowerCase() === customerName.toLowerCase()) ||
            (customerPhone && a.customerPhone === customerPhone)
        );

        let updated: KhataAccount[];

        const newTx: KhataTransaction = {
          id: `ktx_${Date.now()}`,
          restaurantId: currentUser?.restaurantId,
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber,
          type: actualDue > 0 ? 'DUE_ADDED' : 'PAYMENT_RECEIVED',
          amount: actualDue > 0 ? actualDue : actualPaid,
          paymentMethod,
          notes: actualDue > 0
            ? `Order #${orderNum}: Paid ${actualPaid}, Balance Due ${actualDue}`
            : `Order #${orderNum}: Fully paid`,
          createdAt: new Date().toISOString(),
        };

        if (existing) {
          updated = prev.map((a) => {
            if (a.id === existing!.id) {
              return {
                ...a,
                customerName: customerName || a.customerName,
                customerPhone: customerPhone || a.customerPhone,
                totalDue: a.totalDue + actualDue,
                totalPaid: a.totalPaid + actualPaid,
                ordersCount: a.ordersCount + 1,
                lastUpdated: new Date().toISOString(),
                transactions: [newTx, ...a.transactions],
              };
            }
            return a;
          });
        } else if (actualDue > 0 || actualPaid > 0) {
          const newAccount: KhataAccount = {
            id: `khata_${Date.now()}`,
            restaurantId: currentUser?.restaurantId,
            customerName: customerName || `Customer (${customerPhone})`,
            customerPhone,
            totalDue: actualDue,
            totalPaid: actualPaid,
            ordersCount: 1,
            lastUpdated: new Date().toISOString(),
            transactions: [newTx],
          };
          updated = [newAccount, ...prev];
        } else {
          updated = prev;
        }

        saveStorage('restro_khata', updated);
        return updated;
      });
    }

    // MONGODB SYNC: Push new order to backend
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              items: newOrder.items.map(i => ({
                menuItemId: i.itemId,
                quantity: i.quantity,
                notes: i.notes
              })),
              paymentMethod: newOrder.paymentMethod,
              discount: newOrder.discount,
              tax: newOrder.tax,
              confirmPayment: isFullPaid,
              customerName: newOrder.customerName,
              customerPhone: newOrder.customerPhone,
              vehicleNumber: newOrder.vehicleNumber
            })
          });
          const resData = await res.json();
          if (resData.success) {
            const dbOrder = resData.data;
            newOrder = {
              ...newOrder,
              id: dbOrder._id || dbOrder.id,
              orderNumber: dbOrder.orderNumber || newOrder.orderNumber,
              createdAt: dbOrder.createdAt,
              updatedAt: dbOrder.updatedAt
            };
          } else {
            console.error('Failed to create order in DB:', resData.message);
          }
        } catch (err) {
          console.error('Failed to sync new order to DB:', err);
        }
      }
    }

    const newPayment: PaymentTransaction = {
      id: `pay_${Date.now()}`,
      restaurantId: newOrder.restaurantId || currentUser?.restaurantId,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      amount: actualPaid,
      method: paymentMethod,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      saveStorage('restro_orders', updated);
      return updated;
    });

    if (actualPaid > 0) {
      setPayments((prev) => {
        const updated = [newPayment, ...prev];
        saveStorage('restro_payments', updated);
        return updated;
      });
    }

    clearCart();

    // Broadcast to other open browser tabs (e.g. Kitchen Display screen)
    if (typeof window !== 'undefined') {
      try {
        const channelName = currentUser?.restaurantId ? `restro_orders_sync_${currentUser.restaurantId}` : 'restro_orders_sync';
        const channel = new BroadcastChannel(channelName);
        channel.postMessage({ type: 'NEW_ORDER', order: newOrder, payment: newPayment });
        channel.close();
      } catch (e) {}
    }

    // Trigger visual + sound alert for kitchen / counter
    playOrderNotificationSound();
    if (actualDue > 0) {
      toast.warning(`Order #${newOrder.orderNumber}: Received ${actualPaid}, Balance Due ${actualDue} recorded to Khata Book!`);
    } else {
      toast.success(`Order #${newOrder.orderNumber} created successfully via ${paymentMethod}`);
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    // Broadcast status change to other tabs
    if (typeof window !== 'undefined') {
      try {
        const channelName = currentUser?.restaurantId ? `restro_orders_sync_${currentUser.restaurantId}` : 'restro_orders_sync';
        const channel = new BroadcastChannel(channelName);
        channel.postMessage({ type: 'UPDATE_STATUS', orderId, status });
        channel.close();
      } catch (e) {}

      // MONGODB SYNC
      const token = localStorage.getItem('accessToken');
      if (token) {
        fetch(`${API_URL}/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }).catch(err => console.error('Failed to sync status to DB:', err));
      }
    }

    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id === orderId) {
          const itemUpdated = { ...o, status, updatedAt: new Date().toISOString() };
          toast.info(`Order #${o.orderNumber} status changed to ${status}`);
          if (status === 'READY') {
            playOrderNotificationSound();
            toast.success(`Order #${o.orderNumber} is READY for customer pickup!`, {
              duration: 5000,
            });
          }
          return itemUpdated;
        }
        return o;
      });
      saveStorage('restro_orders', updated);
      return updated;
    });
  };

  const addItemsToOrder = async (
    orderId: string,
    newItems: { itemId: string; name: string; price: number; quantity: number; requiresKitchen?: boolean }[],
    paymentMethod?: PaymentMethod
  ): Promise<Order | null> => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) {
      toast.error('Order not found');
      return null;
    }

    // Call Backend API
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const res = await fetch(`${API_URL}/orders/${orderId}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: newItems.map((i) => ({
              menuItemId: i.itemId,
              quantity: i.quantity,
            })),
            paymentMethod,
          }),
        });
        const resData = await res.json();
        if (resData.success && resData.data) {
          const dbOrder = resData.data;
          const updatedOrder: Order = {
            id: dbOrder._id || dbOrder.id,
            orderNumber: (dbOrder.orderNumber || targetOrder.orderNumber).toString(),
            restaurantId: dbOrder.restaurantId,
            items: dbOrder.items.map((i: any) => ({
              itemId: i.menuItemId || i.itemId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              requiresKitchen: i.requiresKitchen,
              notes: i.notes,
            })),
            subtotal: dbOrder.subtotal,
            tax: dbOrder.tax,
            discount: dbOrder.discount,
            total: dbOrder.grandTotal || dbOrder.total,
            paymentMethod: dbOrder.paymentMethod || targetOrder.paymentMethod,
            paymentStatus: dbOrder.paymentStatus || targetOrder.paymentStatus,
            status: dbOrder.orderStatus || dbOrder.status || targetOrder.status,
            createdAt: dbOrder.createdAt || targetOrder.createdAt,
            updatedAt: dbOrder.updatedAt || new Date().toISOString(),
            customerName: dbOrder.customerName || targetOrder.customerName,
            customerPhone: dbOrder.customerPhone || targetOrder.customerPhone,
          };

          setOrders((prev) => {
            const nextList = prev.map((o) => (o.id === orderId ? updatedOrder : o));
            saveStorage('restro_orders', nextList);
            return nextList;
          });

          if (typeof window !== 'undefined') {
            try {
              const channelName = currentUser?.restaurantId ? `restro_orders_sync_${currentUser.restaurantId}` : 'restro_orders_sync';
              const channel = new BroadcastChannel(channelName);
              channel.postMessage({ type: 'ORDER_UPDATED', order: updatedOrder });
              channel.close();
            } catch (e) {}
          }

          toast.success(`Items added to Order #${updatedOrder.orderNumber}`);
          return updatedOrder;
        }
      } catch (err) {
        console.error('Failed to add items via API:', err);
      }
    }

    // Local fallback
    const updatedItems = [...targetOrder.items];
    let hasKitchen = false;
    for (const ni of newItems) {
      if (ni.requiresKitchen !== false) hasKitchen = true;
      const idx = updatedItems.findIndex((it) => it.itemId === ni.itemId);
      if (idx > -1) {
        updatedItems[idx] = {
          ...updatedItems[idx],
          quantity: updatedItems[idx].quantity + ni.quantity,
        };
      } else {
        updatedItems.push({
          itemId: ni.itemId,
          name: ni.name,
          price: ni.price,
          quantity: ni.quantity,
          requiresKitchen: ni.requiresKitchen,
        });
      }
    }

    const subtotal = updatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const tax = Math.round(subtotal * (activeGstRate / 100));
    const total = subtotal + tax - (targetOrder.discount || 0);
    const newStatus = hasKitchen && (targetOrder.status === 'COMPLETED' || targetOrder.status === 'READY') ? 'PREPARING' : targetOrder.status;

    const locallyUpdatedOrder: Order = {
      ...targetOrder,
      items: updatedItems,
      subtotal,
      tax,
      total,
      status: newStatus,
      paymentMethod: paymentMethod || targetOrder.paymentMethod,
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => {
      const nextList = prev.map((o) => (o.id === orderId ? locallyUpdatedOrder : o));
      saveStorage('restro_orders', nextList);
      return nextList;
    });

    if (typeof window !== 'undefined') {
      try {
        const channelName = currentUser?.restaurantId ? `restro_orders_sync_${currentUser.restaurantId}` : 'restro_orders_sync';
        const channel = new BroadcastChannel(channelName);
        channel.postMessage({ type: 'ORDER_UPDATED', order: locallyUpdatedOrder });
        channel.close();
      } catch (e) {}
    }

    toast.success(`Items added to Order #${locallyUpdatedOrder.orderNumber}`);
    return locallyUpdatedOrder;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginAs,
        logout,
        restaurants,
        currentRestaurant,
        updateCurrentRestaurant,
        addRestaurant,
        updateRestaurantStatus,
        updateRestaurant,
        deleteRestaurant,
        updateRestaurantPassword,
        leads,
        addLead,
        updateLeadStatus,
        categories,
        menuItems,
        addCategory,
        updateCategory,
        deleteCategory,
        addMenuItem,
        updateMenuItem,
        toggleMenuItemAvailability,
        deleteMenuItem,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartItemNotes,
        clearCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        orders,
        payments,
        khataAccounts,
        createOrder,
        recordKhataPayment,
        getCustomerKhata,
        addItemsToOrder,
        updateOrderStatus,
        playOrderNotificationSound,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}





