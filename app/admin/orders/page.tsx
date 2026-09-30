'use client';

import React, { useState } from 'react';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { DataTable, Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useApp } from '@/lib/context/app-context';
import { Order } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { Eye, Printer } from 'lucide-react';
import { BillPreviewModal } from '@/components/pos/bill-preview-modal';

export default function OrderHistoryPage() {
  const { orders } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [selectedBillOrder, setSelectedBillOrder] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.includes(search) ||
      o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesPayment = paymentFilter === 'ALL' || o.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const columns: Column<Order>[] = [
    {
      header: 'Order ID',
      cell: (o) => <span className="font-black text-amber-600">#{o.orderNumber}</span>,
    },
    {
      header: 'Items',
      cell: (o) => (
        <span className="text-gray-700 truncate max-w-xs block">
          {o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
        </span>
      ),
    },
    {
      header: 'Total',
      cell: (o) => <span className="font-bold text-gray-900">{formatINR(o.total)}</span>,
    },
    {
      header: 'Payment',
      cell: (o) => <span className="font-semibold text-gray-700">{o.paymentMethod}</span>,
    },
    {
      header: 'Payment Status',
      cell: (o) => <Badge variant="success">{o.paymentStatus}</Badge>,
    },
    {
      header: 'Order Status',
      cell: (o) => (
        <Badge variant={o.status === 'READY' || o.status === 'COMPLETED' ? 'success' : 'warning'}>
          {o.status}
        </Badge>
      ),
    },
    {
      header: 'Date',
      cell: (o) => <span className="text-gray-500">{formatDate(o.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (o) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedBillOrder(o)}
          className="text-xs"
        >
          <Printer className="w-3.5 h-3.5 mr-1" /> Bill
        </Button>
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
    </div>
  );
}
