'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { useApp } from '@/lib/context/app-context';
import { PaymentTransaction } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { IndianRupee, Banknote, QrCode, CreditCard, Receipt } from 'lucide-react';

export default function PaymentsPage() {
  const { payments, orders, currentUser } = useApp();

  const effectivePayments = React.useMemo(() => {
    const currentRestId = currentUser?.restaurantId;

    // Filter payments strictly for the logged-in restaurant/admin
    const myPayments = (payments || []).filter(
      (p) => !currentRestId || !p.restaurantId || p.restaurantId === currentRestId
    );

    if (myPayments.length > 0) return myPayments;

    const myOrders = (orders || []).filter(
      (o) => !currentRestId || !o.restaurantId || o.restaurantId === currentRestId
    );

    return myOrders
      .filter((o) => o.status !== 'CANCELLED')
      .map((o) => ({
        id: `pay_${o.id}`,
        restaurantId: o.restaurantId,
        orderId: o.id,
        orderNumber: String(o.orderNumber),
        amount: o.total,
        method: o.paymentMethod || 'CASH',
        status: 'SUCCESS' as const,
        createdAt: o.createdAt || new Date().toISOString(),
      }));
  }, [payments, orders, currentUser?.restaurantId]);

  const totalRevenue = effectivePayments.reduce((acc, p) => acc + p.amount, 0);
  const cashTotal = effectivePayments.filter((p) => p.method === 'CASH').reduce((acc, p) => acc + p.amount, 0);
  const upiTotal = effectivePayments.filter((p) => p.method === 'UPI').reduce((acc, p) => acc + p.amount, 0);
  const cardTotal = effectivePayments.filter((p) => p.method === 'CARD').reduce((acc, p) => acc + p.amount, 0);

  const columns: Column<PaymentTransaction>[] = [
    {
      header: 'Order #',
      cell: (p) => <span className="font-black text-amber-600">#{p.orderNumber}</span>,
    },
    {
      header: 'Amount',
      cell: (p) => <span className="font-bold text-gray-900">{formatINR(p.amount)}</span>,
    },
    {
      header: 'Payment Method',
      cell: (p) => (
        <span className="font-semibold text-gray-800 flex items-center gap-1.5">
          {p.method === 'UPI' && <QrCode className="w-4 h-4 text-amber-500" />}
          {p.method === 'CASH' && <Banknote className="w-4 h-4 text-emerald-500" />}
          {p.method === 'CARD' && <CreditCard className="w-4 h-4 text-blue-500" />}
          {p.method}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (p) => <Badge variant="success">Success</Badge>,
    },
    {
      header: 'Transaction Date',
      cell: (p) => <span className="text-gray-500">{formatDate(p.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Payments & Ledger</h2>
        <p className="text-xs text-gray-500">Track daily revenue split by payment instrument</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Today's Revenue</p>
              <h4 className="text-xl font-black text-gray-900 mt-1">{formatINR(totalRevenue)}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500">UPI Payments</p>
              <h4 className="text-xl font-black text-amber-600 mt-1">{formatINR(upiTotal)}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Cash Collections</p>
              <h4 className="text-xl font-black text-emerald-600 mt-1">{formatINR(cashTotal)}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Card Swipes</p>
              <h4 className="text-xl font-black text-blue-600 mt-1">{formatINR(cardTotal)}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500">Transactions</p>
              <h4 className="text-xl font-black text-gray-900 mt-1">{effectivePayments.length}</h4>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
        <DataTable columns={columns} data={effectivePayments} emptyTitle="No payments recorded" />
      </div>
    </div>
  );
}
