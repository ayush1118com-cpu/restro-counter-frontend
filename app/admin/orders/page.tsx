'use client';

import React, { useState } from 'react';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { DataTable, Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context/app-context';
import { Order } from '@/types';
import { formatINR, formatDate, formatTime } from '@/lib/utils';
import { Eye, Printer, Clock, User, UtensilsCrossed } from 'lucide-react';
import { BillPreviewModal } from '@/components/pos/bill-preview-modal';
import { OrderDetailsModal } from '@/components/pos/order-details-modal';

export default function OrderHistoryPage() {
  const { orders } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedBillOrder, setSelectedBillOrder] = useState<Order | null>(null);
  const [selectedDetailsOrder, setSelectedDetailsOrder] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      String(o.orderNumber || '').includes(search) ||
      (o.customerName && o.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (o.customerPhone && o.customerPhone.includes(search)) ||
      o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || o.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const columns: Column<Order>[] = [
    {
      header: 'Order ID',
      cell: (o) => (
        <button
          onClick={() => setSelectedDetailsOrder(o)}
          className="font-black text-amber-600 hover:text-amber-700 hover:underline text-left"
        >
          #{o.orderNumber}
        </button>
      ),
    },
    {
      header: 'Customer',
      cell: (o) => (
        <div className="flex flex-col text-xs max-w-[140px]">
          <span className="font-bold text-gray-900 truncate">
            {o.customerName || 'Walk-in'}
          </span>
          {o.customerPhone && (
            <span className="text-[11px] text-gray-500 font-medium truncate">{o.customerPhone}</span>
          )}
          {o.vehicleNumber && (
            <span className="text-[10px] font-extrabold text-amber-900 bg-amber-50 border border-amber-200/80 px-1 py-0.5 rounded mt-0.5 w-fit uppercase tracking-wider">
              🚗 {o.vehicleNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Items Section',
      cell: (o) => (
        <div className="flex flex-col gap-1 py-1 max-w-xs">
          {o.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-800">
              <span className="font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded text-[11px] shrink-0">
                {item.quantity}×
              </span>
              <span className="font-semibold text-gray-900 truncate">{item.name}</span>
              {item.notes && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50/80 border border-amber-200/50 px-1 rounded truncate">
                  📝 {item.notes}
                </span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Total',
      cell: (o) => <span className="font-bold text-gray-900">{formatINR(o.total)}</span>,
    },
    {
      header: 'Payment',
      cell: (o) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-gray-800">{o.paymentMethod}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Badge
              variant={o.paymentStatus === 'PAID' ? 'success' : o.paymentStatus === 'PARTIALLY_PAID' ? 'warning' : 'outline'}
              className="text-[10px] py-0 px-1.5 w-fit font-bold"
            >
              {o.paymentStatus}
            </Badge>
          </div>
          {o.dueAmount !== undefined && o.dueAmount > 0 && (
            <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded mt-0.5 w-fit border border-rose-200">
              Due: {formatINR(o.dueAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Order Status',
      cell: (o) => (
        <Badge variant={o.status === 'READY' || o.status === 'COMPLETED' ? 'success' : o.status === 'CANCELLED' ? 'danger' : 'warning'}>
          {o.status}
        </Badge>
      ),
    },
    {
      header: 'Order Time',
      cell: (o) => (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-gray-900 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            {formatTime(o.createdAt)}
          </span>
          <span className="text-[11px] text-gray-500 font-medium">{formatDate(o.createdAt)}</span>
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (o) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDetailsOrder(o)}
            className="text-xs h-8 px-2 text-gray-700 hover:text-amber-600 hover:border-amber-300"
            title="View Items & Details"
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedBillOrder(o)}
            className="text-xs h-8 px-2 text-gray-700 hover:text-amber-600 hover:border-amber-300"
            title="Print Receipt Bill"
          >
            <Printer className="w-3.5 h-3.5 mr-1" /> Bill
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order History</h2>
        <p className="text-xs text-gray-500">Review past counter transactions and reprint bills</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-72">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search Order #..."
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'New', value: 'NEW' },
              { label: 'Preparing', value: 'PREPARING' },
              { label: 'Ready', value: 'READY' },
              { label: 'Completed', value: 'COMPLETED' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
            className="w-40"
          />

          <Select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            options={[
              { label: 'All Payments', value: 'ALL' },
              { label: 'UPI', value: 'UPI' },
              { label: 'Cash', value: 'CASH' },
              { label: 'Card', value: 'CARD' },
            ]}
            className="w-40"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyTitle="No orders match filters" />

      <BillPreviewModal
        isOpen={!!selectedBillOrder}
        onClose={() => setSelectedBillOrder(null)}
        order={selectedBillOrder}
      />

      <OrderDetailsModal
        isOpen={!!selectedDetailsOrder}
        onClose={() => setSelectedDetailsOrder(null)}
        order={selectedDetailsOrder}
        onPrintBill={(o) => setSelectedBillOrder(o)}
      />
    </div>
  );
}
