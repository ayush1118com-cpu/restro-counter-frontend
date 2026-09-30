'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config';
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

  // Restaurants (Super Admin)
  restaurants: Restaurant[];
  addRestaurant: (data: Omit<Restaurant, 'id' | 'ordersCount' | 'salesTotal' | 'createdAt' | 'activeMenuCount'>) => Restaurant;
  updateRestaurantStatus: (id: string, status: RestaurantStatus) => void;
  updateRestaurant: (id: string, data: Partial<Restaurant>) => void;

  // Leads (Public & Super Admin)
  leads: Lead[];
  addLead: (data: Omit<Lead, 'id' | 'status' | 'createdAt'>) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;

  // Menu & Categories (Restaurant Admin)
  categories: Category[];
  menuItems: MenuItem[];
  addCategory: (name: string, description?: string) => void;
  updateCategory: (id: string, name: string, description?: string) => void;
  deleteCategory: (id: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  toggleMenuItemAvailability: (id: string) => void;
  deleteMenuItem: (id: string) => void;

  // Cart (Counter POS)
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;

  // Orders & Kitchen
  orders: Order[];
  payments: PaymentTransaction[];
  createOrder: (paymentMethod: PaymentMethod, customerPhone?: string, customerName?: string) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Sound alert trigger
  playOrderNotificationSound: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Cloud data
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

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

  const [leads, setLeads] = useState<Lead[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Helper to persist state to localStorage (Only keeping for user session/auth now)
  const saveStorage = (key: string, data: any) => {
    if (key === 'user' && typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {}
    }
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
    toast.info('Logged out successfully');
  };

  // Authenticated Fetch Wrapper to handle 401/403 (Suspended/Blocked)
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return { success: false };

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    };

    try {
      const res = await fetch(url, { ...options, headers });
      const resData = await res.json();

      if (res.status === 401 || res.status === 403) {
        toast.error(resData.message || 'Session expired or account suspended. Please log in again.');
        logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
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
      restaurants.find((r) => r.phone === currentUser.phone) ||
      restaurants[0]; // fallback to first restaurant

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
        saveStorage('user', updatedUser);
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
        }
      })
      .catch(err => console.error('Failed to fetch orders from DB:', err));

    // Fetch Categories
    authFetch(`${API_URL}/categories`)
      .then(resData => {
        if (resData.success && Array.isArray(resData.data)) {
          const dbCategories = resData.data.map((c: any) => ({
            id: c._id,
            name: c.name,
            description: c.description || '',
            itemCount: c.itemCount || 0,
            isActive: c.isActive
          }));
          setCategories(dbCategories);
        }
      })
      .catch(err => console.error('Failed to fetch categories:', err));

    // Fetch Menu Items
    authFetch(`${API_URL}/menu`)
      .then(resData => {
        if (resData.success && Array.isArray(resData.data)) {
          const dbMenuItems = resData.data.map((m: any) => ({
            id: m._id,
            categoryId: m.category,
            categoryName: m.category?.name || 'Category',
            name: m.name,
            description: m.description || '',
            price: m.price,
            discountPrice: m.discountPrice,
            image: m.imageUrl || m.image || '',
            isAvailable: m.isAvailable !== false,
            requiresKitchen: m.requiresKitchen !== false
          }));
          setMenuItems(dbMenuItems);
        }
      })
      .catch(err => console.error('Failed to fetch menu items:', err));

  }, [currentUser?.restaurantId]);

  // MONGODB SYNC: Fetch real restaurants (For Super Admin & login matches)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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

  // Listen for real-time order broadcasts across browser tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.onmessage = (event) => {
        const { type, order, orderId, status } = event.data || {};
        if (type === 'NEW_ORDER' && order) {
          setOrders((prev) => {
            if (prev.some((o) => (o.id || o.orderNumber) === (order.id || order.orderNumber))) return prev;
            const updated = [order, ...prev];
            saveStorage('restro_orders', updated);
            return updated;
          });
          playOrderNotificationSound();
          toast.success(`🔔 NEW KITCHEN TICKET! Order #${order.orderNumber}`);
        } else if (type === 'UPDATE_STATUS' && orderId && status) {
          setOrders((prev) => {
            const updated = prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status } : o));
            saveStorage('restro_orders', updated);
            return updated;
          });
        }
      };

      return () => channel.close();
    } catch (e) {
      console.log('BroadcastChannel sync error:', e);
    }
  }, []);

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
  const addRestaurant = (data: any): Restaurant => {
    const newRest: Restaurant = {
      ...data,
      id: `rest_${Date.now()}`,
      ordersCount: 0,
      salesTotal: 0,
      activeMenuCount: 0,
      createdAt: new Date().toISOString(),
    };
    setRestaurants((prev) => {
      const updated = [newRest, ...prev];
      saveStorage('restro_restaurants', updated);
      return updated;
    });

    // Sync to Backend Mongo API if authenticated
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      // Create FormData because backend uses multer uploadSingleImage
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('ownerName', data.ownerName);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('adminEmail', data.email);
      formData.append('adminPassword', data.password || 'RestroAdmin123!');

      fetch(`${API_URL}/restaurants`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }).catch((e) => console.log('Backend sync offline:', e));
    }

    toast.success(`Restaurant "${newRest.name}" added successfully`);
    return newRest;
  };

  const updateRestaurantStatus = (id: string, status: RestaurantStatus) => {
    setRestaurants((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, status } : r));
      saveStorage('restro_restaurants', updated);
      return updated;
    });
    toast.success(`Restaurant status updated to ${status}`);
  };

  const updateRestaurant = (id: string, data: Partial<Restaurant>) => {
    setRestaurants((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, ...data } : r));
      saveStorage('restro_restaurants', updated);
      return updated;
    });
    toast.success('Restaurant details updated');
  };

  // Leads actions
  const addLead = (data: Omit<Lead, 'id' | 'status' | 'createdAt'>) => {
    const newLead: Lead = {
      ...data,
      id: `lead_${Date.now()}`,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    setLeads((prev) => {
      const updated = [newLead, ...prev];
      saveStorage('restro_leads', updated);
      return updated;
    });
    toast.success('Thank you! Your demo request has been received.');
  };

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, status } : l));
      saveStorage('restro_leads', updated);
      return updated;
    });
    toast.success(`Lead status updated to ${status}`);
  };

  // Category actions
  const addCategory = (name: string, description?: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      }).then(res => res.json()).then(resData => {
        if(resData.success) {
           const c = resData.data;
           const newCat = { id: c._id, name: c.name, description: c.description || '', itemCount: c.itemCount || 0, isActive: c.isActive };
           setCategories(prev => [...prev, newCat]);
        }
      });
    }
    toast.success(`Category "${name}" added`);
  };

  const updateCategory = (id: string, name: string, description?: string) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, name, description } : c));
      return updated;
    });
    toast.success('Category updated');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      return updated;
    });
    toast.success('Category deleted');
  };

  // Menu Item actions
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      const formData = new FormData();
      formData.append('name', item.name);
      formData.append('category', item.categoryId);
      formData.append('price', item.price.toString());
      if (item.discountPrice) formData.append('discountPrice', item.discountPrice.toString());
      formData.append('description', item.description || '');
      formData.append('isAvailable', String(item.isAvailable));
      
      fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      }).then(res => res.json()).then(resData => {
         if(resData.success) {
            const m = resData.data;
            const newItem: MenuItem = {
              id: m._id, categoryId: m.category, categoryName: item.categoryName, name: m.name, description: m.description || '',
              price: m.price, discountPrice: m.discountPrice, image: m.imageUrl || '',
              isAvailable: m.isAvailable !== false, requiresKitchen: m.requiresKitchen !== false
            };
            setMenuItems(prev => [newItem, ...prev]);
         }
      });
    }

    setCategories((prev) => prev.map((c) => c.id === item.categoryId ? { ...c, itemCount: c.itemCount + 1 } : c));
    toast.success(`Item "${item.name}" added to menu`);
  };

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    setMenuItems((prev) => {
      const updated = prev.map((mi) => (mi.id === id ? { ...mi, ...item } : mi));
      saveStorage('restro_menu_items', updated);
      return updated;
    });
    toast.success('Menu item updated');
  };

  const toggleMenuItemAvailability = (id: string) => {
    setMenuItems((prev) => {
      const updated = prev.map((mi) => (mi.id === id ? { ...mi, isAvailable: !mi.isAvailable } : mi));
      saveStorage('restro_menu_items', updated);
      return updated;
    });
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => {
      const updated = prev.filter((mi) => mi.id !== id);
      saveStorage('restro_menu_items', updated);
      return updated;
    });
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

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.05); // 5% GST tax
  const cartTotal = cartSubtotal + cartTax;

  // Order & POS actions
  const createOrder = (paymentMethod: PaymentMethod, customerPhone?: string, customerName?: string): Order => {
    const orderNum = (1025 + orders.length + 1).toString();
    const hasKitchenItems = cart.some((ci) => ci.requiresKitchen !== false);

    const newOrder: Order = {
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
      paymentMethod,
      paymentStatus: 'PAID',
      status: hasKitchenItems ? 'NEW' : 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName,
      customerPhone,
    };

    const newPayment: PaymentTransaction = {
      id: `pay_${Date.now()}`,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      amount: newOrder.total,
      method: paymentMethod,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      saveStorage('restro_orders', updated);
      return updated;
    });

    // MONGODB SYNC: Push new order to backend
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            items: newOrder.items.map(i => ({
              menuItemId: i.itemId,
              quantity: i.quantity
            })),
            paymentMethod: newOrder.paymentMethod,
            discount: newOrder.discount,
            tax: newOrder.tax,
            confirmPayment: true,
            customerName: newOrder.customerName,
            customerPhone: newOrder.customerPhone
          })
        }).catch(err => console.error('Failed to sync new order to DB:', err));
      }
    }

    setPayments((prev) => {
      const updated = [newPayment, ...prev];
      saveStorage('restro_payments', updated);
      return updated;
    });

    clearCart();

    // Broadcast to other open browser tabs (e.g. Kitchen Display screen)
    if (typeof window !== 'undefined') {
      try {
        const channel = new BroadcastChannel('restro_orders_sync');
        channel.postMessage({ type: 'NEW_ORDER', order: newOrder });
        channel.close();
      } catch (e) {}
    }

    // Trigger visual + sound alert for kitchen / counter
    playOrderNotificationSound();
    toast.success(`Order #${orderNum} created successfully via ${paymentMethod}`);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    // Broadcast status change to other tabs
    if (typeof window !== 'undefined') {
      try {
        const channel = new BroadcastChannel('restro_orders_sync');
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

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        loginAs,
        logout,
        restaurants,
        addRestaurant,
        updateRestaurantStatus,
        updateRestaurant,
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
        clearCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        orders,
        payments,
        createOrder,
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
