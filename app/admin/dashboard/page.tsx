'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  Flame,
  ArrowRight,
  Calculator,
  ChefHat,
  TrendingUp,
  Eye,
  CreditCard,
  Phone,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/context/app-context';
import { formatINR } from '@/lib/utils';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function RestaurantDashboardPage() {
  const { orders, payments, currentUser } = useApp();

  const todaysOrdersCount = orders.length;
  const todaysSalesTotal = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === 'NEW' || o.status === 'PREPARING').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;

  const newOrdersList = orders.filter((o) => o.status === 'NEW');
  const preparingList = orders.filter((o) => o.status === 'PREPARING');
  const readyList = orders.filter((o) => o.status === 'READY');

  const recentOrders = [...orders].slice(0, 5);

  // Chart data
  const hourlyData = [
    { hour: '11 AM', orders: 4, sales: 1250 },
    { hour: '1 PM', orders: 18, sales: 5800 },
    { hour: '3 PM', orders: 8, sales: 2400 },
    { hour: '5 PM', orders: 12, sales: 3900 },
    { hour: '7 PM', orders: 25, sales: 8900 },
    { hour: '9 PM', orders: 22, sales: 7400 },
  ];

  const upiTotal = payments.filter((p) => p.method === 'UPI').reduce((a, b) => a + b.amount, 0);
  const cashTotal = payments.filter((p) => p.method === 'CASH').reduce((a, b) => a + b.amount, 0);
  const cardTotal = payments.filter((p) => p.method === 'CARD').reduce((a, b) => a + b.amount, 0);

  const paymentBreakdown = [
    { name: 'UPI', value: upiTotal || 4500, color: '#f59e0b' },
    { name: 'Cash', value: cashTotal || 3200, color: '#10b981' },
    { name: 'Card', value: cardTotal || 2800, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-white border border-[#E7EAF0] p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033] tracking-tight">
            Good Morning, {currentUser?.name || 'Rahul'} 👋
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            Here is your restaurant performance and live kitchen workflow for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/pos">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-4 h-10 rounded-xl shadow-xs gap-2">
              <Calculator className="w-4 h-4" /> Open Counter POS
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#E7EAF0] bg-white shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085]">Today's Orders</p>
              <h3 className="text-2xl font-bold text-[#172033] mt-1">{todaysOrdersCount}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live tracking
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E7EAF0] bg-white shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085]">Today's Revenue</p>
              <h3 className="text-2xl font-bold text-[#172033] mt-1">{formatINR(todaysSalesTotal)}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Net sales collected</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <IndianRupee className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E7EAF0] bg-white shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085]">Pending Orders</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">In kitchen queue</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#E7EAF0] bg-white shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#667085]">Completed Orders</p>
              <h3 className="text-2xl font-bold text-[#172033] mt-1">{completedCount}</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Dispatched & paid</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Kitchen Operations Pipeline */}
      <Card className="border-[#E7EAF0] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[#E7EAF0]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-base font-bold text-[#172033]">
                Live Kitchen Operations Pipeline
              </CardTitle>
            </div>
            <Link href="/admin/live-orders" className="text-xs text-amber-600 font-semibold hover:underline">
              View All Live Orders →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* NEW */}
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-800 tracking-wider">NEW ORDERS</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-xs">
                  {newOrdersList.length}
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                {newOrdersList.length === 0
                  ? 'No pending orders waiting'
                  : `${newOrdersList.length} order(s) awaiting kitchen acceptance`}
              </p>
            </div>

            {/* PREPARING */}
            <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-orange-800 tracking-wider">PREPARING</span>
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold text-xs">
                  {preparingList.length}
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                {preparingList.length === 0
                  ? 'No active orders cooking'
                  : `${preparingList.length} order(s) currently being prepared`}
              </p>
            </div>

            {/* READY */}
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/70 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-800 tracking-wider">READY FOR PICKUP</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-xs">
                  {readyList.length}
                </span>
              </div>
              <p className="text-xs text-[#667085]">
                {readyList.length === 0
                  ? 'No ready orders at pickup'
                  : `${readyList.length} order(s) ready for customer dispatch`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Analytics & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Hourly Breakdown */}
        <Card className="lg:col-span-2 border-[#E7EAF0] bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#172033]">
              Today's Sales Hourly Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-[#667085]">
              Real-time revenue timeline for current operational shift
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#667085' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [
                    formatINR(typeof value === 'number' ? value : Number(value) || 0),
                    'Revenue',
                  ]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#E7EAF0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card className="border-[#E7EAF0] bg-white shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#172033]">Payment Method Breakdown</CardTitle>
            <CardDescription className="text-xs text-[#667085]">UPI vs Cash vs Card proportions</CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-0 flex flex-col items-center justify-between">
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={paymentBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [
                    formatINR(typeof value === 'number' ? value : Number(value) || 0),
                    'Amount',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 text-xs font-medium pb-2 w-full">
              {paymentBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#172033] font-semibold">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="border-[#E7EAF0] bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-[#E7EAF0]/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#172033]">Recent Counter Orders</CardTitle>
            <CardDescription className="text-xs text-[#667085]">Latest transactions processed at counter</CardDescription>
          </div>
          <Link href="/admin/orders">
            <Button variant="ghost" size="sm" className="text-xs text-amber-600 hover:text-amber-700 font-semibold">
              View All Orders →
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#667085]">
              No orders logged today yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#172033]">
                <thead className="bg-[#F7F8FA] border-b border-[#E7EAF0] text-[#667085] uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="p-3.5 pl-6">Order ID</th>
                    <th className="p-3.5">Customer / Table</th>
                    <th className="p-3.5">Items Summary</th>
                    <th className="p-3.5">Total</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EAF0]">
                  {recentOrders.map((order) => {
                    const statusColors: Record<string, string> = {
                      NEW: 'bg-amber-100 text-amber-800 border-amber-200',
                      PREPARING: 'bg-orange-100 text-orange-800 border-orange-200',
                      READY: 'bg-blue-100 text-blue-800 border-blue-200',
                      COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                      CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
                    };

                    return (
                      <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 pl-6 font-bold text-[#172033]">
                          #{order.orderNumber}
                        </td>
                        <td className="p-3.5">
                          <p className="font-semibold text-[#172033]">
                            {order.customerName || 'Counter Customer'}
                          </p>
                          {order.customerPhone && (
                            <p className="text-[10px] text-[#667085]">{order.customerPhone}</p>
                          )}
                        </td>
                        <td className="p-3.5 text-[#667085] max-w-xs truncate">
                          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="p-3.5 font-bold text-[#172033]">
                          {formatINR(order.total)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              statusColors[order.status] || 'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-3.5 pr-6 text-right">
                          <Link href="/admin/orders">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-medium text-gray-600 hover:text-[#172033]">
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
