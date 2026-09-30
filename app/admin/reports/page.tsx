'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabItem } from '@/components/ui/tabs';
import { formatINR } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function ReportsPage() {
  const { orders } = useApp();
  const [period, setPeriod] = useState<string>('WEEKLY');

  const tabs: TabItem[] = [
    { id: 'DAILY', label: 'Daily View' },
    { id: 'WEEKLY', label: 'Weekly View' },
    { id: 'MONTHLY', label: 'Monthly View' },
  ];

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const totalOrdersCount = orders.length;
  const completedOrdersCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const cancelledOrdersCount = orders.filter((o) => o.status === 'CANCELLED').length;
  const fulfillmentRate = totalOrdersCount > 0 ? ((completedOrdersCount / totalOrdersCount) * 100).toFixed(1) : '100.0';
  const avgTicketSize = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const salesTrendData = days.map((day) => {
    // Calculate live daily orders & revenue
    const dayOrders = orders.filter((o) => {
      const d = new Date(o.createdAt);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      return dayName === day;
    });
    const sales = dayOrders.reduce((sum, o) => sum + o.total, 0);
    return { label: day, sales, orders: dayOrders.length };
  });

  const orderFulfillmentData = [
    { name: 'Completed Orders', value: completedOrdersCount, color: '#10b981' },
    { name: 'Cancelled Orders', value: cancelledOrdersCount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Analytics & Business Reports</h2>
          <p className="text-xs text-gray-500">Comprehensive sales, order fulfillment, and metrics reporting</p>
        </div>
        <Tabs tabs={tabs} activeTab={period} onChange={setPeriod} />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 font-semibold">Total Revenue</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{formatINR(totalRevenue)}</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-bold">Real-time revenue total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 font-semibold">Total Orders Processed</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalOrdersCount} Orders</h3>
            <p className="text-[10px] text-emerald-600 mt-1 font-bold">Counter transactions logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 font-semibold">Fulfillment Rate</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{fulfillmentRate}%</h3>
            <p className="text-[10px] text-gray-400 mt-1">Order dispatch accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 font-semibold">Average Ticket Size</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{formatINR(avgTicketSize)}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Average per customer bill</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Sales Revenue Trend ({period})</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [
                    formatINR(typeof val === 'number' ? val : Number(val) || 0),
                    'Revenue',
                  ]}
                />
                <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Order Count Volume ({period})</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [
                    `${typeof val === 'number' ? val : Number(val) || 0} Orders`,
                    'Count',
                  ]}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fulfillment Distribution */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-base font-bold">Completed vs Cancelled Orders</CardTitle>
        </CardHeader>
        <CardContent className="h-56 flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={orderFulfillmentData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={5}
                dataKey="value"
              >
                {orderFulfillmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 text-xs font-semibold">
            {orderFulfillmentData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
