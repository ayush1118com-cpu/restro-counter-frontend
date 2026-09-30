'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
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
  // Persistent Entities from localStorage
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('restro_restaurants');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_RESTAURANTS;
  });

  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try { return JSON.parse(savedUser); } catch (e) {}
      }
    }
    const firstRest = typeof window !== 'undefined' ? localStorage.getItem('restro_restaurants') : null;
    if (firstRest) {
      try {
        const parsed = JSON.parse(firstRest);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const rest = parsed[0];
          return {
            id: `usr_${rest.id}`,
            name: `${rest.ownerName} (Admin)`,
            email: rest.email,
            role: 'RESTAURANT_ADMIN',
            restaurantId: rest.id,
            restaurantName: rest.name,
            phone: rest.phone,
          };
        }
      } catch (e) {}
    }
    return MOCK_USERS.restroadmin;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('restro_leads');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_LEADS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('restro_categories');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_CATEGORIES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('restro_menu_items');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return MOCK_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('restro_orders');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return INITIAL_ORDERS;
  });

  const [payments, setPayments] = useState<PaymentTransaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('restro_payments');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return INITIAL_PAYMENTS;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);

  // Helper to persist state to localStorage
  const saveStorage = (key: string, data: any) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {}
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

    fetch('http://localhost:5000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
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
        }
      })
      .catch(err => console.error('Failed to fetch orders from DB:', err));
  }, [currentUser?.restaurantId]);

  // MONGODB SYNC: Fetch real restaurants (For Super Admin & login matches)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch('http://localhost:5000/api/restaurants', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
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

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
    toast.info('Logged out successfully');
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

      fetch('http://localhost:5000/api/restaurants', {
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
    const id = `cat_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const newCat: Category = { id, name, description, itemCount: 0, isActive: true };
    setCategories((prev) => {
      const updated = [...prev, newCat];
      saveStorage('restro_categories', updated);
      return updated;
    });
    toast.success(`Category "${name}" added`);
  };

  const updateCategory = (id: string, name: string, description?: string) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, name, description } : c));
      saveStorage('restro_categories', updated);
      return updated;
    });
    toast.success('Category updated');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveStorage('restro_categories', updated);
      return updated;
    });
    toast.success('Category deleted');
  };

  // Menu Item actions
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newId = `item_${Date.now()}`;
    const newItem: MenuItem = { ...item, id: newId };
    setMenuItems((prev) => {
      const updated = [newItem, ...prev];
      saveStorage('restro_menu_items', updated);
      return updated;
    });
    setCategories((prev) => {
      const updated = prev.map((c) =>
        c.id === item.categoryId ? { ...c, itemCount: c.itemCount + 1 } : c
      );
      saveStorage('restro_categories', updated);
      return updated;
    });
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
        fetch('http://localhost:5000/api/orders', {
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
        fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
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
