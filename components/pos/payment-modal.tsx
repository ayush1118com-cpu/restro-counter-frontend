'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PaymentMethod, Order } from '@/types';
import { formatINR } from '@/lib/utils';
import { Banknote, QrCode, CreditCard, CheckCircle2, Printer, PlusCircle, AlertCircle, BookOpen, Car } from 'lucide-react';
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
  const { cartTotal, createOrder, clearCart, getCustomerKhata } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize paid amount whenever cartTotal changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPaidAmount(cartTotal.toString());
    }
  }, [isOpen, cartTotal]);

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
        <div className="space-y-6">
          {/* Order Total Display Banner */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200/80 text-center space-y-1">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">ORDER TOTAL DUE</span>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">{formatINR(cartTotal)}</h2>
          </div>

          {/* Customer Details Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Customer Name / Token <span className="text-rose-600 font-black">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul / Token 12"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-500 font-semibold placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Mobile Number <span className="text-gray-400 font-normal">(10 digits)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                maxLength={10}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-500 font-semibold placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center gap-1">
                <Car className="w-3.5 h-3.5 text-amber-600" />
                <span>Vehicle No.</span>
                <span className="text-gray-400 font-normal text-[10px]">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. RJ 14 AB 1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 uppercase focus:outline-none focus:border-amber-500 font-bold placeholder:text-gray-400 placeholder:normal-case"
              />
            </div>
          </div>

          {/* PREVIOUS KHATA DUE ALERT BANNER */}
          {existingKhata && existingKhata.totalDue > 0 && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                  <span>Previous Khata Due Alert!</span>
                </div>
                <p className="text-rose-800 mt-0.5">
                  Customer <strong>{existingKhata.customerName}</strong> has an existing pending balance of{' '}
                  <strong className="text-rose-900 text-sm font-black underline decoration-rose-400">
                    {formatINR(existingKhata.totalDue)}
                  </strong>
                  .
                </p>
                <p className="text-[11px] text-rose-700/80 mt-1 font-medium">
                  Total Payable with this order: <strong className="text-rose-950 font-black">{formatINR(totalCombinedDue)}</strong>
                </p>
              </div>
            </div>
          )}

          {/* PAYMENT BREAKDOWN: Amount Paid & Balance Due */}
          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Received vs Due (Khata Split)
              </span>
              <button
                type="button"
                onClick={() => setPaidAmount(cartTotal.toString())}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline"
              >
                Full Payment (₹{cartTotal})
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                  Amount Paying Now (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-gray-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    max={cartTotal}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder={cartTotal.toString()}
                    className="w-full pl-6 pr-3 py-2 text-sm font-black text-emerald-700 bg-white border border-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-rose-800 mb-1">
                  Remaining Due / Baaki (₹)
                </label>
                <div className="w-full px-3 py-2 text-sm font-black text-rose-700 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                  <span>{formatINR(currentOrderDue)}</span>
                  {currentOrderDue > 0 && (
                    <span className="text-[10px] font-bold bg-rose-200/80 text-rose-900 px-1.5 py-0.5 rounded">
                      Khata Due
                    </span>
                  )}
                </div>
              </div>
            </div>

            {currentOrderDue > 0 && (
              <p className="text-[11px] text-amber-800 font-semibold bg-white p-2 rounded-lg border border-amber-200 flex items-center gap-1.5">
                <span>📝 Note:</span>
                <span>
                  ₹{currentOrderDue} will be automatically added to <strong>{customerName || 'customer'}&apos;s</strong> Khata account.
                </span>
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Select Payment Method:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {paymentMethods.map((pm) => {
                const Icon = pm.icon;
                const isSelected = selectedMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSelectedMethod(pm.id)}
                    className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                      isSelected
                        ? `${pm.color} ring-2 ring-amber-500/30 font-bold shadow-md scale-102`
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? 'text-amber-600' : 'text-gray-500'}`} />
                    <span className="text-xs font-semibold">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              isLoading={isProcessing}
              onClick={handleConfirmPayment}
              className="w-full font-bold shadow-lg shadow-amber-500/25 py-3 text-base"
            >
              Confirm Payment ({selectedMethod})
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

