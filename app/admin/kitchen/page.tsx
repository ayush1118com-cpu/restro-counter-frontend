'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  Flame,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  LogOut,
  History,
  ArrowLeft,
  Check,
  Maximize2,
  Minimize2,
  Sparkles,
  Inbox,
  CookingPot,
} from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '@/lib/config';

export default function KitchenDisplayScreenPage() {
  const router = useRouter();
  const { orders: contextOrders, updateOrderStatus: updateContextOrderStatus, playOrderNotificationSound, logout } = useApp();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [now, setNow] = useState<number>(Date.now());
  const [newlyArrivedIds, setNewlyArrivedIds] = useState<Set<string>>(new Set());

  // Real-time ticking timer for order age / preparing timer (updates every 1 sec)
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync with AppContext orders initially
  useEffect(() => {
    setOrders(contextOrders);
  }, [contextOrders]);

  // Listen for multi-tab BroadcastChannel order events
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const channel = new BroadcastChannel('restro_orders_sync');
      channel.onmessage = (event) => {
        const { type, order, orderId, status } = event.data || {};

        if (type === 'NEW_ORDER' && order) {
          const kitchenItems = (order.items || []).filter((it: any) => it.requiresKitchen !== false);
          if (kitchenItems.length === 0) return;

          if (!isMuted) {
            playOrderNotificationSound();
          }

          toast.success(`🔔 NEW KITCHEN TICKET! Order #${order.orderNumber || order.id}`, {
            duration: 8000,
          });

          const targetId = order.id || order._id;
          setNewlyArrivedIds((prev) => new Set(prev).add(targetId));
          setTimeout(() => {
            setNewlyArrivedIds((prev) => {
              const next = new Set(prev);
              next.delete(targetId);
              return next;
            });
          }, 3500);

          setOrders((prev) => {
            const exists = prev.some((o) => (o.id || o._id) === targetId);
            if (exists) return prev;
            return [{ ...order, items: kitchenItems, status: order.status || 'NEW' }, ...prev];
          });
        } else if (type === 'UPDATE_STATUS' && orderId && status) {
          setOrders((prev) =>
            prev.map((o) => {
              if ((o.id || o._id || o.orderNumber) === orderId) {
                return {
                  ...o,
                  status,
                  preparingStartedAt: status === 'PREPARING' ? o.preparingStartedAt || new Date().toISOString() : o.preparingStartedAt,
                };
              }
              return o;
            })
          );
        }
      };

      return () => channel.close();
    } catch (e) {}
  }, [isMuted]);

  // Socket.IO real-time connection
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      setSocketStatus('disconnected');
      return;
    }

    setSocketStatus('reconnecting');
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      setSocketStatus('connected');
      console.log('⚡ KDS Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      setSocketStatus('disconnected');
      console.log('⚠️ KDS Socket disconnected');
    });

    newSocket.on('connect_error', () => {
      setSocketStatus('reconnecting');
    });

    // Real-time listener for NEW ORDERS
    newSocket.on('new-order', (payload: any) => {
      console.log('⚡ Socket Received NEW_ORDER:', payload);
      const newOrder = payload.order;

      // Filter items to only show kitchen items
      const kitchenItems = (newOrder.items || []).filter((it: any) => it.requiresKitchen !== false);

      if (kitchenItems.length === 0) {
        console.log('⚡ Order contains only instant counter items, skipping Kitchen alert.');
        return;
      }

      // Play sound if not muted
      if (!isMuted) {
        playOrderNotificationSound();
      }

      // Show toast alert
      toast.success(`🔔 NEW KITCHEN TICKET! Order #${newOrder.orderNumber || newOrder.id}`, {
        duration: 8000,
      });

      const orderId = newOrder._id || newOrder.id;

      // Glow animation tag
      setNewlyArrivedIds((prev) => new Set(prev).add(orderId));
      setTimeout(() => {
        setNewlyArrivedIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }, 3500);

      // Add to state
      setOrders((prev) => {
        const exists = prev.some((o) => (o.id || o._id) === orderId);
        if (exists) return prev;
        const normalized = {
          id: orderId,
          orderNumber: newOrder.orderNumber,
          status: newOrder.orderStatus || newOrder.status || 'NEW',
          items: kitchenItems,
          customerName: newOrder.customerName,
          customerPhone: newOrder.customerPhone,
          createdAt: newOrder.createdAt || new Date().toISOString(),
          preparingStartedAt: newOrder.preparingStartedAt || null,
        };
        return [normalized, ...prev];
      });
    });

    // Status sync events from other terminals
    const statusEvents = ['order-accepted', 'order-preparing', 'order-ready', 'order-completed', 'order-cancelled'];
    statusEvents.forEach((evt) => {
      newSocket.on(evt, (payload: any) => {
        const updatedOrder = payload.order;
        if (!updatedOrder) return;
        const targetId = updatedOrder._id || updatedOrder.id;
        const nextStatus = updatedOrder.orderStatus || updatedOrder.status;

        setOrders((prev) =>
          prev.map((o) => {
            if ((o.id || o._id) === targetId) {
              return {
                ...o,
                status: nextStatus,
                preparingStartedAt: nextStatus === 'PREPARING' ? o.preparingStartedAt || new Date().toISOString() : o.preparingStartedAt,
              };
            }
            return o;
          })
        );
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isMuted]);

  // Fullscreen API toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        toast.error(`Error enabling fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    const prepStartedAt = nextStatus === 'PREPARING' ? new Date().toISOString() : undefined;

    // 1. Update UI locally immediately
    setOrders((prev) =>
      prev.map((o) => {
        if ((o.id || o._id) === orderId) {
          return {
            ...o,
            status: nextStatus,
            preparingStartedAt: prepStartedAt || o.preparingStartedAt,
          };
        }
        return o;
      })
    );
    updateContextOrderStatus(orderId, nextStatus as any);


  };

  const handleKitchenLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    logout();
    toast.success('Logged out from Kitchen Station');
    router.push('/login');
  };

  // Filter columns
  const newOrders = orders
    .map((o) => ({
      ...o,
      items: (o.items || []).filter((it: any) => it.requiresKitchen !== false),
    }))
    .filter((o) => o.items.length > 0 && (o.status === 'NEW' || o.status === 'ACCEPTED'));

  const preparingOrders = orders
    .map((o) => ({
      ...o,
      items: (o.items || []).filter((it: any) => it.requiresKitchen !== false),
    }))
    .filter((o) => o.items.length > 0 && o.status === 'PREPARING');

  const readyOrders = orders
    .map((o) => ({
      ...o,
      items: (o.items || []).filter((it: any) => it.requiresKitchen !== false),
    }))
    .filter((o) => o.items.length > 0 && o.status === 'READY');

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');

  // Helper for Order Age & Urgency
  const getOrderAgeInfo = (createdAt: string) => {
    const elapsedMs = now - new Date(createdAt).getTime();
    const elapsedMins = Math.floor(elapsedMs / 60000);
    const elapsedSecs = Math.floor((elapsedMs % 60000) / 1000);

    let text = 'Just now';
    if (elapsedMins > 0) {
      text = `${elapsedMins} min ago`;
    } else if (elapsedSecs > 10) {
      text = `${elapsedSecs} sec ago`;
    }

    let urgency: 'normal' | 'warning' | 'urgent' = 'normal';
    if (elapsedMins >= 7) {
      urgency = 'urgent';
    } else if (elapsedMins >= 3) {
      urgency = 'warning';
    }

    return { text, elapsedMins, elapsedMs, urgency };
  };

  // Helper for Preparing Stopwatch Timer
  const getPreparingTimerText = (order: any) => {
    const startTime = order.preparingStartedAt ? new Date(order.preparingStartedAt).getTime() : new Date(order.createdAt).getTime();
    const elapsedMs = Math.max(0, now - startTime);
    const mins = Math.floor(elapsedMs / 60000);
    const secs = Math.floor((elapsedMs % 60000) / 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const testAudioChime = () => {
    playOrderNotificationSound();
    toast.info('🔊 Audio notification test triggered!');
  };

  return (
    <div className="min-h-screen bg-[#050817] text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* 1. STICKY HEADER */}
      <header className="sticky top-0 z-50 min-h-[72px] py-3 md:py-0 bg-[#0B1224]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 shadow-2xl">
        {/* LEFT BRANDING */}
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex flex-shrink-0 items-center justify-center shadow-md shadow-amber-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold tracking-tight text-white flex items-center gap-2 leading-none">
                KITCHEN DISPLAY
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Kitchen Station</span>
                <span className="text-slate-600 hidden sm:inline">•</span>
                {/* SOCKET STATUS PILL */}
                {socketStatus === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                  </span>
                )}
                {socketStatus === 'reconnecting' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Reconnecting...
                  </span>
                )}
                {socketStatus === 'disconnected' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Disconnected
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* SHOW LOGOUT ON MOBILE TOP RIGHT */}
          <button
            onClick={handleKitchenLogout}
            className="lg:hidden px-2.5 py-1.5 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-800/40 text-xs font-bold hover:bg-rose-900/60 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* TOP COMPACT STATS SUMMARY */}
        <div className="hidden lg:flex items-center gap-4 bg-[#0F172A]/80 border border-slate-800/80 px-4 py-1.5 rounded-xl">
          <div className="text-center px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ACTIVE</p>
            <p className="text-base font-bold text-amber-400 leading-tight">
              {newOrders.length + preparingOrders.length}
            </p>
          </div>
          <div className="w-[1px] h-6 bg-slate-800" />
          <div className="text-center px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">READY</p>
            <p className="text-base font-bold text-emerald-400 leading-tight">{readyOrders.length}</p>
          </div>
          <div className="w-[1px] h-6 bg-slate-800" />
          <div className="text-center px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COMPLETED</p>
            <p className="text-base font-bold text-slate-300 leading-tight">{completedOrders.length}</p>
          </div>
        </div>

        {/* RIGHT ACTION CONTROLS */}
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 no-scrollbar">
          {/* VIEW MODE TOGGLE */}
          <div className="bg-[#0F172A] p-1 rounded-xl border border-slate-800 flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setViewMode('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'ACTIVE'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Active ({newOrders.length + preparingOrders.length + readyOrders.length})
            </button>
            <button
              onClick={() => setViewMode('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'COMPLETED'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Completed ({completedOrders.length})
            </button>
          </div>

          {/* SOUND TOGGLE / TEST BUTTON */}
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (isMuted) testAudioChime();
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex flex-shrink-0 items-center gap-1.5 transition-all ${
              isMuted
                ? 'bg-slate-900 text-slate-500 border-slate-800'
                : 'bg-[#0F172A] text-amber-400 border-amber-500/30 hover:bg-slate-800'
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? 'Sound OFF' : 'Sound ON'}</span>
          </button>

          {/* FULLSCREEN API TOGGLE */}
          <button
            onClick={toggleFullscreen}
            className="p-2 flex-shrink-0 rounded-xl bg-[#0F172A] text-slate-300 border border-slate-800 hover:text-white hover:bg-slate-800 transition-all"
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* LOGOUT STATION (Hidden on mobile, shown in top header instead) */}
          <button
            onClick={handleKitchenLogout}
            className="hidden lg:flex px-3 py-1.5 flex-shrink-0 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-800/40 text-xs font-bold hover:bg-rose-900/60 transition-all items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> <span>Logout</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN KITCHEN BOARD */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto lg:overflow-hidden flex flex-col">
        {viewMode === 'ACTIVE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 items-start">
            {/* =================================================== */}
            {/* COLUMN 1: NEW ORDERS */}
            {/* =================================================== */}
            <div className="bg-[#0B1224] rounded-2xl border border-slate-800/90 flex flex-col h-[60vh] lg:h-auto lg:max-h-[calc(100vh-120px)] shadow-xl overflow-hidden">
              {/* Sticky Column Header */}
              <div className="p-4 border-b border-slate-800/80 bg-[#0F172A]/90 backdrop-blur-xs flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-amber-400 tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> NEW ORDERS
                  </h2>
                  <p className="text-[12px] text-slate-400 font-medium">Waiting for preparation</p>
                </div>
                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-xs">
                  {newOrders.length}
                </span>
              </div>

              {/* Scrollable Order List */}
              <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
                {newOrders.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 space-y-2">
                    <Inbox className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                    <p className="text-sm font-semibold text-slate-400">No new orders</p>
                    <p className="text-xs text-slate-500">Orders will appear here automatically.</p>
                  </div>
                ) : (
                  newOrders.map((order) => {
                    const orderId = order.id || order._id;
                    const isNewGlow = newlyArrivedIds.has(orderId);
                    const ageInfo = getOrderAgeInfo(order.createdAt);

                    let cardBorderClass = 'border-slate-800';
                    if (ageInfo.urgency === 'urgent') {
                      cardBorderClass = 'border-rose-500/80 ring-1 ring-rose-500/40';
                    } else if (ageInfo.urgency === 'warning') {
                      cardBorderClass = 'border-amber-500/70';
                    }

                    return (
                      <div
                        key={orderId}
                        className={`bg-[#0F172A] p-4 rounded-2xl border ${cardBorderClass} shadow-lg space-y-3 transition-all duration-300 ${
                          isNewGlow ? 'ring-2 ring-amber-400 shadow-amber-500/20 scale-102 bg-slate-900' : ''
                        }`}
                      >
                        {/* Order Header */}
                        <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
                          <div>
                            <span className="text-[19px] font-bold text-white tracking-tight">
                              #{order.orderNumber}
                            </span>
                            {(order.customerName || order.customerPhone) && (
                              <p className="text-xs font-medium text-amber-300 mt-0.5">
                                👤 {order.customerName || 'Customer'} {order.customerPhone ? `(${order.customerPhone})` : ''}
                              </p>
                            )}
                            <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                              ageInfo.urgency === 'urgent'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-800/80 font-bold animate-pulse'
                                : ageInfo.urgency === 'warning'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800/80 font-semibold'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" /> {ageInfo.text}
                          </span>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 py-1">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-[15px]">
                              <span className="font-semibold text-slate-100 flex items-center gap-2">
                                <span className="text-amber-400 font-bold text-base w-6 text-right">
                                  {item.quantity}×
                                </span>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Footer Summary & Action */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-3">
                          <p className="text-xs font-semibold text-slate-400">
                            {order.items.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0)} items total
                          </p>
                          <button
                            onClick={() => handleStatusChange(orderId, 'PREPARING')}
                            className="w-full h-12 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                          >
                            [ ACCEPT ORDER ]
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* =================================================== */}
            {/* COLUMN 2: PREPARING */}
            {/* =================================================== */}
            <div className="bg-[#0B1224] rounded-2xl border border-slate-800/90 flex flex-col h-[60vh] lg:h-auto lg:max-h-[calc(100vh-120px)] shadow-xl overflow-hidden">
              {/* Sticky Column Header */}
              <div className="p-4 border-b border-slate-800/80 bg-[#0F172A]/90 backdrop-blur-xs flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-orange-400 tracking-wide flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" /> PREPARING
                  </h2>
                  <p className="text-[12px] text-slate-400 font-medium">Currently cooking</p>
                </div>
                <span className="px-3 py-1 bg-orange-500 text-slate-950 font-bold text-xs rounded-full shadow-xs">
                  {preparingOrders.length}
                </span>
              </div>

              {/* Scrollable Order List */}
              <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
                {preparingOrders.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 space-y-2">
                    <CookingPot className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                    <p className="text-sm font-semibold text-slate-400">No active preparations</p>
                    <p className="text-xs text-slate-500">Accepted orders will move here.</p>
                  </div>
                ) : (
                  preparingOrders.map((order) => {
                    const orderId = order.id || order._id;
                    const ageInfo = getOrderAgeInfo(order.createdAt);
                    const prepTimer = getPreparingTimerText(order);

                    return (
                      <div
                        key={orderId}
                        className="bg-[#0F172A] p-4 rounded-2xl border border-orange-500/50 shadow-lg space-y-3"
                      >
                        {/* Order Header */}
                        <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
                          <div>
                            <span className="text-[19px] font-bold text-orange-400 tracking-tight">
                              #{order.orderNumber}
                            </span>
                            {(order.customerName || order.customerPhone) && (
                              <p className="text-xs font-medium text-orange-200 mt-0.5">
                                👤 {order.customerName || 'Customer'} {order.customerPhone ? `(${order.customerPhone})` : ''}
                              </p>
                            )}
                            <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                          </div>

                          {/* Preparing Stopwatch Timer */}
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-950/80 text-orange-400 border border-orange-800/60 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" /> {prepTimer}
                          </span>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 py-1">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-[15px]">
                              <span className="font-semibold text-slate-100 flex items-center gap-2">
                                <span className="text-orange-400 font-bold text-base w-6 text-right">
                                  {item.quantity}×
                                </span>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Footer & Action */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-3">
                          <p className="text-xs text-slate-400">Started: {ageInfo.text}</p>
                          <button
                            onClick={() => handleStatusChange(orderId, 'READY')}
                            className="w-full h-12 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                          >
                            [ MARK READY ]
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* =================================================== */}
            {/* COLUMN 3: READY FOR PICKUP */}
            {/* =================================================== */}
            <div className="bg-[#0B1224] rounded-2xl border border-slate-800/90 flex flex-col h-[60vh] lg:h-auto lg:max-h-[calc(100vh-120px)] shadow-xl overflow-hidden">
              {/* Sticky Column Header */}
              <div className="p-4 border-b border-slate-800/80 bg-[#0F172A]/90 backdrop-blur-xs flex items-center justify-between">
                <div>
                  <h2 className="text-[15px] font-bold text-emerald-400 tracking-wide flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> READY FOR PICKUP
                  </h2>
                  <p className="text-[12px] text-slate-400 font-medium">Waiting at pass / counter</p>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full shadow-xs">
                  {readyOrders.length}
                </span>
              </div>

              {/* Scrollable Order List */}
              <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
                {readyOrders.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 space-y-2">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                    <p className="text-sm font-semibold text-slate-400">No ready orders waiting</p>
                    <p className="text-xs text-slate-500">Cooked orders will show here.</p>
                  </div>
                ) : (
                  readyOrders.map((order) => {
                    const orderId = order.id || order._id;

                    return (
                      <div
                        key={orderId}
                        className="bg-[#0F172A] p-4 rounded-2xl border border-emerald-500/60 shadow-lg space-y-3"
                      >
                        {/* Order Header */}
                        <div className="flex items-start justify-between border-b border-slate-800/80 pb-2.5">
                          <div>
                            <span className="text-[19px] font-bold text-emerald-400 tracking-tight">
                              #{order.orderNumber}
                            </span>
                            {(order.customerName || order.customerPhone) && (
                              <p className="text-xs font-medium text-emerald-200 mt-0.5">
                                👤 {order.customerName || 'Customer'} {order.customerPhone ? `(${order.customerPhone})` : ''}
                              </p>
                            )}
                            <p className="text-[11px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </p>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                            ✓ READY
                          </span>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 py-1">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-[15px]">
                              <span className="font-semibold text-slate-100 flex items-center gap-2">
                                <span className="text-emerald-400 font-bold text-base w-6 text-right">
                                  {item.quantity}×
                                </span>
                                {item.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Footer & Action */}
                        <div className="pt-2 border-t border-slate-800/80 space-y-3">
                          <p className="text-xs text-emerald-400/80 font-medium">Ready for customer pickup</p>
                          <button
                            onClick={() => handleStatusChange(orderId, 'COMPLETED')}
                            className="w-full h-12 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-emerald-500/40 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                          >
                            [ COMPLETE DISPATCH ]
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 2: COMPLETED ORDERS HISTORY */}
        {viewMode === 'COMPLETED' && (
          <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Completed Orders History ({completedOrders.length})
              </h2>
              <button
                onClick={() => setViewMode('ACTIVE')}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Active Board
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedOrders.length === 0 ? (
                <div className="col-span-full text-center py-20 text-slate-500 text-sm font-medium">
                  No completed orders recorded yet.
                </div>
              ) : (
                completedOrders.map((order) => (
                  <div
                    key={order.id || order._id}
                    className="bg-[#0B1224] p-4 rounded-2xl border border-slate-800 space-y-3 opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div>
                        <span className="text-lg font-bold text-emerald-400">#{order.orderNumber}</span>
                        {(order.customerName || order.customerPhone) && (
                          <p className="text-xs text-slate-400 font-medium">
                            {order.customerName} {order.customerPhone}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> DISPATCHED
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="text-slate-400">₹{item.total}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>Order Time: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
