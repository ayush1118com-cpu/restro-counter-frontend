'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PaymentMethod, Order } from '@/types';
import { formatINR } from '@/lib/utils';
import { Banknote, QrCode, CreditCard, CheckCircle2, Printer, PlusCircle, AlertCircle, BookOpen, Car, User, Phone, Sparkles } from 'lucide-react';
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
  const { cartTotal, createOrder, clearCart, getCustomerKhata, orders, khataAccounts } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Autocomplete state
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  // Initialize paid amount whenever cartTotal changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPaidAmount(cartTotal.toString());
    }
  }, [isOpen, cartTotal]);

  // Aggregate past customers from both orders and khata accounts
  const previousCustomers = React.useMemo(() => {
    const map = new Map<string, { name: string; phone: string; vehicleNumber?: string; key: string }>();

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
        });
      } else {
        const existing = map.get(key)!;
        if (!existing.phone && phone) existing.phone = phone;
      }
    });

    return Array.from(map.values());
  }, [orders, khataAccounts]);

  // Filter matching suggestions
  const nameMatches = React.useMemo(() => {
    const q = customerName.trim().toLowerCase();
    if (!q) return [];
    return previousCustomers
      .filter((c) => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q)))
      .slice(0, 6);
  }, [customerName, previousCustomers]);

  const phoneMatches = React.useMemo(() => {
    const q = customerPhone.trim();
    if (!q || q.length < 2) return [];
    return previousCustomers
      .filter((c) => c.phone && c.phone.includes(q))
      .slice(0, 6);
  }, [customerPhone, previousCustomers]);

  const handleSelectCustomer = (c: { name: string; phone: string; vehicleNumber?: string }) => {
    if (c.name) setCustomerName(c.name);
    if (c.phone) setCustomerPhone(c.phone);
    if (c.vehicleNumber) setVehicleNumber(c.vehicleNumber);
    setIsNameFocused(false);
    setIsPhoneFocused(false);
  };

  // Check if this customer already has an existing Khata account with pending due
  const existingKhata = React.useMemo(() => {
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
    await new Promise((resolve) => setTimeout(resolve, 600));
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
      text: currentOrderDue > 0
        ? `Order #${order.orderNumber} placed. Paid: ₹${numPaid}, Remaining Due: ₹${currentOrderDue} added to Khata Book.`
        : `Order #${order.orderNumber} placed successfully via ${selectedMethod}`,
      timer: 3500,
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
    clearCart();
    onClose();
  };

  const paymentMethods: { id: PaymentMethod; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'UPI', label: 'UPI / QR Code', icon: QrCode, color: 'border-amber-500 bg-amber-50 text-amber-900' },
    { id: 'CASH', label: 'Cash Payment', icon: Banknote, color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
    { id: 'CARD', label: 'Debit / Credit Card', icon: CreditCard, color: 'border-blue-500 bg-blue-50 text-blue-900' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={createdOrder ? handleResetForNewOrder : onClose}
      title={createdOrder ? undefined : 'Confirm Counter Payment'}
      maxWidth="md"
    >
      {createdOrder ? (
        /* SUCCESS CONFIRMATION STATE */
        <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-gray-900">✓ Payment Successful</h3>
            <p className="text-sm font-bold text-amber-600">Order #{createdOrder.orderNumber} Created</p>
            <p className="text-xs text-gray-500 pt-1">
              Paid <strong className="text-gray-900">{formatINR(createdOrder.total)}</strong> via{' '}
              <strong className="text-gray-900">{createdOrder.paymentMethod}</strong>
            </p>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                if (onPrintBill && createdOrder) {
                  onPrintBill(createdOrder);
                }
              }}
              className="font-semibold cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Bill
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleResetForNewOrder}
              className="font-bold shadow-md shadow-amber-500/20"
            >
              <PlusCircle className="w-4 h-4" /> New Order
            </Button>
          </div>
        </div>
      ) : (
        /* PAYMENT METHOD SELECTION FORM */
        <div className="space-y-3.5">
          {/* Order Total Display Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-200/80 text-center">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">ORDER TOTAL DUE</span>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{formatINR(cartTotal)}</h2>
          </div>

          {/* Customer Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            {/* Customer Name with Autocomplete Dropdown */}
            <div className="relative">
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5 flex items-center justify-between">
                <span>Customer Name <span className="text-rose-600 font-bold">*</span></span>
                {nameMatches.length > 0 && isNameFocused && (
                  <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5">
                    <Sparkles className="w-2 h-2" /> {nameMatches.length}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Rahul / Token"
                  value={customerName}
                  autoComplete="off"
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    setIsNameFocused(true);
                  }}
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setTimeout(() => setIsNameFocused(false), 200)}
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-amber-500 font-medium placeholder:text-gray-400"
                />
                <User className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Name Suggestions Dropdown */}
              {isNameFocused && nameMatches.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-amber-300 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto animate-in fade-in-50 duration-150">
                  <div className="bg-amber-50/70 px-3 py-1 text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Previous Customers (Click to auto-fill)
                  </div>
                  {nameMatches.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectCustomer(c);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-amber-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-xs text-gray-900 group-hover:text-amber-700 truncate">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                          {c.phone ? (
                            <>
                              <Phone className="w-2.5 h-2.5 text-gray-400" /> {c.phone}
                            </>
                          ) : (
                            'No phone'
                          )}
                          {c.vehicleNumber && <span>• 🚗 {c.vehicleNumber}</span>}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        Auto-Fill
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Number with Phone Autocomplete Dropdown */}
            <div className="relative">
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5 flex items-center justify-between">
                <span>Mobile (10 digits)</span>
                {phoneMatches.length > 0 && isPhoneFocused && (
                  <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5">
                    <Sparkles className="w-2 h-2" /> Match
                  </span>
                )}
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
                  onBlur={() => setTimeout(() => setIsPhoneFocused(false), 200)}
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-amber-500 font-medium placeholder:text-gray-400"
                />
                <Phone className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Phone Suggestions Dropdown */}
              {isPhoneFocused && phoneMatches.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-amber-300 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-gray-100 max-h-40 overflow-y-auto animate-in fade-in-50 duration-150">
                  <div className="bg-amber-50/70 px-2.5 py-1 text-[9px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                    Matching Customer
                  </div>
                  {phoneMatches.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectCustomer(c);
                      }}
                      className="w-full px-2.5 py-1.5 text-left hover:bg-amber-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-xs text-gray-900 group-hover:text-amber-700 truncate">
                          {c.phone}
                        </p>
                        <p className="text-[9px] text-gray-500 font-medium">
                          Name: <strong>{c.name}</strong>
                          {c.vehicleNumber && <span> • 🚗 {c.vehicleNumber}</span>}
                        </p>
                      </div>
                      <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        Auto-Fill
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5 flex items-center gap-1">
                <Car className="w-3 h-3 text-amber-600" />
                <span>Vehicle No.</span>
                <span className="text-gray-400 font-normal text-[10px]">(Opt)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. RJ 14 AB 1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-gray-900 uppercase focus:outline-none focus:border-amber-500 font-medium placeholder:text-gray-400 placeholder:normal-case"
              />
            </div>
          </div>

          {/* PREVIOUS KHATA DUE ALERT BANNER */}
          {existingKhata && existingKhata.totalDue > 0 && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="flex items-center gap-1 font-semibold text-rose-900">
                  <BookOpen className="w-3 h-3 text-rose-600" />
                  <span>Previous Khata Due</span>
                </div>
                <p className="text-rose-800 text-[11px] mt-0.5">
                  Customer <strong>{existingKhata.customerName}</strong> has pending due of{' '}
                  <strong className="text-rose-900 font-bold">{formatINR(existingKhata.totalDue)}</strong>. Total with order: <strong className="text-rose-950 font-bold">{formatINR(totalCombinedDue)}</strong>
                </p>
              </div>
            </div>
          )}

          {/* PAYMENT BREAKDOWN: Amount Paid & Balance Due */}
          <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                Received vs Due (Khata Split)
              </span>
              <button
                type="button"
                onClick={() => setPaidAmount(cartTotal.toString())}
                className="text-[10px] font-semibold text-amber-700 hover:text-amber-800 underline"
              >
                Full (₹{cartTotal})
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-emerald-800 mb-0.5">
                  Amount Paying Now (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    max={cartTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder={cartTotal.toString()}
                    className="w-full pl-5 pr-2 py-1 text-xs font-bold text-emerald-700 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-rose-800 mb-0.5">
                  Remaining Due / Baaki (₹)
                </label>
                <div className="w-full px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
                  <span>{formatINR(currentOrderDue)}</span>
                  {currentOrderDue > 0 && (
                    <span className="text-[9px] font-bold bg-rose-200 text-rose-900 px-1 py-0.2 rounded">
                      Khata Due
                    </span>
                  )}
                </div>
              </div>
            </div>

            {currentOrderDue > 0 && (
              <p className="text-[10px] text-amber-800 bg-white p-1.5 rounded-lg border border-amber-200 flex items-center gap-1">
                <span>📝 Note:</span>
                <span>
                  ₹{currentOrderDue} will be added to <strong>{customerName || 'customer'}&apos;s</strong> Khata account.
                </span>
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider">
              Select Payment Method:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const isSelected = selectedMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedMethod(pm.id)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? `${pm.color} ring-2 ring-amber-500/30 font-bold shadow-xs`
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-medium'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-600' : 'text-gray-500'}`} />
                    <span className="text-[11px] leading-tight">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-1">
            <Button
              variant="primary"
              size="md"
              isLoading={isProcessing}
              onClick={handleConfirmPayment}
              className="w-full font-bold shadow-md shadow-amber-500/20 py-2.5 text-sm"
            >
              Confirm Payment ({selectedMethod})
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

