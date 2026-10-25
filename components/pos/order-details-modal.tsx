'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { formatINR, formatDate, formatTime } from '@/lib/utils';
import { Clock, Printer, User, Phone, CreditCard, UtensilsCrossed, Car } from 'lucide-react';

export interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPrintBill?: (order: Order) => void;
}

export function OrderDetailsModal({
  isOpen,
  onClose,
  order,
  onPrintBill,
}: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details #${order.orderNumber}`}
      maxWidth="lg"
    >
      <div className="space-y-5 py-1">
        {/* Top Header Card */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-amber-600">
                #{order.orderNumber}
              </span>
              <Badge
                variant={
                  order.status === 'READY' || order.status === 'COMPLETED'
                    ? 'success'
                    : order.status === 'CANCELLED'
                    ? 'danger'
                    : 'warning'
                }
              >
                {order.status}
              </Badge>
              <Badge variant="outline" className="font-semibold text-gray-700 bg-white">
                {order.paymentMethod} • {order.paymentStatus}
              </Badge>
            </div>

            {/* Arrival Time */}
            <div className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold mt-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Received At:</span>
              <span className="font-black text-gray-900">{formatTime(order.createdAt)}</span>
              <span className="text-gray-400 font-normal">({formatDate(order.createdAt)})</span>
            </div>
          </div>

          {onPrintBill && (
            <Button
              size="sm"
              onClick={() => {
                onClose();
                onPrintBill(order);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shrink-0"
            >
              <Printer className="w-4 h-4 mr-1.5" /> Print Bill
            </Button>
          )}
        </div>

        {/* Customer Information */}
        <div className={`grid grid-cols-1 ${order.vehicleNumber ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100`}>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Customer Name / Token</p>
              <p className="font-bold text-gray-900 truncate">
                {order.customerName || 'Walk-in Customer'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[11px] text-gray-400 font-medium">Phone Number</p>
              <p className="font-bold text-gray-900 truncate">
                {order.customerPhone || 'Not provided'}
              </p>
            </div>
          </div>
          {order.vehicleNumber && (
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-[11px] text-gray-400 font-medium">Vehicle Number</p>
                <p className="font-extrabold text-amber-900 uppercase tracking-wide truncate">
                  {order.vehicleNumber}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ITEM SECTION */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-amber-500" />
              Order Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
            </h4>
            <span className="text-xs text-gray-500">Unit Price × Qty</span>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex items-start justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded text-xs">
                      {item.quantity}×
                    </span>
                    <span className="font-bold text-gray-900 text-sm">
                      {item.name}
                    </span>
                    {item.addedAt && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-amber-600" />
                        +Added {formatTime(item.addedAt)}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <div className="inline-block text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
                      📝 {item.notes}
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500">
                    Rate: {formatINR(item.price)} each
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-gray-900 text-sm">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600 font-medium">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount</span>
              <span>-{formatINR(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600 font-medium">
            <span>Taxes & GST</span>
            <span>{formatINR(order.tax)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-200">
            <span>Grand Total</span>
            <span className="text-amber-600">{formatINR(order.total)}</span>
          </div>
          {order.dueAmount !== undefined && order.dueAmount > 0 && (
            <div className="pt-2 border-t border-rose-200 space-y-1">
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Amount Paid</span>
                <span>{formatINR(order.paidAmount !== undefined ? order.paidAmount : order.total - order.dueAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-black text-sm bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                <span>Khata Balance Due</span>
                <span>{formatINR(order.dueAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
