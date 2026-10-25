'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  UtensilsCrossed,
  ShoppingBag,
  Plus,
  Minus,
  Clock,
  Sparkles,
  CheckCircle2,
  ChefHat,
  Search,
  ArrowLeft,
  ChevronRight,
  Phone,
  User,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import { formatINR } from '@/lib/utils';
import { OrderItem } from '@/types';
import { API_URL } from '@/lib/config';
import Swal from 'sweetalert2';

export default function CustomerTableOrderingPage() {
  const params = useParams();
  const router = useRouter();
  const { menuItems, categories, currentRestaurant, createTableOrder, orders } = useApp();

  const restId = (params?.restaurantId as string) || 'rest_1';
  const rawTableParam = (params?.tableNumber as string) || 'Table 1';
  const tableNumber = decodeURIComponent(rawTableParam);

  const [liveMenu, setLiveMenu] = useState<any[]>([]);
  const [liveCategories, setLiveCategories] = useState<any[]>([]);
  const [liveOrderData, setLiveOrderData] = useState<any>(null);
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null);
  const [isTableQrDisabled, setIsTableQrDisabled] = useState(false);

  const restaurantName = restaurantInfo?.name || currentRestaurant?.name || 'Restaurant Dining';

  // Fetch live public menu from backend
  React.useEffect(() => {
    if (!restId) return;
    fetch(`${API_URL}/menu/public/${restId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          if (resData.data.restaurant) {
            setRestaurantInfo(resData.data.restaurant);
            if (resData.data.restaurant.hasTableQrOrdering === false) {
              setIsTableQrDisabled(true);
            }
          }
          if (resData.data.items && resData.data.items.length > 0) {
            setLiveMenu(resData.data.items);
          }
          if (resData.data.categories && resData.data.categories.length > 0) {
            setLiveCategories(resData.data.categories);
          }
        }
      })
      .catch((err) => console.log('Public menu fetch fallback:', err));
  }, [restId]);

  // Local Customer Cart State
  const [customerCart, setCustomerCart] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('cat_all');
  const [searchQuery, setSearchQuery] = useState('');

  // Customer Info State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Placed Order Tracking
  const [activeTableOrderId, setActiveTableOrderId] = useState<string | null>(null);

  // Check on mount if table already has an active order
  React.useEffect(() => {
    if (!restId || !tableNumber) return;

    // Check local state in app context
    const localActive = orders.find(
      (o) =>
        o.tableNumber?.toLowerCase() === tableNumber.toLowerCase() &&
        (o.status === 'NEW' || o.status === 'ACCEPTED' || o.status === 'PREPARING' || o.status === 'READY')
    );
    if (localActive) {
      setActiveTableOrderId(localActive.id);
      setLiveOrderData(localActive);
    }

    // Check backend public API
    fetch(`${API_URL}/orders/public-table/active?restaurantId=${restId}&tableNumber=${encodeURIComponent(tableNumber)}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setActiveTableOrderId(resData.data.id);
          setLiveOrderData(resData.data);
        }
      })
      .catch(() => {});
  }, [restId, tableNumber, orders]);

  // Poll for live status update on customer's phone
  React.useEffect(() => {
    if (!activeTableOrderId) return;
    const interval = setInterval(() => {
      fetch(`${API_URL}/orders/public-track/${activeTableOrderId}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data) {
            setLiveOrderData(resData.data);
          }
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(interval);
  }, [activeTableOrderId]);

  // Sync active order from AppContext or live backend polling
  const currentLiveOrder = useMemo(() => {
    if (!activeTableOrderId) return null;
    return liveOrderData || orders.find((o) => o.id === activeTableOrderId) || null;
  }, [activeTableOrderId, orders, liveOrderData]);

  // Cart operations
  const addToCart = (item: any) => {
    setCustomerCart((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
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
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      setCustomerCart((prev) => prev.filter((i) => i.itemId !== itemId));
    } else {
      setCustomerCart((prev) =>
        prev.map((i) => (i.itemId === itemId ? { ...i, quantity: qty } : i))
      );
    }
  };

  const cartTotal = customerCart.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const cartItemCount = customerCart.reduce((sum, it) => sum + it.quantity, 0);

  const allAvailableItems = liveMenu.length > 0 ? liveMenu : menuItems;
  const allCategories =
    liveCategories.length > 0
      ? [{ id: 'cat_all', name: 'All' }, ...liveCategories]
      : categories;

  // Filtered Menu Items
  const filteredItems = useMemo(() => {
    return allAvailableItems.filter((item: any) => {
      const matchCat =
        selectedCategory === 'cat_all' ||
        item.categoryId === selectedCategory ||
        item.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.categoryName && item.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery && item.isAvailable !== false;
    });
  }, [allAvailableItems, selectedCategory, searchQuery]);

  const handlePlaceOrder = async () => {
    if (customerCart.length === 0) return;

    const isAppended = Boolean(currentLiveOrder && currentLiveOrder.status !== 'COMPLETED' && currentLiveOrder.status !== 'CANCELLED');

    setIsSubmitting(true);
    try {
      const order = await createTableOrder(
        tableNumber,
        customerCart,
        guestName.trim() || undefined,
        guestPhone.trim() || undefined,
        orderNotes.trim() || undefined,
        restId
      );

      setActiveTableOrderId(order.id);
      setLiveOrderData(order);
      setCustomerCart([]);
      setIsSubmitting(false);

      Swal.fire({
        icon: 'success',
        title: isAppended ? 'Items Added to Your Bill!' : 'Order Sent to Counter!',
        html: isAppended
          ? `Added to <b>Order #${order.orderNumber}</b> on <b>${tableNumber}</b>.<br/><span class="text-xs text-amber-700 font-semibold">Single consolidated bill will be generated at the counter.</span>`
          : `Order #${order.orderNumber} placed from ${tableNumber}. Counter staff is reviewing your order.`,
        timer: 3500,
        showConfirmButton: false,
        customClass: { popup: 'rounded-3xl font-sans' },
      });
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  // Status Step Progress Calculation
  const getStepProgress = (status?: string) => {
    switch (status) {
      case 'NEW':
        return 1; // Sent to Counter
      case 'ACCEPTED':
        return 2; // Accepted
      case 'PREPARING':
        return 3; // Kitchen Preparing
      case 'READY':
        return 4; // Ready to Serve
      case 'COMPLETED':
        return 5; // Completed
      default:
        return 1;
    }
  };

  if (isTableQrDisabled || (currentRestaurant && currentRestaurant.hasTableQrOrdering === false)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-1">
            {restaurantName}
          </h2>
          <div className="inline-block bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full mb-4 border border-amber-300">
            🍽️ {tableNumber}
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-2">Self-Ordering Currently Unavailable</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Digital QR table ordering is currently turned off for this restaurant. Please place your order directly at the counter.
          </p>
          <div className="text-xs text-gray-400 font-semibold border-t border-gray-100 pt-4">
            ServDesk Counter POS • Dining Service
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between selection:bg-amber-100 selection:text-amber-900 pb-28">
      {/* 1. TOP MOBILE HEADER */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 py-3 shadow-2xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-200 shadow-2xs shrink-0">
              <Image src="/logo.png" alt="Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                {restaurantName}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                  🍽️ {tableNumber}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Digital Menu
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY */}
      <main className="max-w-2xl mx-auto w-full p-3 sm:p-4 space-y-4">
        {/* LIVE ORDER STATUS TRACKER BANNER (If customer has placed an order) */}
        {currentLiveOrder && (
          <div className="bg-white rounded-2xl p-4 border border-amber-300 shadow-md space-y-3 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                  LIVE TABLE ORDER TRACKING
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Order #{currentLiveOrder.orderNumber}
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  currentLiveOrder.status === 'NEW'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                    : currentLiveOrder.status === 'PREPARING'
                    ? 'bg-orange-100 text-orange-900 border border-orange-300 animate-pulse'
                    : currentLiveOrder.status === 'READY'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {currentLiveOrder.status === 'NEW' && '⏳ Sent to Counter (Reviewing)'}
                {currentLiveOrder.status === 'ACCEPTED' && '✓ Counter Accepted'}
                {currentLiveOrder.status === 'PREPARING' && '🍳 Kitchen Preparing'}
                {currentLiveOrder.status === 'READY' && '🍽️ Ready to Serve!'}
                {currentLiveOrder.status === 'COMPLETED' && '✓ Completed'}
              </span>
            </div>

            {/* Step Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[
                { step: 1, label: 'Order Sent' },
                { step: 2, label: 'Counter Accepted' },
                { step: 3, label: 'Kitchen Preparing' },
                { step: 4, label: 'Ready to Serve' },
              ].map((s) => {
                const currentStep = getStepProgress(currentLiveOrder.status);
                const isPassed = currentStep >= s.step;
                return (
                  <div key={s.step} className="space-y-1 text-center">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isPassed ? 'bg-amber-500' : 'bg-slate-200'
                      }`}
                    />
                    <p
                      className={`text-[9px] font-bold truncate ${
                        isPassed ? 'text-amber-700' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Items Summary in Live Order */}
            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between items-center">
              <span>
                {currentLiveOrder.items.length} items • Total:{' '}
                <strong className="text-slate-900">{formatINR(currentLiveOrder.total)}</strong>
              </span>
              <span className="text-[10px] text-slate-400">Pay at Counter after dining</span>
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search delicious food & drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold shadow-2xs"
          />
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {allCategories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* MENU ITEMS LIST */}
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const inCart = customerCart.find((ci) => ci.itemId === item.id);

            return (
              <div
                key={item.id}
                className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-3 hover:border-amber-300 transition-all"
              >
                {/* Left Info */}
                <div className="flex-1 min-w-0 pr-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {item.categoryName}
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate mt-0.5">
                    {item.name}
                  </h4>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  )}
                  <p className="font-extrabold text-xs sm:text-sm text-slate-900 mt-1">
                    {formatINR(item.discountPrice || item.price)}
                  </p>
                </div>

                {/* Right Image / Add Button */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {item.image && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 shadow-2xs">
                      <img
                        src={typeof item.image === 'string' ? item.image : (item.image as any)?.secure_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {inCart ? (
                    <div className="flex items-center bg-amber-50 border border-amber-300 rounded-lg p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                        className="p-1 text-amber-900 hover:bg-amber-100 rounded cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-amber-950">
                        {inCart.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                        className="p-1 text-amber-900 hover:bg-amber-100 rounded cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* 3. BOTTOM FLOATING CART BAR & ORDER MODAL */}
      {customerCart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 z-40 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-3">
            {/* Guest Name & Notes Inputs */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
              />
              <input
                type="text"
                placeholder="Special Notes: e.g. Less spicy"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            {/* Place Order / Add to Bill CTA Button */}
            <button
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-md shadow-amber-500/25 flex items-center justify-between transition-all active:scale-98 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="bg-slate-950 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
                <div className="text-left">
                  <span className="text-xs sm:text-sm block leading-tight">
                    {currentLiveOrder && currentLiveOrder.status !== 'COMPLETED' && currentLiveOrder.status !== 'CANCELLED'
                      ? `Add Items to Bill (#${currentLiveOrder.orderNumber})`
                      : `Place Order for ${tableNumber}`}
                  </span>
                  {currentLiveOrder && currentLiveOrder.status !== 'COMPLETED' && currentLiveOrder.status !== 'CANCELLED' && (
                    <span className="text-[10px] text-amber-950 font-semibold block">
                      Single consolidated bill
                    </span>
                  )}
                </div>
              </div>
              <span className="text-sm font-black flex items-center gap-1">
                +{formatINR(cartTotal)} <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
