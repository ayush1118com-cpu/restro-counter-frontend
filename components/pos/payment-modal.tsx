'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PaymentMethod, Order } from '@/types';
import { formatINR } from '@/lib/utils';
import {
  Banknote,
  QrCode,
  CreditCard,
  CheckCircle2,
  Printer,
  PlusCircle,
  AlertCircle,
  BookOpen,
  Car,
  User,
  Phone,
  Sparkles,
  ArrowRight,
  Receipt,
  Check,
} from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (order: Order) => void;
  onPrintBill?: (order: Order) => void;
}

export function PaymentModal({ isOpen, onClose, onPaymentSuccess, onPrintBill }: PaymentModalProps) {
  const { cartTotal, createOrder, clearCart, getCustomerKhata, orders, khataAccounts, cart } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Autocomplete state
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  // Total cart items count
  const cartItemsCount = useMemo(() => {
    return (cart || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [cart]);

  // Initialize paid amount whenever cartTotal changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setPaidAmount(cartTotal.toString());
      setIsSplitMode(false);
    }
  }, [isOpen, cartTotal]);

  // Aggregate past customers from both orders and khata accounts
  const previousCustomers = useMemo(() => {
    const map = new Map<
      string,
      { name: string; phone: string; vehicleNumber?: string; key: string; totalDue?: number }
    >();

    orders.forEach((o) => {
      const name = (o.customerName || '').trim();
      const phone = (o.customerPhone || '').trim();
      const vehicle = (o.vehicleNumber || '').trim();
      if (!name && !phone) return;

      const key = (phone || name).toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: name || phone,
          phone,
          vehicleNumber: vehicle || undefined,
          key,
        });
      } else {
        const existing = map.get(key)!;
        if (!existing.phone && phone) existing.phone = phone;
        if (!existing.vehicleNumber && vehicle) existing.vehicleNumber = vehicle;
      }
    });

    khataAccounts.forEach((k) => {
      const name = (k.customerName || '').trim();
      const phone = (k.customerPhone || '').trim();
      if (!name && !phone) return;

      const key = (phone || name).toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: name || phone,
          phone,
          vehicleNumber: undefined,
          key,
          totalDue: k.totalDue || 0,
        });
      } else {
        const existing = map.get(key)!;
        if (!existing.phone && phone) existing.phone = phone;
        if (k.totalDue) existing.totalDue = k.totalDue;
      }
    });

    return Array.from(map.values());
  }, [orders, khataAccounts]);

  // Filter matching suggestions
  const nameMatches = useMemo(() => {
    const q = customerName.trim().toLowerCase();
    if (!q) return [];
    return previousCustomers
      .filter((c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)))
      .slice(0, 5);
  }, [customerName, previousCustomers]);

  const phoneMatches = useMemo(() => {
    const q = customerPhone.trim();
    if (!q || q.length < 2) return [];
    return previousCustomers
      .filter((c) => c.phone && c.phone.includes(q))
      .slice(0, 5);
  }, [customerPhone, previousCustomers]);

  const handleSelectCustomer = (c: { name: string; phone: string; vehicleNumber?: string }) => {
    if (c.name) setCustomerName(c.name);
    if (c.phone) setCustomerPhone(c.phone);
    if (c.vehicleNumber) setVehicleNumber(c.vehicleNumber);
    setIsNameFocused(false);
    setIsPhoneFocused(false);
  };

  // Check if this customer already has an existing Khata account with pending due
  const existingKhata = useMemo(() => {
    return getCustomerKhata(customerPhone) || getCustomerKhata(customerName);
  }, [customerName, customerPhone, getCustomerKhata]);

  const numPaid = paidAmount === '' ? cartTotal : Number(paidAmount) || 0;
  const currentOrderDue = Math.max(0, cartTotal - numPaid);
  const totalCombinedDue = (existingKhata?.totalDue || 0) + currentOrderDue;

  const handleConfirmPayment = async () => {
    if (!customerName.trim() && !customerPhone.trim()) {
      toast.error('Please enter Customer Name or Mobile Number');
      return;
    }

    if (customerPhone.trim() && customerPhone.trim().length !== 10) {
      toast.error('Mobile number must be exactly 10 digits');
      return;
    }

    if (numPaid < 0) {
      toast.error('Paid amount cannot be negative');
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const order = await createOrder(
      selectedMethod,
      customerPhone.trim() || undefined,
      customerName.trim() || undefined,
      numPaid,
      currentOrderDue,
      vehicleNumber.trim() ? vehicleNumber.trim().toUpperCase() : undefined
    );
    setCreatedOrder(order);
    setIsProcessing(false);
    onPaymentSuccess(order);

    Swal.fire({
      icon: 'success',
      title: currentOrderDue > 0 ? 'Khata / Order Confirmed!' : 'Payment Confirmed!',
      text:
        currentOrderDue > 0
          ? `Order #${order.orderNumber} placed. Paid: ₹${numPaid}, Remaining Due: ₹${currentOrderDue} added to Khata Book.`
          : `Order #${order.orderNumber} placed successfully via ${selectedMethod}`,
      timer: 3200,
      timerProgressBar: true,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-3xl font-sans',
        title: 'font-black text-gray-900',
      },
    });
  };

  const handleResetForNewOrder = () => {
    setCreatedOrder(null);
    setCustomerName('');
    setCustomerPhone('');
    setVehicleNumber('');
    setPaidAmount('');
    setIsSplitMode(false);
    clearCart();
    onClose();
  };

  const paymentMethods: {
    id: PaymentMethod;
    label: string;
    sub: string;
    icon: React.ElementType;
    activeClass: string;
    iconClass: string;
  }[] = [
    {
      id: 'UPI',
      label: 'UPI / QR',
      sub: 'GPay, PhonePe, Paytm',
      icon: QrCode,
      activeClass: 'border-amber-500 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20 shadow-sm',
      iconClass: 'text-amber-600',
    },
    {
      id: 'CASH',
      label: 'Cash',
      sub: 'Physical Currency',
      icon: Banknote,
      activeClass: 'border-emerald-500 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm',
      iconClass: 'text-emerald-600',
    },
    {
      id: 'CARD',
      label: 'Card / POS',
      sub: 'Debit or Credit',
      icon: CreditCard,
      activeClass: 'border-blue-500 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20 shadow-sm',
      iconClass: 'text-blue-600',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={createdOrder ? handleResetForNewOrder : onClose}
      maxWidth="lg"
    >
      {createdOrder ? (
        /* SUCCESS CONFIRMATION STATE */
        <div className="text-center space-y-5 py-3 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-block bg-emerald-50 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-200">
              ✓ ORDER RECORDED & SYNCED
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Order #{createdOrder.orderNumber}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Total Amount: <strong className="text-slate-900 font-bold">{formatINR(createdOrder.total)}</strong> •
              Paid via <strong className="text-slate-900 font-bold">{createdOrder.paymentMethod}</strong>
            </p>
          </div>

          {currentOrderDue > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 max-w-sm mx-auto font-medium">
              📖 <strong>{formatINR(currentOrderDue)}</strong> balance due has been recorded in{' '}
              <strong>{customerName}&apos;s</strong> Khata account.
            </div>
          )}

          <div className="pt-3 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                if (onPrintBill && createdOrder) {
                  onPrintBill(createdOrder);
                }
              }}
              className="font-bold border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer h-11 px-5 rounded-xl shadow-2xs"
            >
              <Printer className="w-4 h-4 mr-1 text-slate-600" /> Print Bill Slip
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleResetForNewOrder}
              className="font-bold bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20 cursor-pointer h-11 px-6 rounded-xl"
            >
              <PlusCircle className="w-4 h-4 mr-1" /> Next Order
            </Button>
          </div>
        </div>
      ) : (
        /* MODERN CHECKOUT & PAYMENT MODAL */
        <div className="space-y-4">
          {/* 1. HERO TOTAL DUE CARD */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-zinc-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-900/10 flex items-center justify-between border border-slate-700/50">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                  Counter Checkout
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-1">
                {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'} in bill
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Payable
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formatINR(cartTotal)}
              </span>
            </div>
          </div>

          {/* 2. CUSTOMER INFORMATION CARD */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>Customer Details</span>
                <span className="text-rose-600 text-xs font-black">*</span>
              </label>
              {customerPhone.length === 10 ? (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 text-emerald-600" /> 10-Digit Mobile
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-medium">Name or phone required</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer Name Input & Suggestions */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Customer Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Rahul / Walk-in"
                    value={customerName}
                    autoComplete="off"
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setIsNameFocused(true);
                    }}
                    onFocus={() => setIsNameFocused(true)}
                    onBlur={() => setTimeout(() => setIsNameFocused(false), 250)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Suggestions Dropdown (Spacious & Clean) */}
                {isNameFocused && nameMatches.length > 0 && (
                  <div className="absolute left-0 w-full sm:min-w-[320px] top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto animate-in fade-in-50 duration-150">
                    <div className="bg-amber-50/80 px-3 py-1.5 text-[10px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-100">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Previous Customers (Tap to Auto-Fill)
                    </div>
                    {nameMatches.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectCustomer(c);
                        }}
                        className="w-full px-3 py-2.5 text-left hover:bg-amber-50/70 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                            {c.name ? c.name.slice(0, 2) : 'CU'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 group-hover:text-amber-800 truncate">
                              {c.name}
                            </p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                              {c.phone ? (
                                <>
                                  <Phone className="w-2.5 h-2.5 text-slate-400" /> {c.phone}
                                </>
                              ) : (
                                'No phone'
                              )}
                              {c.vehicleNumber && <span>• 🚗 {c.vehicleNumber}</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {c.totalDue && c.totalDue > 0 ? (
                            <span className="text-[9px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full">
                              ₹{c.totalDue} Due
                            </span>
                          ) : null}
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 group-hover:bg-amber-500 group-hover:text-white px-2 py-0.5 rounded-lg transition-colors">
                            Select
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Mobile Input & Suggestions */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Mobile Number (10 digits)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    maxLength={10}
                    autoComplete="off"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setIsPhoneFocused(true);
                    }}
                    onFocus={() => setIsPhoneFocused(true)}
                    onBlur={() => setTimeout(() => setIsPhoneFocused(false), 250)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 font-semibold placeholder:text-slate-400 placeholder:font-normal transition-all"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Phone Suggestions Dropdown */}
                {isPhoneFocused && phoneMatches.length > 0 && (
                  <div className="absolute right-0 w-full sm:min-w-[320px] top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-52 overflow-y-auto animate-in fade-in-50 duration-150">
                    <div className="bg-amber-50/80 px-3 py-1.5 text-[10px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-amber-100">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Matching Mobile Number
                    </div>
                    {phoneMatches.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectCustomer(c);
                        }}
                        className="w-full px-3 py-2.5 text-left hover:bg-amber-50/70 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                            <Phone className="w-3 h-3 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 group-hover:text-amber-800 truncate">
                              {c.phone}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium truncate">
                              Customer: <strong>{c.name}</strong>
                              {c.vehicleNumber && <span> • 🚗 {c.vehicleNumber}</span>}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 group-hover:bg-amber-500 group-hover:text-white px-2 py-0.5 rounded-lg transition-colors shrink-0">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Number (Optional Row) */}
            <div className="pt-0.5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Vehicle No. / Token No. (Optional, e.g. RJ 14 AB 1234)"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 uppercase focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 font-semibold placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal transition-all"
                />
                <Car className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 3. PREVIOUS KHATA DUE ALERT (If customer owes money) */}
          {existingKhata && existingKhata.totalDue > 0 && (
            <div className="p-3 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-2.5 shadow-2xs animate-in fade-in-50 duration-150">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  <span>Existing Khata Balance Warning</span>
                </div>
                <p className="text-amber-900 text-[11px] mt-0.5">
                  <strong>{existingKhata.customerName}</strong> has an open Khata balance of{' '}
                  <strong className="text-rose-700 font-black">{formatINR(existingKhata.totalDue)}</strong>.
                  With this order: <strong className="text-slate-900 font-black">{formatINR(totalCombinedDue)}</strong>
                </p>
              </div>
            </div>
          )}

          {/* 4. PAYMENT SETTLEMENT & KHATA SPLIT CARD */}
          <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-slate-600" />
                <span>Payment Settlement</span>
              </label>

              {/* Mode Toggle Pills */}
              <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsSplitMode(false);
                    setPaidAmount(cartTotal.toString());
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    !isSplitMode && numPaid === cartTotal
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full ({formatINR(cartTotal)})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSplitMode(true);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    isSplitMode || numPaid < cartTotal
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Split / Khata Due
                </button>
              </div>
            </div>

            {/* Split Input Grid (Spacious & Clean) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Amount Paying Now (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    max={cartTotal}
                    value={paidAmount}
                    onChange={(e) => {
                      setPaidAmount(e.target.value);
                      if (Number(e.target.value) < cartTotal) {
                        setIsSplitMode(true);
                      }
                    }}
                    placeholder={cartTotal.toString()}
                    className="w-full pl-7 pr-3 py-2 text-xs font-black text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Remaining Due / Baaki
                </label>
                <div
                  className={`w-full px-3 py-2 text-xs font-black rounded-xl border flex items-center justify-between transition-all ${
                    currentOrderDue > 0
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <span>{formatINR(currentOrderDue)}</span>
                  {currentOrderDue > 0 ? (
                    <span className="text-[10px] font-bold bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                      Khata Due
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Full Paid
                    </span>
                  )}
                </div>
              </div>
            </div>

            {currentOrderDue > 0 && (
              <p className="text-[11px] text-amber-900 bg-amber-50/90 border border-amber-200 rounded-xl p-2 font-medium flex items-center gap-1.5 animate-in fade-in duration-150">
                <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  <strong>{formatINR(currentOrderDue)}</strong> will be credited to{' '}
                  <strong>{customerName || 'Customer'}&apos;s</strong> Khata account book.
                </span>
              </p>
            )}
          </div>

          {/* 5. SELECT PAYMENT METHOD */}
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const isSelected = selectedMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedMethod(pm.id)}
                    className={`relative p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? pm.activeClass
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 font-medium'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-900 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <Icon className={`w-5 h-5 ${isSelected ? pm.iconClass : 'text-slate-500'}`} />
                    <span className="text-xs font-bold leading-tight">{pm.label}</span>
                    <span className="text-[9px] text-slate-400 font-medium leading-none hidden sm:block">
                      {pm.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. CONFIRM PAYMENT BUTTON */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              isLoading={isProcessing}
              onClick={handleConfirmPayment}
              className="w-full font-black text-sm sm:text-base py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              {currentOrderDue > 0 ? (
                <>
                  <span>
                    Collect {formatINR(numPaid)} + Add {formatINR(currentOrderDue)} to Khata
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Confirm Payment • {formatINR(cartTotal)} ({selectedMethod})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
