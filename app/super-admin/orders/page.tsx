'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import { DataTable, Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatINR } from '@/lib/utils';
import { Order } from '@/types';
import { SearchInput } from '@/components/ui/search-input';

export default function GlobalOrdersPage() {
  const { orders } = useApp();
  const [search, setSearch] = useState('');

  const filtered = orders.filter((o) =>
    o.orderNumber.includes(search) ||
    o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
  );

  const columns: Column<Order>[] = [
    {
      header: 'Order #',
      cell: (o) => <span className="font-black text-amber-600">#{o.orderNumber}</span>,
    },
    {
      header: 'Items',
      cell: (o) => (
        <span className="text-gray-700">
          {o.items.map((i) => `${i.name} (${i.quantity})`).join(', ')}
        </span>
      ),
    },
    {
      header: 'Total',
      cell: (o) => <span className="font-bold text-gray-900">{formatINR(o.total)}</span>,
    },
    {
      header: 'Payment Method',
      accessorKey: 'paymentMethod',
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
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Global Orders Monitor</h2>
        <p className="text-xs text-gray-500">System-wide counter orders real-time log</p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs max-w-sm">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search by order # or item name..."
        />
      </div>

      <DataTable columns={columns} data={filtered} emptyTitle="No global orders found" />
    </div>
  );
}
