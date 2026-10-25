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
  Trash2,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/lib/context/app-context';
import { formatDate, formatINR } from '@/lib/utils';
import { DataTable, Column } from '@/components/ui/data-table';
import { Order, Restaurant } from '@/types';
import { RestaurantTablesModal } from '@/components/super-admin/restaurant-tables-modal';
import Swal from 'sweetalert2';

import { API_URL } from '@/lib/config';

export default function RestaurantDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { restaurants, orders, updateRestaurantStatus, updateRestaurant, deleteRestaurant } = useApp();

  const restId = (params?.id as string) || '';
  const contextRest = restaurants.find((r) => r.id === restId);
  const [liveRestaurant, setLiveRestaurant] = React.useState<Restaurant | null>(contextRest || null);
  const [isLoading, setIsLoading] = React.useState(!contextRest);
  const [showTablesModal, setShowTablesModal] = React.useState(false);

  React.useEffect(() => {
    if (contextRest) {
      setLiveRestaurant(contextRest);
    }
  }, [contextRest]);

  React.useEffect(() => {
    if (!restId) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      fetch(`${API_URL}/restaurants/${restId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data?.restaurant) {
            const r = resData.data.restaurant;
            setLiveRestaurant({
              id: r._id || r.id,
              name: r.name,
              ownerName: r.ownerName,
              email: r.email,
              phone: r.phone,
              address: r.address,
              city: r.city,
              status: r.status,
              ordersCount: r.metrics?.totalOrders || 0,
              salesTotal: r.metrics?.totalRevenue || 0,
              activeMenuCount: 0,
              hasTableQrOrdering: r.tableQrEnabled !== undefined ? r.tableQrEnabled : (r.hasTableQrOrdering ?? true),
              createdAt: r.createdAt,
            });
          }
        })
        .catch((err) => console.error('Failed to fetch restaurant details:', err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [restId]);

  const restaurant = liveRestaurant || contextRest || restaurants[0];

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

          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-red-600 hover:bg-red-50 hover:text-red-700 font-bold border border-red-200"
            onClick={() => {
              Swal.fire({
                title: 'Delete Restaurant?',
                html: `Are you sure you want to permanently delete <b>${restaurant.name}</b>?<br/><span class="text-xs text-red-500 font-semibold">This will delete all associated menus, orders, and user logins.</span>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, Delete',
                cancelButtonText: 'Cancel',
                customClass: {
                  popup: 'rounded-3xl font-sans',
                  title: 'font-black text-gray-900',
                },
              }).then(async (result) => {
                if (result.isConfirmed) {
                  const deleted = await deleteRestaurant(restaurant.id);
                  if (deleted) {
                    router.push('/super-admin/restaurants');
                  }
                }
              });
            }}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
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

            {/* Feature Access & Module Permissions (RBAC) */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <p className="text-gray-900 font-bold text-xs flex items-center justify-between">
                <span>Modules & Permissions</span>
                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-black">SUPER ADMIN</span>
              </p>
              
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <span>📱 Table QR Ordering</span>
                    {restaurant.hasTableQrOrdering ? (
                      <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">ENABLED</span>
                    ) : (
                      <span className="text-[9px] font-black bg-gray-200 text-gray-600 px-1.5 py-0.2 rounded-full">DISABLED</span>
                    )}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Table-based QR codes, digital self-ordering and live customer tracking.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = !restaurant.hasTableQrOrdering;
                    await updateRestaurant(restaurant.id, { hasTableQrOrdering: nextVal, tableQrEnabled: nextVal });
                    setLiveRestaurant((prev) => prev ? { ...prev, hasTableQrOrdering: nextVal } : null);
                    Swal.fire({
                      icon: nextVal ? 'success' : 'info',
                      title: nextVal ? 'Table QR Ordering Enabled!' : 'Table QR Ordering Disabled',
                      text: nextVal 
                        ? `Restaurant "${restaurant.name}" now has access to Tables & QR Scanner Ordering in their sidebar.` 
                        : `Table QR Ordering has been hidden and disabled for "${restaurant.name}".`,
                      timer: 3000,
                      showConfirmButton: false,
                      customClass: { popup: 'rounded-2xl font-sans' }
                    });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs ${
                    restaurant.hasTableQrOrdering
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {restaurant.hasTableQrOrdering ? 'Disable' : 'Enable'}
                </button>
              </div>

              {/* Direct Table & QR Stand Management Button */}
              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTablesModal(true)}
                  className="w-full text-xs font-bold text-purple-700 bg-purple-50/70 hover:bg-purple-100 border border-purple-200 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-purple-600" />
                  <span>Manage Tables &amp; Print QR Stands</span>
                </Button>
              </div>
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

      {/* Super Admin Table Scanner & QR Stands Modal */}
      <RestaurantTablesModal
        restaurant={restaurant}
        isOpen={showTablesModal}
        onClose={() => setShowTablesModal(false)}
      />
    </div>
  );
}
