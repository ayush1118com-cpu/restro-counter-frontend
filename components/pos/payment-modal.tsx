'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { PaymentMethod, Order } from '@/types';
import { formatINR } from '@/lib/utils';
import { Banknote, QrCode, CreditCard, CheckCircle2, Printer, PlusCircle } from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import Swal from 'sweetalert2';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (order: Order) => void;
  onPrintBill?: (order: Order) => void;
}

export function PaymentModal({ isOpen, onClose, onPaymentSuccess, onPrintBill }: PaymentModalProps) {
  const { cartTotal, createOrder, clearCart } = useApp();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const order = createOrder(selectedMethod, customerPhone || undefined, customerName || undefined);
    setCreatedOrder(order);
    setIsProcessing(false);
    onPaymentSuccess(order);

    Swal.fire({
      icon: 'success',
      title: 'Payment Confirmed!',
      text: `Order #${order.orderNumber} placed successfully via ${selectedMethod}`,
      timer: 3000,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Amit Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number (Optional)</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-500 font-semibold"
              />
            </div>
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
