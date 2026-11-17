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
  Layers,
  Calculator,
  QrCode,
  Smartphone,
  Banknote,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useApp } from '@/lib/context/app-context';
import { formatINR } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Link from 'next/link';

export default function SuperAdminDashboard() {
  const { restaurants, leads } = useApp();

  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter((r) => r.status === 'ACTIVE').length;
  const suspendedRestaurants = restaurants.filter((r) => r.status === 'SUSPENDED').length;
  const newLeadsCount = leads.filter((l) => l.status === 'NEW').length;

  // Resolve Package for each restaurant
  const resolvePackage = (r: any): 'BOTH' | 'POS_ONLY' | 'SCANNER_ONLY' => {
    if (r.subscriptionPlan) return r.subscriptionPlan;
    if (r.posEnabled !== false && r.hasTableQrOrdering !== false) return 'BOTH';
    if (r.posEnabled !== false && r.hasTableQrOrdering === false) return 'POS_ONLY';
    return 'SCANNER_ONLY';
  };

  const bothPlanRestaurants = restaurants.filter((r) => resolvePackage(r) === 'BOTH');
  const posOnlyRestaurants = restaurants.filter((r) => resolvePackage(r) === 'POS_ONLY');
  const scannerOnlyRestaurants = restaurants.filter((r) => resolvePackage(r) === 'SCANNER_ONLY');

  const bothPlanCount = bothPlanRestaurants.length;
  const posOnlyCount = posOnlyRestaurants.length;
  const scannerOnlyCount = scannerOnlyRestaurants.length;

  // Monthly Recurring Revenue (MRR) from packages
  const monthlyBothRevenue = bothPlanCount * 899;
  const monthlyPosRevenue = posOnlyCount * 499;
  const monthlyScannerRevenue = scannerOnlyCount * 499;
  const totalMonthlySubscriptionRevenue = monthlyBothRevenue + monthlyPosRevenue + monthlyScannerRevenue;

  // Payment Mode collection breakdown
  const upiCount = restaurants.filter((r) => !r.paymentMode || r.paymentMode === 'UPI').length;
  const cashCount = restaurants.filter((r) => r.paymentMode === 'CASH').length;

  // Chart data for packages
  const packageChartData = [
    {
      name: 'Both (POS + Scanner)',
      price: '₹899/mo',
      clients: bothPlanCount,
      revenue: monthlyBothRevenue,
      color: '#f59e0b',
    },
    {
      name: 'Counter POS Only',
      price: '₹499/mo',
      clients: posOnlyCount,
      revenue: monthlyPosRevenue,
      color: '#3b82f6',
    },
    {
      name: 'Table Scanner Only',
      price: '₹499/mo',
      clients: scannerOnlyCount,
      revenue: monthlyScannerRevenue,
      color: '#a855f7',
    },
  ];

  const stats = [
    {
      title: 'Monthly Subscription Revenue',
      value: formatINR(totalMonthlySubscriptionRevenue),
      subtext: `From ${activeRestaurants} active paying outlets`,
      icon: IndianRupee,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      title: 'Both POS & Scanner (₹899/mo)',
      value: `${bothPlanCount} Outlets`,
      subtext: `${formatINR(monthlyBothRevenue)}/mo recurring`,
      icon: Sparkles,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      title: 'Counter POS Only (₹499/mo)',
      value: `${posOnlyCount} Outlets`,
      subtext: `${formatINR(monthlyPosRevenue)}/mo recurring`,
      icon: Calculator,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      title: 'Table Scanner Only (₹499/mo)',
      value: `${scannerOnlyCount} Outlets`,
      subtext: `${formatINR(monthlyScannerRevenue)}/mo recurring`,
      icon: QrCode,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      title: 'Total Registered Outlets',
      value: totalRestaurants,
      subtext: `${activeRestaurants} Active • ${suspendedRestaurants} Suspended`,
      icon: Building2,
      color: 'text-slate-700 bg-slate-100',
    },
    {
      title: 'New Client Leads',
      value: newLeadsCount,
      subtext: 'Prospects interested in software',
      icon: Users,
      color: 'text-rose-600 bg-rose-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h2>
          <p className="text-xs text-gray-500">Subscription plans, client module distribution and monthly SaaS revenue</p>
        </div>
        <Link href="/super-admin/restaurants/new">
          <button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
            + Onboard New Client
          </button>
        </Link>
      </div>

      {/* 6 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((st, idx) => {
          const Icon = st.icon;
          return (
            <Card key={idx} className="hover:border-amber-200 transition-all">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">{st.title}</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">{st.value}</h3>
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> {st.subtext}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl ${st.color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Package Breakdown Charts & Active Admins Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Chart: Monthly Subscription Collection by Package */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  Monthly Subscription Revenue by Package
                </CardTitle>
                <CardDescription className="text-xs">
                  Recurring revenue generated per subscription package tier
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-emerald-600" /> UPI: {upiCount}
                </span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  <Banknote className="w-3 h-3 text-amber-600" /> Cash: {cashCount}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packageChartData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [
                    formatINR(Number(value) || 0),
                    'Monthly Revenue',
                  ]}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {packageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right Panel: Active Restaurants & Their Packages */}
        <Card>
          <CardHeader className="pb-3 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold flex items-center justify-between text-gray-900">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" /> Outlets & Packages
              </span>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {restaurants.length} Registered
              </span>
            </CardTitle>
            <CardDescription className="text-xs">Active restaurants with subscribed packages & payment modes</CardDescription>
          </CardHeader>
          <CardContent className="p-3 space-y-2.5 max-h-[340px] overflow-y-auto no-scrollbar">
            {restaurants.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500 font-medium">
                No restaurant outlets registered yet.
              </div>
            ) : (
              restaurants.map((rest) => {
                const pkg = resolvePackage(rest);
                const isActive = rest.status === 'ACTIVE';

                return (
                  <div
                    key={rest.id}
                    className="p-2.5 rounded-xl border border-gray-100 bg-white shadow-2xs hover:border-gray-200 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200/60 shrink-0">
                          {rest.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate leading-tight">{rest.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{rest.ownerName} • {rest.city}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {isActive ? 'ACTIVE' : rest.status}
                      </span>
                    </div>

                    {/* Package & Payment Badges */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-50 text-xs">
                      {pkg === 'BOTH' && (
                        <span className="font-medium text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[11px] flex items-center gap-1">
                          ⚡ Both POS & Scanner (₹899)
                        </span>
                      )}
                      {pkg === 'POS_ONLY' && (
                        <span className="font-medium text-blue-900 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-[11px] flex items-center gap-1">
                          🖥️ POS Only (₹499)
                        </span>
                      )}
                      {pkg === 'SCANNER_ONLY' && (
                        <span className="font-medium text-purple-900 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded text-[11px] flex items-center gap-1">
                          📱 Scanner Only (₹499)
                        </span>
                      )}

                      <span className="font-medium text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded text-[11px] border border-gray-200">
                        {rest.paymentMode || 'UPI'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3 SaaS Packages Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Package 1: POS Only */}
        <Card className="border-blue-200/70 bg-gradient-to-b from-blue-50/20 to-white hover:border-blue-300 transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xl">🖥️</span>
              <span className="text-xs font-semibold bg-blue-500 text-white px-2.5 py-0.5 rounded-full">
                ₹499 / Month
              </span>
            </div>
            <CardTitle className="text-sm font-semibold text-gray-900 mt-2">
              Counter POS Only Plan
            </CardTitle>
            <CardDescription className="text-xs">
              For takeaways, fast food counters & cafés with counter ordering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="bg-white p-2.5 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Active Clients:</span>
              <strong className="text-blue-900 font-bold">{posOnlyCount} Outlets</strong>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-blue-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Monthly Collection:</span>
              <strong className="text-blue-900 font-bold">{formatINR(monthlyPosRevenue)}</strong>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 pt-1">
              <li>✓ Fast counter billing</li>
              <li>✓ Thermal receipts</li>
              <li>✓ Customer Khata (Credit) ledger</li>
              <li>✓ Table QR Scanner hidden</li>
            </ul>
          </CardContent>
        </Card>

        {/* Package 2: Scanner Only */}
        <Card className="border-purple-200/70 bg-gradient-to-b from-purple-50/20 to-white hover:border-purple-300 transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xl">📱</span>
              <span className="text-xs font-semibold bg-purple-500 text-white px-2.5 py-0.5 rounded-full">
                ₹499 / Month
              </span>
            </div>
            <CardTitle className="text-sm font-semibold text-gray-900 mt-2">
              Table QR Scanner Only Plan
            </CardTitle>
            <CardDescription className="text-xs">
              For dine-in restaurants & hotel rooms where guests scan & order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="bg-white p-2.5 rounded-lg border border-purple-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Active Clients:</span>
              <strong className="text-purple-900 font-bold">{scannerOnlyCount} Outlets</strong>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-purple-100 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Monthly Collection:</span>
              <strong className="text-purple-900 font-bold">{formatINR(monthlyScannerRevenue)}</strong>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 pt-1">
              <li>✓ QR stands for tables & rooms</li>
              <li>✓ Name & Phone customer ordering</li>
              <li>✓ Live Kitchen Display Station (KDS)</li>
              <li>✓ Single consolidated bill merging</li>
            </ul>
          </CardContent>
        </Card>

        {/* Package 3: Both POS & Scanner */}
        <Card className="border-amber-200 bg-gradient-to-b from-amber-50/30 to-white hover:border-amber-300 transition-all shadow-xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xl">⚡</span>
              <span className="text-xs font-semibold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                ₹899 / Month • Best Value
              </span>
            </div>
            <CardTitle className="text-sm font-semibold text-gray-900 mt-2">
              Both POS & Scanner (Combo)
            </CardTitle>
            <CardDescription className="text-xs">
              Complete restaurant operating system for dine-in & counter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Active Clients:</span>
              <strong className="text-amber-900 font-bold">{bothPlanCount} Outlets</strong>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Monthly Collection:</span>
              <strong className="text-amber-900 font-bold">{formatINR(monthlyBothRevenue)}</strong>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 pt-1">
              <li>✓ All POS features + All Scanner features</li>
              <li>✓ Live Kitchen Display (KDS) integration</li>
              <li>✓ Table management & single consolidated bill</li>
              <li>✓ Multi-terminal live socket sync</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
