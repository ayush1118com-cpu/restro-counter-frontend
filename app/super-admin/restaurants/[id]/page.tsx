'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  IndianRupee,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  Ban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/lib/context/app-context';
import { formatDate, formatINR } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/data-table';
import { Order } from '@/types';

export default function RestaurantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { restaurants, orders, updateRestaurantStatus } = useApp();

  const restId = (params?.id as string) || 'rest_1';
  const restaurant = restaurants.find((r) => r.id === restId) || restaurants[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'SUSPENDED':
        return <Badge variant="warning">Suspended</Badge>;
      default:
        return <Badge variant="danger">Blocked</Badge>;
    }
  };

  const recentOrdersColumns: Column<Order>[] = [
    {
      header: 'Order #',
      cell: (o) => <span className="font-black text-amber-600">#{o.orderNumber}</span>,
    },
    {
      header: 'Items',
      cell: (o) => (
        <span className="text-gray-600 truncate max-w-xs block">
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
      header: 'Status',
      cell: (o) => <Badge variant={o.status === 'READY' || o.status === 'COMPLETED' ? 'success' : 'warning'}>{o.status}</Badge>,
    },
    {
      header: 'Date',
      cell: (o) => <span className="text-gray-500">{formatDate(o.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/super-admin/restaurants">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{restaurant.name}</h2>
              {getStatusBadge(restaurant.status)}
            </div>
            <p className="text-xs text-gray-500">Restaurant ID: {restaurant.id}</p>
          </div>
        </div>

        {/* Quick Action Status Toggles */}
        <div className="flex items-center gap-2">
          {restaurant.status !== 'ACTIVE' && (
            <Button
              variant="success"
              size="sm"
              onClick={() => updateRestaurantStatus(restaurant.id, 'ACTIVE')}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" /> Activate
            </Button>
          )}

          {restaurant.status !== 'SUSPENDED' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => updateRestaurantStatus(restaurant.id, 'SUSPENDED')}
            >
              <AlertTriangle className="w-4 h-4 mr-1" /> Suspend
            </Button>
          )}

          {restaurant.status !== 'BLOCKED' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => updateRestaurantStatus(restaurant.id, 'BLOCKED')}
            >
              <Ban className="w-4 h-4 mr-1" /> Block
            </Button>
          )}
        </div>
      </div>

      {/* Info Card + Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Info Sidebar */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" /> Restaurant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-gray-700">
            <div>
              <p className="text-gray-400 font-medium">Owner Name</p>
              <p className="font-bold text-gray-900 text-sm mt-0.5">{restaurant.ownerName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{restaurant.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{restaurant.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{restaurant.address}, {restaurant.city}</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between text-gray-500">
              <span>Onboarded Date:</span>
              <span className="font-semibold text-gray-900">{formatDate(restaurant.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* 4 Stat Boxes */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Today's Orders</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{orders.length}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Today's Sales</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {formatINR(orders.reduce((acc, o) => acc + o.total, 0))}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Total Lifetime Orders</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{restaurant.ordersCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">Active Menu Items</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{restaurant.activeMenuCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Utensils className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Recent Restaurant Orders</h3>
        <DataTable columns={recentOrdersColumns} data={orders} emptyTitle="No recent orders found" />
      </div>
    </div>
  );
}
