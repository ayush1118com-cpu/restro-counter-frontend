'use client';

import React, { useState } from 'react';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context/app-context';
import { Order, OrderStatus } from '@/types';
import { formatINR, formatDate, formatTimeAgo, formatTime } from '@/lib/utils';
import { Clock, CheckCircle2, Flame, ChefHat, XCircle, RefreshCw, User, Phone, Plus, Car } from 'lucide-react';
import { BillPreviewModal } from '@/components/pos/bill-preview-modal';
import { AddItemsModal } from '@/components/pos/add-items-modal';

export default function LiveOrdersPage() {
  const { orders, updateOrderStatus } = useApp();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedBillOrder, setSelectedBillOrder] = useState<Order | null>(null);
  const [selectedAddItemsOrder, setSelectedAddItemsOrder] = useState<Order | null>(null);

  const tabs: TabItem[] = [
    { id: 'ALL', label: 'All Orders', count: orders.length },
    { id: 'NEW', label: 'New', count: orders.filter((o) => o.status === 'NEW').length },
    { id: 'ACCEPTED', label: 'Accepted', count: orders.filter((o) => o.status === 'ACCEPTED').length },
    { id: 'PREPARING', label: 'Preparing', count: orders.filter((o) => o.status === 'PREPARING').length },
    { id: 'READY', label: 'Ready', count: orders.filter((o) => o.status === 'READY').length },
    { id: 'COMPLETED', label: 'Completed', count: orders.filter((o) => o.status === 'COMPLETED').length },
    { id: 'CANCELLED', label: 'Cancelled', count: orders.filter((o) => o.status === 'CANCELLED').length },
  ];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'ALL') return true;
    return o.status === activeTab;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="warning">New Order</Badge>;
      case 'ACCEPTED':
        return <Badge variant="info">Accepted</Badge>;
      case 'PREPARING':
        return <Badge variant="warning" className="bg-orange-50 text-orange-700 border-orange-200">Preparing</Badge>;
      case 'READY':
        return <Badge variant="success">Ready for Pickup</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Live Counter Orders</h2>
          <p className="text-xs text-gray-500">Real-time status management for counter orders</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  #{order.orderNumber}
                </span>
                <span className="text-xs text-gray-700 font-bold bg-gray-50 border border-gray-200/70 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{formatTime(order.createdAt)}</span>
                  <span className="text-[11px] text-gray-400 font-normal">({formatTimeAgo(order.createdAt)})</span>
                </span>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {/* Customer Details Tag */}
            <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-amber-50/70 rounded-xl border border-amber-200/50">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 truncate">
                <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">{order.customerName || 'Walk-in Customer'}</span>
              </div>
              <div className="flex items-center gap-2">
                {order.vehicleNumber && (
                  <span className="flex items-center gap-1 font-extrabold text-[10px] bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    <Car className="w-3 h-3 text-amber-700" />
                    <span>{order.vehicleNumber}</span>
                  </span>
                )}
                {order.customerPhone && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-600 font-semibold shrink-0">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2 py-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between text-xs font-semibold text-gray-800">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="text-gray-500">{formatINR(item.price * item.quantity)}</span>
                  </div>
                  {item.notes && (
                    <p className="text-[10px] font-bold text-amber-700 bg-amber-50/80 border border-amber-200/60 px-2 py-0.5 rounded-md inline-block">
                      📝 {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Totals & Payment Info */}
            <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between items-center font-bold text-gray-900 text-sm">
                <span>Total:</span>
                <span className="text-amber-600">{formatINR(order.total)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span>Payment: <strong className="text-gray-800">{order.paymentMethod}</strong></span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md">
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            {/* Action Buttons: Add Items, View Bill and Cancel */}
            <div className="pt-2 flex flex-col gap-2">
              <div className="flex gap-2">
                {order.status !== 'CANCELLED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedAddItemsOrder(order)}
                    className="flex-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Items
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBillOrder(order)}
                  className="flex-1 text-xs font-bold"
                >
                  View Bill
                </Button>
              </div>

              {order.status === 'NEW' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                  className="w-full text-xs font-bold text-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bill Preview Modal */}
      {selectedBillOrder && (
        <BillPreviewModal
          isOpen={!!selectedBillOrder}
          onClose={() => setSelectedBillOrder(null)}
          order={selectedBillOrder}
        />
      )}

      {/* Add Items Modal */}
      {selectedAddItemsOrder && (
        <AddItemsModal
          isOpen={!!selectedAddItemsOrder}
          onClose={() => setSelectedAddItemsOrder(null)}
          order={selectedAddItemsOrder}
          onPrintBill={(ord) => {
            setSelectedBillOrder(ord);
            setTimeout(() => {
              window.print();
            }, 300);
          }}
        />
      )}
    </div>
  );
}
