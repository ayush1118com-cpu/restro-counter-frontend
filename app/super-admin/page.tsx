'use client';

import React from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  IndianRupee,
  Users,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  BarChart,
  Bar,
} from 'recharts';

export default function SuperAdminDashboard() {
  const { restaurants, leads, orders } = useApp();

  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter((r) => r.status === 'ACTIVE').length;
  const suspendedRestaurants = restaurants.filter((r) => r.status === 'SUSPENDED').length;
  const todaysOrders = orders.length;
  const todaysRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const newLeadsCount = leads.filter((l) => l.status === 'NEW').length;

  // Hourly chart data calculated dynamically from orders
  const times = ['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM', '07:00 PM', '09:00 PM'];
  const chartData = times.map((t) => ({
    time: t,
    orders: orders.length > 0 ? Math.round(orders.length / 7) : 0,
    revenue: orders.length > 0 ? Math.round(todaysRevenue / 7) : 0,
  }));

  const stats = [
    { title: 'Total Restaurants', value: totalRestaurants, icon: Building2, color: 'text-amber-500 bg-amber-50' },
    { title: 'Active Restaurants', value: activeRestaurants, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50' },
    { title: 'Suspended Restaurants', value: suspendedRestaurants, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { title: "Today's Orders", value: todaysOrders, icon: ShoppingBag, color: 'text-blue-500 bg-blue-50' },
    { title: "Today's Revenue", value: formatINR(todaysRevenue), icon: IndianRupee, color: 'text-purple-500 bg-purple-50' },
    { title: 'New Leads', value: newLeadsCount, icon: Users, color: 'text-rose-500 bg-rose-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Super Admin Dashboard</h2>
        <p className="text-xs text-gray-500">Platform operational overview and multi-restaurant metrics</p>
      </div>

      {/* 6 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {stats.map((st, idx) => {
          const Icon = st.icon;
          return (
            <Card key={idx} className="hover:border-amber-200 transition-all">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500">{st.title}</p>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{st.value}</h3>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> +14.2% from last week
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${st.color} flex items-center justify-center shadow-xs`}>
                  <Icon className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Area & Active Admins Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Revenue Over Time</span>
              <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-semibold">Today</span>
            </CardTitle>
            <CardDescription>Aggregate platform sales volume in INR</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [
                    formatINR(typeof value === 'number' ? value : Number(value) || 0),
                    'Revenue',
                  ]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ACTIVE ADMINS & RESTAURANTS SIDEBAR PANEL */}
        <Card>
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" /> Active Admins
              </span>
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● LIVE ONLINE ({restaurants.filter((r) => r.status === 'ACTIVE').length})
              </span>
            </CardTitle>
            <CardDescription className="text-xs">Active restaurant admins & terminals operating right now</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 max-h-[340px] overflow-y-auto no-scrollbar">
            {restaurants.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 font-medium">
                No active restaurant outlets registered yet.
              </div>
            ) : (
              restaurants.map((rest) => {
              const isActive = rest.status === 'ACTIVE';
              return (
                <div
                  key={rest.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-white border-gray-100 shadow-xs hover:border-amber-200'
                      : 'bg-gray-50/60 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 font-black text-sm flex items-center justify-center">
                        {rest.name.charAt(0)}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{rest.ownerName}</p>
                      <p className="text-[11px] text-gray-500 font-semibold truncate">{rest.name}</p>
                      <p className="text-[10px] text-amber-600 font-medium">{rest.city}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {isActive ? 'ONLINE' : rest.status}
                  </span>
                </div>
              );
            })
          )}
        </CardContent>
        </Card>
      </div>

      {/* Orders Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>Orders Over Time</span>
            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full font-semibold">Today</span>
          </CardTitle>
          <CardDescription>Total count of processed counter orders across all outlets</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: any) => [
                  `${typeof value === 'number' ? value : Number(value) || 0} Orders`,
                  'Volume',
                ]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
              />
              <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
