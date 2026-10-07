'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  ShoppingBag,
  UtensilsCrossed,
  Bell,
  ChefHat,
  Printer,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import { formatINR } from '@/lib/utils';
import { PaymentModal } from '@/components/pos/payment-modal';
import { BillPreviewModal } from '@/components/pos/bill-preview-modal';
import { Order } from '@/types';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/config';

export default function POSScreenPage() {
  const {
    categories,
    menuItems,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
  } = useApp();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('cat_all');
  const [search, setSearch] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [isKitchenConnected, setIsKitchenConnected] = useState(false);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);

  // Monitor Socket.IO connection status to Kitchen
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => setIsKitchenConnected(true));
    socket.on('disconnect', () => setIsKitchenConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filter menu items by search & category
  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategoryId === 'cat_all' || item.categoryId === selectedCategoryId;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.categoryName || '').toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePaymentSuccess = (order: Order) => {
    setLastCreatedOrder(order);
    setIsCartOpenMobile(false);
  };

  const handlePrintBillFromPayment = (order: Order) => {
    setLastCreatedOrder(order);
    setIsPaymentModalOpen(false);
    setIsBillModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 350);
  };

  const handleOpenBillModal = () => {
    if (lastCreatedOrder) {
      setIsBillModalOpen(true);
    } else {
      toast.error('No recent order bill to display');
    }
  };

  const nextOrderNumber = lastCreatedOrder ? parseInt(lastCreatedOrder.orderNumber, 10) + 1 : 1026;

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col font-sans bg-[#f8fafc] text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      {/* 1. TOP COMPACT HEADER */}
      <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Counter POS
          </h1>
          <p className="text-xs text-slate-500 font-medium">Fast order billing & kitchen sync</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN POS WORKSPACE (CENTER MENU + RIGHT CART) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* CENTER MENU BROWSING AREA */}
        <div className="flex-1 flex flex-col min-w-0 p-3 lg:p-5 overflow-hidden">
          {/* TOP TOOLBAR: SEARCH & CATEGORY PILLS */}
          <div className="space-y-3 shrink-0 mb-4">
            {/* SEARCH INPUT */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu items by name or category..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-3 focus:ring-amber-500/15 shadow-2xs transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            {/* CATEGORY NAV PILLS */}
            <div className="overflow-x-auto no-scrollbar flex items-center gap-2 py-1">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-102'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MENU GRID AREA */}
          <div className="flex-1 overflow-y-auto pr-1">
            {filteredItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-3">
                <UtensilsCrossed className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No items found</p>
                <p className="text-xs text-slate-400">Try changing your search query or selected category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 pb-4">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                      item.isAvailable
                        ? 'border-slate-200/90 hover:border-amber-400 hover:shadow-md'
                        : 'border-slate-200 bg-slate-50/60 opacity-60'
                    }`}
                  >
                    {/* Aspect 4/3 Image */}
                    <div className="relative w-full aspect-4/3 bg-slate-100 overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <UtensilsCrossed className="w-8 h-8" />
                        </div>
                      )}

                      {/* Instant Counter Tag or Out of Stock Tag */}
                      {item.requiresKitchen === false && item.isAvailable && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-md shadow-2xs">
                          INSTANT SALE
                        </span>
                      )}

                      {!item.isAvailable && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-md shadow-2xs">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>

                    {/* Content Body */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.categoryName || 'GENERAL'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">{item.name}</h3>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-base font-bold text-slate-900">
                            {formatINR(item.discountPrice || item.price)}
                          </span>
                          {item.discountPrice && (
                            <span className="text-[11px] text-slate-400 line-through ml-1">
                              {formatINR(item.price)}
                            </span>
                          )}
                        </div>

                        <button
                          disabled={!item.isAvailable}
                          onClick={() => addToCart(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 ${
                            item.isAvailable
                              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs shadow-amber-500/20 cursor-pointer'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* MOBILE VIEW CART FLOATING BUTTON */}
          <div className="lg:hidden mt-3 shrink-0 relative z-10">
            <button
              onClick={() => setIsCartOpenMobile(true)}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-between px-4 active:scale-95 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>View Order</span>
              </div>
              <div className="bg-amber-500 text-slate-900 px-2.5 py-1 rounded-md text-[13px]">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} items • {formatINR(cartTotal)}
              </div>
            </button>
          </div>
        </div>

        {/* RIGHT STICKY CURRENT ORDER / CART PANEL */}
        <div className={`${isCartOpenMobile ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:static lg:flex lg:h-auto w-full lg:w-[400px] bg-white border-t lg:border-t-0 lg:border-l border-slate-200/90 flex-col justify-between shrink-0 shadow-2xl lg:shadow-lg`}>
          {/* CART HEADER */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">CURRENT ORDER</span>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Order #{nextOrderNumber}</h2>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Clear</span>
                </button>
              )}
              {/* MOBILE CLOSE BUTTON */}
              <button
                onClick={() => setIsCartOpenMobile(false)}
                className="lg:hidden text-xs font-bold text-slate-700 hover:bg-slate-200 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

          {/* CART ITEMS SCROLL AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700">No items yet</p>
                <p className="text-xs text-slate-400">Select items from the menu to start the order.</p>
              </div>
            ) : (
              cart.map((ci) => (
                <div
                  key={ci.itemId}
                  className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{ci.name}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold">{formatINR(ci.price)} each</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-2xs">
                      <button
                        onClick={() => updateCartQuantity(ci.itemId, ci.quantity - 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-900">{ci.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(ci.itemId, ci.quantity + 1)}
                        className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-bold text-slate-900 w-14 text-right">
                      {formatINR(ci.price * ci.quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* CART SUMMARY & PAYMENT CTA FOOTER */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-4">
            <div className="space-y-1.5 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-slate-900">{formatINR(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5% GST)</span>
                <span className="text-slate-900">{formatINR(cartTax)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>{formatINR(0)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-bold text-slate-900">
                <span>TOTAL</span>
                <span className="text-amber-600 text-xl font-bold">{formatINR(cartTotal)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                disabled={cart.length === 0}
                onClick={() => setIsPaymentModalOpen(true)}
                className={`w-full h-12 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 ${
                  cart.length > 0
                    ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/25 cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Proceed to Payment
              </button>

              {lastCreatedOrder && (
                <button
                  onClick={handleOpenBillModal}
                  className="w-full py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" /> Print Bill for Last Order (#{lastCreatedOrder.orderNumber})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT & BILL MODALS */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onPrintBill={handlePrintBillFromPayment}
      />

      <BillPreviewModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        order={lastCreatedOrder}
      />
    </div>
  );
}
